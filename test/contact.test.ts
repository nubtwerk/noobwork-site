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

  it("flags honeypot submissions out-of-band, leaking no data field", () => {
    const result = parseContactPayload({
      name: "Bot",
      email: "bot@spam.io",
      message: "Buy cheap watches now please click",
      website: "http://spam.test",
    });
    expect("honeypot" in result && result.honeypot).toBe(true);
    expect("data" in result).toBe(false);
  });

  it('does not mistake a real visitor named "spam" for a bot', () => {
    const result = parseContactPayload({
      name: "spam",
      email: "real@person.no",
      message: "Genuinely interested in a partnership for the spring campaign.",
    });
    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.name).toBe("spam");
    }
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

  it("posts a correctly-shaped email to Resend when configured", async () => {
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

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");

    const sent = JSON.parse(init?.body as string);
    expect(sent.to).toEqual(["joachim@noobwork.no"]);
    expect(sent.reply_to).toBe("alex@brand.no");
    expect(sent.subject).toContain("Nordic Fit");
    expect(sent.subject).toContain("Alex Brand");
    expect(sent.text).toContain("We would love to explore a Q3 campaign");
    expect(sent.text).toContain("alex@brand.no");
  });
});
