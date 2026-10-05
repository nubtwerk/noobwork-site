import { afterEach, describe, expect, it, vi } from "vitest";
import { isChallengeVisible } from "@/data/challenge";
import { challengeNow, DEMO_NOW, isChallengeDemo } from "@/lib/challenge/env";
import { sendJoinConfirmation, sendRunnerLink } from "@/lib/challenge/email";
import { adminSessionValue, createRunnerToken, verifyRunnerToken } from "@/lib/challenge/tokens";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("challenge production boundary", () => {
  it("disables public demo tokens, clock and launch bypass outside Vercel", () => {
    const preview = createRunnerToken("synthetic");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("CHALLENGE_SECRET", "");
    expect(isChallengeDemo()).toBe(false);
    expect(isChallengeVisible()).toBe(false);
    expect(challengeNow()).not.toBe(DEMO_NOW);
    expect(verifyRunnerToken(preview)).toBeUndefined();
    expect(adminSessionValue("preview")).toBeUndefined();
    expect(() => createRunnerToken("real")).toThrow("CHALLENGE_NOT_CONFIGURED");
  });

  it("preserves explicit Vercel previews during a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(isChallengeDemo()).toBe(true);
    expect(isChallengeVisible()).toBe(true);
    expect(challengeNow()).toBe(DEMO_NOW);
  });

  it.each(["", "short", " ".repeat(32)])("requires a strong dedicated key with hosted data: %j", (secret) => {
    vi.stubEnv("SEASON_DB_SECRET", "s".repeat(32));
    vi.stubEnv("CHALLENGE_SECRET", secret);
    vi.stubEnv("SEASON_FOLLOW_SECRET", "f".repeat(32));
    vi.stubEnv("RESEND_API_KEY", "re_unrelated_provider_key");
    expect(() => createRunnerToken("real")).toThrow("CHALLENGE_NOT_CONFIGURED");
    expect(adminSessionValue("admin-password")).toBeUndefined();
  });

  it("round-trips hosted tokens with a dedicated key and invalidates after rotation", () => {
    vi.stubEnv("SEASON_DB_SECRET", "s".repeat(32));
    vi.stubEnv("CHALLENGE_SECRET", "c".repeat(32));
    const token = createRunnerToken("real");
    expect(verifyRunnerToken(token)).toBe("real");
    vi.stubEnv("CHALLENGE_SECRET", "d".repeat(32));
    expect(verifyRunnerToken(token)).toBeUndefined();
  });
});

describe("challenge sender", () => {
  it.each(["", "   "])("falls back for blank Season sender %j", async (sender) => {
    vi.stubEnv("SEASON_DB_SECRET", "s".repeat(32));
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("SEASON_FROM_EMAIL", sender);
    vi.stubEnv("CONTACT_FROM_EMAIL", "Noobwork <contact@example.com>");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await sendJoinConfirmation("synthetic@example.com", "https://example.com/confirm");
    await sendRunnerLink("synthetic@example.com", "Synthetic", "https://example.com/me");
    expect(vi.mocked(fetch).mock.calls.map(([, init]) => JSON.parse(String(init?.body)).from)).toEqual([
      "Noobwork <contact@example.com>", "Noobwork <contact@example.com>",
    ]);
  });
});
