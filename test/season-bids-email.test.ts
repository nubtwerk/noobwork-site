import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendMail } from "@/lib/season-bids/email";

beforeEach(() => {
  vi.stubEnv("CONTACT_EMAIL_MODE", "");
  vi.stubEnv("RESEND_API_KEY", "synthetic-test-key");
  vi.stubEnv("CONTACT_FROM_EMAIL", "Contact <contact@example.com>");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Season bidding email sender", () => {
  it.each([
    ["Season <season@example.com>", "Season <season@example.com>"],
    [undefined, "Contact <contact@example.com>"],
    ["", "Contact <contact@example.com>"],
    ["   ", "Contact <contact@example.com>"],
  ])("uses the Season sender when configured and otherwise the contact sender", async (override, expected) => {
    vi.stubEnv("SEASON_FROM_EMAIL", override);
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendMail({ to: "bidder@example.com", subject: "Synthetic bid", text: "Test only" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(request.body)).toMatchObject({ from: expected, to: ["bidder@example.com"] });
  });
});
