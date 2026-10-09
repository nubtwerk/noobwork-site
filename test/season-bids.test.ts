import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { seasonBidding } from "@/data/season";
import { closesAt, emailMatchesWebsite, parseBidInput, publicSpotBids } from "@/lib/season-bids/rules";
import { confirmBid, decideBid, placeBid, publicBoard } from "@/lib/season-bids/service";
import { createMemoryStore } from "@/lib/season-bids/store";
import type { Bid } from "@/lib/season-bids/types";
import { checkPassword, createSession, verifySession } from "@/lib/season-bids/admin-auth";

const SITE = "https://www.noobwork.no";
const BEFORE = new Date("2026-11-01T00:00:00Z");
const CLOSE = new Date(seasonBidding.closesAt).getTime();

const input = (over: Record<string, unknown> = {}) => ({
  spotId: "banner-1", amount: 3000, brand: "Northlight", category: "AI and creator tools",
  website: "https://northlight.ai", contactName: "Ada Lee", email: "ada@northlight.ai", ...over,
});

function bid(over: Partial<Bid>): Bid {
  return {
    id: over.id ?? Math.random().toString(36).slice(2), spotId: "banner-1", amount: 2500, brand: "Brand", category: "Other",
    website: "brand.com", contactName: "C", email: "c@brand.com", showName: false, status: "approved", tokenHash: null,
    createdAt: "2026-10-10T00:00:00Z", confirmedAt: "2026-10-10T00:00:00Z", decidedAt: null, ...over,
  };
}

/** Pulls the confirm token out of the last email sent through the fetch mock. */
function lastConfirmToken(): string {
  const calls = vi.mocked(fetch).mock.calls;
  const body = JSON.parse(String(calls[calls.length - 1][1]?.body)) as { text: string };
  return new URL(body.text.match(/https:\/\/\S+/)![0]).searchParams.get("token")!;
}

const mailsTo = () => vi.mocked(fetch).mock.calls.map((call) => (JSON.parse(String(call[1]?.body)) as { to: string[] }).to[0]);

beforeEach(() => {
  process.env.RESEND_API_KEY = "re_test";
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("{}", { status: 200 })));
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
  delete process.env.SEASON_ADMIN_PASSWORD;
});

describe("bid input", () => {
  it("accepts a work email on the brand's domain", () => {
    expect(parseBidInput(input({ showName: true }))).toMatchObject({ data: { amount: 3000, showName: true, email: "ada@northlight.ai" } });
    expect(parseBidInput(input({ amount: "$3,250" }))).toMatchObject({ data: { amount: 3250 } });
  });

  it("refuses personal email, mismatched domains and junk", () => {
    expect(parseBidInput(input({ email: "ada@gmail.com" }))).toMatchObject({ error: expect.stringContaining("work email") });
    expect(parseBidInput(input({ email: "ada@other.com" }))).toMatchObject({ error: expect.stringContaining("same domain") });
    expect(parseBidInput(input({ category: "Supplements" }))).toMatchObject({ error: expect.any(String) });
    expect(parseBidInput(input({ amount: 25.5 }))).toMatchObject({ error: expect.any(String) });
    expect(parseBidInput(input({ amount: 9_000_000 }))).toMatchObject({ error: expect.any(String) });
    expect(parseBidInput(input({ spotId: "season-partner" }))).toMatchObject({ error: "This spot is not taking bids." });
    expect(parseBidInput(input({ brand: "A\nB" }))).toMatchObject({ error: expect.any(String) });
    expect(parseBidInput(input({ company_url: "bot" }))).toEqual({ honeypot: true });
  });

  it("matches subdomains either way", () => {
    expect(emailMatchesWebsite("a@mail.brand.com", "www.brand.com")).toBe(true);
    expect(emailMatchesWebsite("a@brand.com", "shop.brand.com")).toBe(true);
    expect(emailMatchesWebsite("a@brand.com", "notbrand.com")).toBe(false);
  });
});

describe("auction rules", () => {
  it("extends the close when a bid is confirmed in the final window, and chains", () => {
    const window = seasonBidding.extensionMinutes * 60_000;
    const late = new Date(CLOSE - 60_000).toISOString();
    const later = new Date(CLOSE + window - 60_000).toISOString();
    expect(closesAt([], "banner-1").getTime()).toBe(CLOSE);
    expect(closesAt([bid({ confirmedAt: late })], "banner-1").getTime()).toBe(CLOSE - 60_000 + window);
    expect(closesAt([bid({ confirmedAt: late }), bid({ confirmedAt: later })], "banner-1").getTime()).toBe(CLOSE + 2 * window - 60_000);
    expect(closesAt([bid({ confirmedAt: late, status: "rejected" })], "banner-1").getTime()).toBe(CLOSE);
  });

  it("shows only approved bids, labelled by category unless the brand opted in", () => {
    const spot = { id: "banner-1", openingBid: 2500 } as Parameters<typeof publicSpotBids>[0];
    const view = publicSpotBids(spot, [
      bid({ amount: 3000, brand: "Shown", showName: true }),
      bid({ amount: 2750, brand: "Hidden", category: "Gyms and training" }),
      bid({ amount: 9000, status: "pending" }),
      bid({ amount: 9500, status: "rejected" }),
    ], BEFORE);
    expect(view.bids).toEqual([
      expect.objectContaining({ label: "Shown", amount: 3000 }),
      expect.objectContaining({ label: "Gyms and training", amount: 2750 }),
    ]);
    expect(view.minNextBid).toBe(3000 + seasonBidding.minRaise);
    expect(JSON.stringify(view)).not.toContain("@");
  });
});

describe("bid flow", () => {
  it("place, confirm, approve, outbid email, winner", async () => {
    const store = createMemoryStore();
    const first = parseBidInput(input({ showName: true }));
    if (!("data" in first)) throw new Error("bad input");
    expect(await placeBid(store, first.data, SITE, BEFORE)).toEqual({ ok: true, value: undefined });
    expect((await publicBoard(store, BEFORE)).find((s) => s.spotId === "banner-1")?.bids).toHaveLength(0);

    const token = lastConfirmToken();
    const confirmed = await confirmBid(store, token, SITE, BEFORE);
    expect(confirmed).toMatchObject({ ok: true, value: { status: "pending" } });
    expect(mailsTo()).toContain("joachim@noobwork.no");
    expect(await confirmBid(store, token, SITE, BEFORE)).toMatchObject({ ok: false, status: 404 });
    if (!confirmed.ok) throw new Error("not confirmed");
    expect(await decideBid(store, confirmed.value.id, "approve", SITE, BEFORE)).toMatchObject({ ok: true });

    // Too low a second bid is refused before anything is stored.
    const low = parseBidInput(input({ email: "bo@rival.com", website: "rival.com", brand: "Rival", amount: 3100 }));
    if (!("data" in low)) throw new Error("bad input");
    expect(await placeBid(store, low.data, SITE, BEFORE)).toMatchObject({ ok: false, status: 409 });

    const second = parseBidInput(input({ email: "bo@rival.com", website: "rival.com", brand: "Rival", amount: 3250 }));
    if (!("data" in second)) throw new Error("bad input");
    await placeBid(store, second.data, SITE, BEFORE);
    const rival = await confirmBid(store, lastConfirmToken(), SITE, BEFORE);
    if (!rival.ok) throw new Error("not confirmed");
    vi.mocked(fetch).mockClear();
    await decideBid(store, rival.value.id, "approve", SITE, BEFORE);
    expect(mailsTo()).toEqual(["ada@northlight.ai"]);

    const board = (await publicBoard(store, BEFORE)).find((s) => s.spotId === "banner-1");
    expect(board?.bids.map((b) => b.label)).toEqual(["AI and creator tools", "Northlight"]);
    expect(await decideBid(store, rival.value.id, "winner", SITE, BEFORE)).toMatchObject({ ok: true });
    expect((await publicBoard(store, BEFORE)).find((s) => s.spotId === "banner-1")).toMatchObject({ hasWinner: true, isOpen: false });
    expect(await placeBid(store, second.data, SITE, BEFORE)).toMatchObject({ ok: false, status: 409 });
  });

  it("refuses an approval that a higher approved bid has overtaken", async () => {
    const store = createMemoryStore([bid({ id: "top", amount: 4000 }), bid({ id: "stale", amount: 3000, status: "pending" })]);
    expect(await decideBid(store, "stale", "approve", SITE, BEFORE)).toEqual({ ok: false, status: 409, error: "below-minimum" });
  });

  it("refuses bids after the close", async () => {
    const store = createMemoryStore();
    const parsed = parseBidInput(input());
    if (!("data" in parsed)) throw new Error("bad input");
    expect(await placeBid(store, parsed.data, SITE, new Date(CLOSE + 1000))).toMatchObject({ ok: false, status: 409 });
  });

  it("expires confirm links after 48 hours", async () => {
    const store = createMemoryStore();
    const parsed = parseBidInput(input());
    if (!("data" in parsed)) throw new Error("bad input");
    await placeBid(store, parsed.data, SITE, BEFORE);
    store.bids[0].createdAt = new Date(Date.now() - 49 * 3_600_000).toISOString();
    expect(await confirmBid(store, lastConfirmToken(), SITE, new Date())).toMatchObject({ ok: false, status: 410 });
  });
});

describe("admin session", () => {
  it("needs a real password and a valid signed cookie", () => {
    process.env.SEASON_ADMIN_PASSWORD = "short";
    expect(checkPassword("short")).toBe(false);
    process.env.SEASON_ADMIN_PASSWORD = "correct horse battery";
    expect(checkPassword("correct horse battery")).toBe(true);
    expect(checkPassword("wrong")).toBe(false);
    const { value } = createSession();
    expect(verifySession(value)).toBe(true);
    expect(verifySession(value.replace(/.$/, (c) => (c === "a" ? "b" : "a")))).toBe(false);
    expect(verifySession(value, Date.now() + 13 * 3_600_000)).toBe(false);
    process.env.SEASON_ADMIN_PASSWORD = "another long password";
    expect(verifySession(value)).toBe(false);
  });
});

describe("pricing floor", () => {
  it("never opens a recurring spot below $1,000 a month", async () => {
    const { seasonSpots } = await import("@/data/season");
    for (const spot of seasonSpots.filter((s) => s.board === "banner" || s.id === "apparel")) {
      expect(spot.openingBid).toBeGreaterThanOrEqual(3_000);
    }
  });
});
