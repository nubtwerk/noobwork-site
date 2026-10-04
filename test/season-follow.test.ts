import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as follow } from "@/app/api/season/follow/route";
import { POST as confirm } from "@/app/api/season/follow/confirm/route";
import { __resetRateLimitStore } from "@/lib/rate-limit";
import { FOLLOW_TOKEN_TTL_MS, createFollowToken, normalizeFollowEmail, verifyFollowToken } from "@/lib/season-follow";

const ok = () => new Response(JSON.stringify({ id: "x" }), { status: 200 });

function json(body: unknown, ip = "1.2.3.4", headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/season/follow", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function confirmPost(token: string, ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/season/follow/confirm", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": ip },
    body: new URLSearchParams({ t: token }).toString(),
  });
}

function calls() {
  return vi.mocked(fetch).mock.calls.map(([url, init]) => ({ url: String(url), method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : undefined }));
}

beforeEach(() => {
  __resetRateLimitStore();
  process.env.RESEND_API_KEY = "re_test_key";
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => ok()));
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_SEASON_SEGMENT_ID;
  delete process.env.SEASON_FOLLOW_SECRET;
});

describe("follow tokens", () => {
  it("round-trips a normalised email", () => {
    expect(verifyFollowToken(createFollowToken("fan@example.com"))).toBe("fan@example.com");
    expect(normalizeFollowEmail("  Fan@Example.COM ")).toBe("fan@example.com");
  });

  it("rejects tampered, foreign and expired tokens", () => {
    const token = createFollowToken("fan@example.com");
    const [, issued, sig] = token.split(".");
    expect(verifyFollowToken(`${Buffer.from("evil@example.com").toString("base64url")}.${issued}.${sig}`)).toBeUndefined();
    expect(verifyFollowToken("a.b")).toBeUndefined();
    expect(verifyFollowToken(createFollowToken("fan@example.com", Date.now() - FOLLOW_TOKEN_TTL_MS - 1))).toBeUndefined();
    process.env.SEASON_FOLLOW_SECRET = "different";
    expect(verifyFollowToken(token)).toBeUndefined();
  });

  it("cannot be created or verified without a key", () => {
    delete process.env.RESEND_API_KEY;
    expect(() => createFollowToken("fan@example.com")).toThrow("FOLLOW_NOT_CONFIGURED");
  });
});

describe("POST /api/season/follow", () => {
  it("emails a confirmation link and adds nobody yet", async () => {
    const res = await follow(json({ email: "Fan@Example.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const [sent] = calls();
    expect(calls()).toHaveLength(1);
    expect(sent.url).toBe("https://api.resend.com/emails");
    expect(sent.body.to).toEqual(["fan@example.com"]);
    const link = /http:\/\/localhost\/follow\/confirm\?t=(\S+)/.exec(sent.body.text);
    expect(link).not.toBeNull();
    expect(verifyFollowToken(decodeURIComponent(link![1]))).toBe("fan@example.com");
  });

  it("rejects a bad email, a cross-site post and non-form content", async () => {
    expect((await follow(json({ email: "nope" }))).status).toBe(400);
    expect((await follow(json({ email: "fan@example.com" }, "1.1.1.1", { origin: "https://evil.example" }))).status).toBe(403);
    const text = new Request("http://localhost/api/season/follow", { method: "POST", headers: { "content-type": "text/plain" }, body: "x" });
    expect((await follow(text)).status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("quietly drops honeypot submissions", async () => {
    const res = await follow(json({ email: "fan@example.com", website: "spam.example" }));
    expect(res.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("limits confirmation emails to one address", async () => {
    for (let i = 0; i < 3; i++) expect((await follow(json({ email: "target@example.com" }, `10.0.0.${i}`))).status).toBe(200);
    expect((await follow(json({ email: "target@example.com" }, "10.0.0.9"))).status).toBe(429);
  });

  it("redirects native posts with a result code and no email in the URL", async () => {
    const res = await follow(new Request("http://localhost/api/season/follow", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "email=fan%40example.com",
    }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://localhost/season?follow=sent#follow");
  });

  it("reports unavailable when Resend is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const res = await follow(json({ email: "fan@example.com" }));
    expect(res.status).toBe(503);
  });

  it("reports a provider failure without leaking details", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 500 }));
    const res = await follow(json({ email: "fan@example.com" }));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("fan@example.com");
  });
});

describe("POST /api/season/follow/confirm", () => {
  it("adds the confirmed email to the season segment", async () => {
    process.env.RESEND_SEASON_SEGMENT_ID = "seg_123";
    const res = await confirm(confirmPost(createFollowToken("fan@example.com")));
    expect(res.headers.get("location")).toBe("http://localhost/season?follow=confirmed#follow");
    expect(calls()).toEqual([{ url: "https://api.resend.com/contacts", method: "POST", body: { email: "fan@example.com", unsubscribed: false, segments: [{ id: "seg_123" }] } }]);
  });

  it("resubscribes an existing contact", async () => {
    process.env.RESEND_SEASON_SEGMENT_ID = "seg_123";
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 409 }));
    const res = await confirm(confirmPost(createFollowToken("fan@example.com")));
    expect(res.headers.get("location")).toContain("follow=confirmed");
    expect(calls().map((c) => `${c.method} ${c.url}`)).toEqual([
      "POST https://api.resend.com/contacts",
      "PATCH https://api.resend.com/contacts/fan%40example.com",
      "POST https://api.resend.com/contacts/fan%40example.com/segments/seg_123",
    ]);
  });

  it("refuses a forged token", async () => {
    const res = await confirm(confirmPost("forged.token.value"));
    expect(res.headers.get("location")).toContain("follow=expired");
    expect(fetch).not.toHaveBeenCalled();
  });
});
