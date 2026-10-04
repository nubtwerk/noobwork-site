import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as join } from "@/app/api/season/challenge/join/route";
import { POST as confirm } from "@/app/api/season/challenge/confirm/route";
import { POST as logRun } from "@/app/api/season/challenge/result/route";
import { POST as remove } from "@/app/api/season/challenge/delete/route";
import { POST as adminLogin } from "@/app/api/season/challenge/admin/login/route";
import { POST as adminAction } from "@/app/api/season/challenge/admin/route";
import { GET as adminExport } from "@/app/api/season/challenge/admin/export/route";
import { __resetRateLimitStore } from "@/lib/rate-limit";
import { __resetChallengeStore, getChallengeStore } from "@/lib/challenge/store";
import { createRunnerToken } from "@/lib/challenge/tokens";

const ORIGIN = "https://noobwork.no";
const jsonReq = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}${path}`, { method: "POST", headers: { "Content-Type": "application/json", "x-real-ip": "1.2.3.4", ...headers }, body: JSON.stringify(body) });
const formReq = (path: string, body: Record<string, string>, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}${path}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "x-real-ip": "1.2.3.4", ...headers }, body: new URLSearchParams(body).toString() });
const valid = { email: "ada@example.com", name: "Ada L", country: "NO", adult: true, rules: true, newsletter: false };

beforeEach(() => {
  __resetRateLimitStore();
  __resetChallengeStore();
});
afterEach(() => vi.unstubAllEnvs());

async function joinAndConfirm(body = valid) {
  const res = await join(jsonReq("/api/season/challenge/join", body));
  const { previewLink } = (await res.json()) as { previewLink: string };
  const t = new URL(previewLink).searchParams.get("t")!;
  return confirm(formReq("/api/season/challenge/confirm", { t }));
}

describe("joining", () => {
  it("returns a preview link instead of emailing in demo mode, and confirming creates the runner", async () => {
    const res = await joinAndConfirm();
    expect(res.status).toBe(303);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/season/challenge/me");
    expect(location.searchParams.get("welcome")).toBe("1");
    const runner = await getChallengeStore()!.findParticipantByEmail("ada@example.com");
    expect(runner).toMatchObject({ displayName: "Ada L", country: "NO", prizeEligible: false });
  });

  it("writes nothing before the email is confirmed", async () => {
    await join(jsonReq("/api/season/challenge/join", valid));
    expect(await getChallengeStore()!.findParticipantByEmail("ada@example.com")).toBeUndefined();
  });

  it.each([
    [{ ...valid, email: "nope" }, "invalid_email"],
    [{ ...valid, name: "x" }, "invalid_name"],
    [{ ...valid, country: "ZZ" }, "invalid_country"],
    [{ ...valid, adult: false }, "consent"],
    [{ ...valid, rules: false }, "consent"],
    [{ ...valid, name: "Noobwork" }, "blocked_name"],
  ])("rejects bad input %#", async (body, code) => {
    const res = await join(jsonReq("/api/season/challenge/join", body));
    expect(await res.json()).toMatchObject({ code });
  });

  it("refuses a taken name, and resends the link to an existing email without saying so", async () => {
    await joinAndConfirm();
    const taken = await join(jsonReq("/api/season/challenge/join", { ...valid, email: "other@example.com", name: "ada l" }));
    expect(await taken.json()).toMatchObject({ code: "name_taken" });
    const again = await join(jsonReq("/api/season/challenge/join", { ...valid, name: "Different" }));
    const body = (await again.json()) as { ok: boolean; previewLink: string };
    expect(body.ok).toBe(true);
    expect(new URL(body.previewLink).pathname).toBe("/season/challenge/me");
  });

  it("redirects native form posts back to the section with only a result code", async () => {
    const res = await join(formReq("/api/season/challenge/join", { email: "secret@example.com", name: "x", country: "NO" }));
    const location = res.headers.get("location")!;
    expect(location).toBe(`${ORIGIN}/season?challenge=invalid_name#challenge`);
    expect(location).not.toContain("secret");
  });

  it("drops bot posts and cross-site posts", async () => {
    const bot = await join(jsonReq("/api/season/challenge/join", { ...valid, website: "spam" }));
    expect(await bot.json()).toEqual({ ok: true });
    const cross = await join(jsonReq("/api/season/challenge/join", valid, { origin: "https://evil.example" }));
    expect(cross.status).toBe(403);
  });

  it("is unavailable in production until a database is configured", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const res = await join(jsonReq("/api/season/challenge/join", valid));
    expect(res.status).toBe(503);
  });

  it("rejects an expired or forged confirm link", async () => {
    const res = await confirm(formReq("/api/season/challenge/confirm", { t: "join.forged.sig" }));
    expect(res.headers.get("location")).toBe(`${ORIGIN}/season?challenge=expired#challenge`);
  });
});

describe("logging runs", () => {
  async function runnerToken() {
    const res = await joinAndConfirm();
    return new URL(res.headers.get("location")!).searchParams.get("t")!;
  }
  const codeOf = (res: Response) => new URL(res.headers.get("location")!).searchParams.get("result");

  it("logs a run in the open window (the demo clock sits in the first retest)", async () => {
    const t = await runnerToken();
    const res = await logRun(formReq("/api/season/challenge/result", { t, time: "26:45", proof: "https://www.strava.com/activities/42" }));
    expect(codeOf(res)).toBe("saved");
    const results = await getChallengeStore()!.listResults();
    expect(results.find((r) => r.timeSeconds === 26 * 60 + 45)).toMatchObject({ windowId: "q1", proofKind: "strava", status: "self_reported" });
  });

  it("validates the time and the proof", async () => {
    const t = await runnerToken();
    expect(codeOf(await logRun(formReq("/api/season/challenge/result", { t, time: "fast", proof: "https://www.strava.com/activities/42" })))).toBe("invalid_time");
    expect(codeOf(await logRun(formReq("/api/season/challenge/result", { t, time: "26:45", proof: "strava" })))).toBe("invalid_proof");
  });

  it("holds a suspicious jump for review", async () => {
    const store = getChallengeStore()!;
    const t = await runnerToken();
    const me = (await store.findParticipantByEmail("ada@example.com"))!;
    await store.saveResult({ participantId: me.id, windowId: "baseline", timeSeconds: 40 * 60, proofUrl: "https://x", proofKind: "strava", status: "verified" });
    const res = await logRun(formReq("/api/season/challenge/result", { t, time: "25:00", proof: "https://www.strava.com/activities/42" }));
    expect(codeOf(res)).toBe("flagged");
  });

  it("rejects a forged runner link", async () => {
    const res = await logRun(formReq("/api/season/challenge/result", { t: createRunnerToken("nobody"), time: "26:45", proof: "https://www.strava.com/activities/42" }));
    expect(res.headers.get("location")).toBe(`${ORIGIN}/season?challenge=expired#challenge`);
  });

  it("lets a runner delete themselves and every run", async () => {
    const t = await runnerToken();
    await logRun(formReq("/api/season/challenge/result", { t, time: "26:45", proof: "https://www.strava.com/activities/42" }));
    const unconfirmed = await remove(formReq("/api/season/challenge/delete", { t }));
    expect(new URL(unconfirmed.headers.get("location")!).searchParams.get("delete")).toBe("confirm");
    const res = await remove(formReq("/api/season/challenge/delete", { t, confirm: "on" }));
    expect(res.headers.get("location")).toBe(`${ORIGIN}/season?challenge=deleted#challenge`);
    const store = getChallengeStore()!;
    expect(await store.findParticipantByEmail("ada@example.com")).toBeUndefined();
    expect((await store.listResults()).some((r) => r.timeSeconds === 26 * 60 + 45)).toBe(false);
  });
});

describe("admin", () => {
  async function login(password = "preview") {
    const res = await adminLogin(formReq("/api/season/challenge/admin/login", { password }));
    const cookie = res.headers.get("set-cookie") ?? "";
    return { res, cookie: cookie.split(";")[0] };
  }

  it("signs in with the password and sets a strict, http-only cookie", async () => {
    const bad = await login("wrong");
    expect(bad.res.headers.get("location")).toContain("login=failed");
    const { res, cookie } = await login();
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect(res.headers.get("set-cookie")).toMatch(/SameSite=strict/i);
    expect(cookie).toMatch(/^challenge_admin=/);
  });

  it("ignores the demo password once a real password is set", async () => {
    vi.stubEnv("SEASON_ADMIN_PASSWORD", "a-long-real-password");
    expect((await login("preview")).res.headers.get("location")).toContain("login=failed");
    expect((await login("a-long-real-password")).cookie).toMatch(/^challenge_admin=/);
  });

  it("verifies a run and exports winners only for a signed-in admin", async () => {
    const store = getChallengeStore()!;
    const flagged = (await store.listResults()).find((r) => r.status === "flagged")!;
    const anon = await adminAction(formReq("/api/season/challenge/admin", { action: "verify", id: flagged.id }));
    expect(anon.headers.get("location")).toContain("login=required");
    expect((await store.listResults()).find((r) => r.id === flagged.id)!.status).toBe("flagged");

    const { cookie } = await login();
    await adminAction(formReq("/api/season/challenge/admin", { action: "verify", id: flagged.id }, { cookie }));
    expect((await store.listResults()).find((r) => r.id === flagged.id)!.status).toBe("verified");

    expect((await adminExport(new Request(`${ORIGIN}/api/season/challenge/admin/export?window=q1`))).status).toBe(404);
    const csv = await adminExport(new Request(`${ORIGIN}/api/season/challenge/admin/export?window=q1`, { headers: { cookie } }));
    expect(csv.headers.get("content-type")).toContain("text/csv");
    const lines = (await csv.text()).trim().split("\n");
    expect(lines[0]).toContain('"email"');
    expect(lines.length).toBeGreaterThan(1);
  });
});
