import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseContactPayload, sendContactEmail } from "@/lib/contact";

describe("parseContactPayload", () => {
  it("accepts a valid partnership inquiry", () => {
    const result = parseContactPayload({
      name: "Alex Brand",
      email: "alex@brand.no",
      company: "Nordic Fit Co",
      message: "We would love to explore a Q3 campaign across YouTube and IG.",
    });
    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.name).toBe("Alex Brand");
      expect(result.data.company).toBe("Nordic Fit Co");
    }
  });

  it("rejects invalid email and short messages", () => {
    expect(parseContactPayload({ name: "A", email: "bad", message: "Hi" })).toEqual({
      error: "Please enter your name.",
    });
    expect(
      parseContactPayload({ name: "Alex", email: "bad", message: "Too short" })
    ).toEqual({ error: "Please enter a valid email." });
  });

  it("silently accepts honeypot submissions", () => {
    const result = parseContactPayload({
      name: "Bot",
      email: "bot@spam.io",
      message: "Buy cheap watches now please click",
      website: "http://spam.test",
    });
    expect("data" in result).toBe(true);
  });
});

describe("sendContactEmail", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("throws when Resend is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(
      sendContactEmail({
        name: "Alex",
        email: "alex@brand.no",
        message: "Partnership inquiry with enough detail for validation.",
      })
    ).rejects.toThrow("CONTACT_NOT_CONFIGURED");
  });

  it("posts to Resend when configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "joachim@noobwork.no";

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 })
    );

    await sendContactEmail({
      name: "Alex Brand",
      email: "alex@brand.no",
      company: "Nordic Fit",
      message: "We would love to explore a Q3 campaign across YouTube and IG.",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" })
    );
  });
});
