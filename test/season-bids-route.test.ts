import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET, POST } from "@/app/api/season/bids/route";
import { POST as CONFIRM } from "@/app/api/season/bids/confirm/route";
import { __resetRateLimitStore } from "@/lib/rate-limit";
import { __setBidStore, createMemoryStore } from "@/lib/season-bids/store";

const body = {
  spotId: "banner-2", amount: 3000, brand: "Northlight", category: "AI and creator tools",
  website: "northlight.ai", contactName: "Ada Lee", email: "ada@northlight.ai",
};
const post = (data: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/season/bids", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "5.5.5.5", ...headers },
    body: JSON.stringify(data),
  });

let store: ReturnType<typeof createMemoryStore>;
beforeEach(() => {
  __resetRateLimitStore();
  store = createMemoryStore();
  __setBidStore(store);
  process.env.CONTACT_EMAIL_MODE = "stub";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  __setBidStore(undefined);
  delete process.env.CONTACT_EMAIL_MODE;
});

describe("season bids API", () => {
  it("serves the public board without contact details", async () => {
    store.bids.push({ id: "a", spotId: "banner-2", amount: 3000, brand: "Secret", category: "Other", website: "s.com", contactName: "X", email: "x@s.com", showName: false, status: "approved", tokenHash: null, createdAt: "2026-10-10T00:00:00Z", confirmedAt: "2026-10-10T00:00:00Z", decidedAt: null });
    const res = await GET();
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(text).toContain("3000");
    expect(text).not.toContain("x@s.com");
    expect(text).not.toContain("Secret");
  });

  it("stores an unconfirmed bid that stays off the board", async () => {
    const res = await POST(post(body));
    expect(res.status).toBe(200);
    expect(store.bids).toHaveLength(1);
    expect(store.bids[0]).toMatchObject({ status: "unconfirmed", showName: false });
    expect(store.bids[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects cross-site posts, bad input and a closed store", async () => {
    expect((await POST(post(body, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await POST(post({ ...body, email: "ada@gmail.com" }))).status).toBe(400);
    __setBidStore(undefined);
    const prev = process.env.NODE_ENV;
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(post(body))).status).toBe(503);
    vi.stubEnv("NODE_ENV", prev ?? "test");
    vi.unstubAllEnvs();
  });

  it("confirms only through a POST with the token, then redirects", async () => {
    const res = await CONFIRM(new Request("http://localhost/api/season/bids/confirm", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "token=not-a-real-token-but-long-enough",
    }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("result=invalid");
  });

  it.each(["null", "https://evil.example"])("rejects confirmation from origin %s before reading the store", async (origin) => {
    const list = vi.spyOn(store, "list");
    const res = await CONFIRM(new Request("http://localhost/api/season/bids/confirm", {
      method: "POST",
      headers: { origin, "content-type": "application/x-www-form-urlencoded" },
      body: "token=not-a-real-token-but-long-enough",
    }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("result=invalid");
    expect(list).not.toHaveBeenCalled();
  });
});
