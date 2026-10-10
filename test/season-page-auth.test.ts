import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as unlock } from "@/app/api/season/unlock/route";
import {
  PAGE_COOKIE,
  checkPagePassword,
  createPageSession,
  pagePasswordConfigured,
  safeSeasonReturnPath,
  verifyPageSession,
} from "@/lib/season-page-auth";
import { challenge, isChallengeVisible } from "@/data/challenge";
import { __resetRateLimitStore } from "@/lib/rate-limit";

const ORIGIN = "https://noobwork.no";
const formReq = (body: Record<string, string>, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}/api/season/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "x-real-ip": "9.9.9.9", ...headers },
    body: new URLSearchParams(body).toString(),
  });

beforeEach(() => __resetRateLimitStore());
afterEach(() => {
  vi.unstubAllEnvs();
  delete process.env.SEASON_PAGE_PASSWORD;
});

describe("season page password", () => {
  it("fails closed when SEASON_PAGE_PASSWORD is unset", () => {
    expect(pagePasswordConfigured()).toBe(false);
    expect(checkPagePassword("Julia123")).toBe(false);
    expect(verifyPageSession("anything")).toBe(false);
  });

  it("accepts the configured password and issues a verifiable session", () => {
    process.env.SEASON_PAGE_PASSWORD = "Julia123";
    expect(pagePasswordConfigured()).toBe(true);
    expect(checkPagePassword("Julia123")).toBe(true);
    expect(checkPagePassword("wrong")).toBe(false);
    const { value, maxAge } = createPageSession();
    expect(maxAge).toBeGreaterThan(0);
    expect(verifyPageSession(value)).toBe(true);
    expect(verifyPageSession(value.replace(/.$/, (c) => (c === "a" ? "b" : "a")))).toBe(false);
    expect(verifyPageSession(value, Date.now() + 8 * 24 * 3_600_000)).toBe(false);
  });

  it("invalidates sessions after the password rotates", () => {
    process.env.SEASON_PAGE_PASSWORD = "Julia123";
    const { value } = createPageSession();
    process.env.SEASON_PAGE_PASSWORD = "OtherPass1";
    expect(verifyPageSession(value)).toBe(false);
  });

  it("only returns same-site Season viewer paths", () => {
    expect(safeSeasonReturnPath("/season/challenge/rules")).toBe("/season/challenge/rules");
    expect(safeSeasonReturnPath("/season/admin")).toBe("/season");
    expect(safeSeasonReturnPath("/season/admin/challenge")).toBe("/season");
    expect(safeSeasonReturnPath("https://evil.example/season")).toBe("/season");
    expect(safeSeasonReturnPath("//evil.example")).toBe("/season");
    expect(safeSeasonReturnPath("/media-kit")).toBe("/season");
  });
});

describe("season unlock route", () => {
  it("sets an HttpOnly cookie and redirects into Season on success", async () => {
    process.env.SEASON_PAGE_PASSWORD = "Julia123";
    const res = await unlock(formReq({ password: "Julia123", next: "/season/challenge/rules" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/season/challenge/rules`);
    const cookie = res.cookies.get(PAGE_COOKIE);
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(verifyPageSession(cookie?.value)).toBe(true);
  });

  it("rejects a wrong password without setting a session", async () => {
    process.env.SEASON_PAGE_PASSWORD = "Julia123";
    const res = await unlock(formReq({ password: "nope" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/season?unlock=1");
    expect(res.cookies.get(PAGE_COOKIE)?.value).toBeFalsy();
  });

  it("fails closed when the env var is unset", async () => {
    const res = await unlock(formReq({ password: "Julia123" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("unlock=1");
    expect(res.cookies.get(PAGE_COOKIE)?.value).toBeFalsy();
  });
});

describe("challenge launch flags", () => {
  it("is enabled with reviewed rules for production", () => {
    expect(challenge.enabled).toBe(true);
    expect(challenge.rulesReviewed).toBe(true);
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isChallengeVisible()).toBe(true);
  });
});
