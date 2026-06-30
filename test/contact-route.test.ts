import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/contact/route";
import { __resetRateLimitStore } from "@/lib/rate-limit";

const VALID = {
  name: "Alex Brand",
  email: "alex@brand.no",
  message: "We would love to explore a Q3 campaign across YouTube and IG.",
};

function post(body: unknown, ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  __resetRateLimitStore();
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_TO_EMAIL = "joachim@noobwork.no";
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "x" }), { status: 200 }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO_EMAIL;
});

describe("POST /api/contact", () => {
  it("returns 400 on an unparseable body", async () => {
    const res = await POST(post("not json", "9.0.0.1"));
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 on a validation error", async () => {
    const res = await POST(post({ name: "A", email: "bad", message: "hi" }, "9.0.0.2"));
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the email and returns ok for a valid submission", async () => {
    const res = await POST(post(VALID, "5.5.5.5"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("silently accepts a honeypot hit and never sends email", async () => {
    const res = await POST(post({ ...VALID, website: "http://bot.test" }, "6.6.6.6"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rate-limits a client after the window limit (429), blocking further sends", async () => {
    const ip = "7.7.7.7";
    for (let i = 0; i < 5; i++) {
      const ok = await POST(post(VALID, ip));
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(post(VALID, ip));
    expect(blocked.status).toBe(429);
    // The 6th request must not reach the email send.
    expect(fetch).toHaveBeenCalledTimes(5);
  });

  it("tracks the limit independently per client IP", async () => {
    for (let i = 0; i < 5; i++) await POST(post(VALID, "8.8.8.8"));
    const other = await POST(post(VALID, "9.9.9.9"));
    expect(other.status).toBe(200);
  });

  it("keys off trusted x-real-ip, so a rotating spoofed x-forwarded-for can't bypass", async () => {
    const withHeaders = (xff: string) =>
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-real-ip": "3.3.3.3",
          "x-forwarded-for": xff,
        },
        body: JSON.stringify(VALID),
      });
    for (let i = 0; i < 5; i++) {
      const ok = await POST(withHeaders(`10.0.0.${i}`));
      expect(ok.status).toBe(200);
    }
    // Same real IP, fresh spoofed forwarded-for — must still be throttled.
    const blocked = await POST(withHeaders("10.0.0.99"));
    expect(blocked.status).toBe(429);
  });
});
