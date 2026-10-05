import { afterEach, describe, expect, it, vi } from "vitest";
import { challenge, formatWindowDates, isChallengeVisible, openChallengeWindow } from "@/data/challenge";
import { assessSubmission, challengeStats, computeStandings, formatImprovement, publicBoard, windowWinners } from "@/lib/challenge/leaderboard";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { seasonDatabaseConfig } from "@/lib/challenge/env";
import { __resetChallengeStore, ChallengeConflict, createDemoStore, createSupabaseStore, getChallengeStore, type Participant, type RunResult } from "@/lib/challenge/store";
import { createJoinToken, createRunnerToken, JOIN_TOKEN_TTL_MS, verifyJoinToken, verifyRunnerToken } from "@/lib/challenge/tokens";
import { countryFlag, formatRunTime, normalizeCountry, parseDisplayName, parseProofUrl, parseRunTime } from "@/lib/challenge/validate";

afterEach(() => vi.unstubAllEnvs());

const runner = (id: string, extra: Partial<Participant> = {}): Participant => ({
  id, email: `${id}@example.com`, displayName: id, country: "NO", newsletter: false, isHost: false, hidden: false, prizeEligible: true, createdAt: "2026-12-20T00:00:00Z", ...extra,
});
const run = (participantId: string, windowId: RunResult["windowId"], timeSeconds: number, extra: Partial<RunResult> = {}): RunResult => ({
  id: `${participantId}-${windowId}`, participantId, windowId, timeSeconds, proofUrl: "https://www.strava.com/activities/1", proofKind: "strava", status: "verified", submittedAt: "2027-04-02T00:00:00Z", ...extra,
});

describe("challenge input", () => {
  it("parses run times in the forms people type", () => {
    expect(parseRunTime("24:31")).toBe(24 * 60 + 31);
    expect(parseRunTime("24.31")).toBe(24 * 60 + 31);
    expect(parseRunTime("1:02:10")).toBe(3730);
    expect(parseRunTime("24:75")).toBeUndefined();
    expect(parseRunTime("5:00")).toBeUndefined();
    expect(parseRunTime("3:00:00")).toBeUndefined();
    expect(parseRunTime("fast")).toBeUndefined();
    expect(formatRunTime(3730)).toBe("1:02:10");
    expect(formatRunTime(1471)).toBe("24:31");
  });

  it("accepts Strava activity links as prize-eligible proof and other https links as board-only", () => {
    expect(parseProofUrl("https://strava.com/activities/123/")).toEqual({ url: "https://www.strava.com/activities/123", kind: "strava" });
    expect(parseProofUrl("https://photos.example.com/x.jpg")?.kind).toBe("other");
    expect(parseProofUrl("http://www.strava.com/activities/1")).toBeUndefined();
    expect(parseProofUrl("javascript:alert(1)")).toBeUndefined();
    expect(parseProofUrl("https://user:pw@example.com")).toBeUndefined();
  });

  it("checks display names and blocks the obvious", () => {
    expect(parseDisplayName("  Minji   K ")).toEqual({ ok: true, name: "Minji K" });
    expect(parseDisplayName("민지")).toEqual({ ok: true, name: "민지" });
    expect(parseDisplayName("x")).toEqual({ ok: false, reason: "invalid" });
    expect(parseDisplayName("<script>")).toEqual({ ok: false, reason: "invalid" });
    expect(parseDisplayName("Sh1t runner")).toEqual({ ok: false, reason: "blocked" });
    expect(parseDisplayName("Real Noobwork")).toEqual({ ok: false, reason: "blocked" });
  });

  it("accepts known country codes only", () => {
    expect(normalizeCountry("kr")).toBe("KR");
    expect(normalizeCountry("ZZ")).toBeUndefined();
    expect(countryFlag("NO")).toBe("🇳🇴");
  });
});

describe("challenge windows", () => {
  it("opens each window from the 1st to the 14th, Korea time", () => {
    expect(openChallengeWindow(Date.parse("2027-01-01T00:30:00+09:00"))?.id).toBe("baseline");
    expect(openChallengeWindow(Date.parse("2027-01-14T23:59:00+09:00"))?.id).toBe("baseline");
    expect(openChallengeWindow(Date.parse("2027-01-15T00:00:01+09:00"))).toBeUndefined();
    expect(openChallengeWindow(Date.parse("2027-04-10T12:00:00Z"))?.id).toBe("q1");
    expect(formatWindowDates(challenge.windows[1])).toBe("1 to 14 April 2027");
  });

  it("stays out of production until enabled", () => {
    expect(challenge.enabled).toBe(false);
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isChallengeVisible()).toBe(false);
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(isChallengeVisible()).toBe(true);
  });
});

describe("challenge tokens", () => {
  it("round-trips a signup and expires it after a week", () => {
    const now = Date.parse("2026-12-20T00:00:00Z");
    const token = createJoinToken({ email: "a@example.com", name: "Ada", country: "NO", newsletter: true }, now);
    expect(verifyJoinToken(token, now + 1000)).toEqual({ email: "a@example.com", name: "Ada", country: "NO", newsletter: true });
    expect(verifyJoinToken(token, now + JOIN_TOKEN_TTL_MS + 1)).toBeUndefined();
  });

  it("rejects tampered and cross-kind tokens", () => {
    const token = createRunnerToken("abc");
    expect(verifyRunnerToken(token)).toBe("abc");
    const [kind, body, sig] = token.split(".");
    expect(verifyRunnerToken(`${kind}.${Buffer.from('{"id":"other"}').toString("base64url")}.${sig}`)).toBeUndefined();
    expect(verifyJoinToken(`join.${body}.${sig}`)).toBeUndefined();
  });

  it("refuses to sign anything in production without a secret", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("CHALLENGE_SECRET", "");
    vi.stubEnv("SEASON_FOLLOW_SECRET", "");
    vi.stubEnv("RESEND_API_KEY", "");
    expect(() => createRunnerToken("abc")).toThrow("CHALLENGE_NOT_CONFIGURED");
  });

  it("does not trust the preview key once a database is configured", () => {
    const previewToken = createRunnerToken("abc");
    vi.stubEnv("SEASON_DB_SECRET", "s".repeat(40));
    vi.stubEnv("CHALLENGE_SECRET", "a-real-secret");
    expect(verifyRunnerToken(previewToken)).toBeUndefined();
  });
});

describe("challenge standings", () => {
  const participants = [runner("fast"), runner("beginner"), runner("baseline-only"), runner("host", { isHost: true }), runner("hidden", { hidden: true })];
  const results = [
    run("fast", "baseline", 20 * 60), run("fast", "q1", 19 * 60),
    run("beginner", "baseline", 35 * 60), run("beginner", "q1", 30 * 60, { status: "self_reported" }),
    run("baseline-only", "baseline", 25 * 60),
    run("host", "baseline", 28 * 60), run("host", "q1", 26 * 60),
    run("hidden", "baseline", 30 * 60), run("hidden", "q1", 20 * 60),
  ];

  it("ranks improvement on the runner's own baseline, so a beginner can beat a fast runner", () => {
    const standings = computeStandings(participants, results);
    const ranked = standings.filter((s) => s.rank);
    expect(ranked[0].participant.id).toBe("hidden");
    const board = publicBoard(standings);
    expect(board.rows.map((s) => s.participant.id)).toEqual(["beginner", "fast", "baseline-only"]);
    expect(board.host?.participant.id).toBe("host");
    expect(board.rows[0].verified).toBe(false);
    expect(board.rows[1].verified).toBe(true);
    expect(board.rows[2].rank).toBeUndefined();
    expect(formatImprovement(board.rows[0].improvementPct!)).toBe("+14.3%");
  });

  it("never counts flagged or rejected runs", () => {
    const standings = computeStandings([runner("a")], [run("a", "baseline", 1500), run("a", "q1", 1000, { status: "flagged" })]);
    expect(standings[0].rank).toBeUndefined();
    expect(computeStandings([runner("a")], [run("a", "baseline", 1500, { status: "rejected" })])).toEqual([]);
  });

  it("holds big jumps and implausible times for review", () => {
    const earlier = [run("a", "baseline", 30 * 60)];
    expect(assessSubmission(earlier, "q1", 27 * 60)).toBe("self_reported");
    expect(assessSubmission(earlier, "q1", 21 * 60)).toBe("flagged");
    expect(assessSubmission([], "baseline", 12 * 60)).toBe("flagged");
    expect(assessSubmission([run("a", "baseline", 30 * 60), run("a", "q1", 27 * 60)], "q2", 25 * 60)).toBe("self_reported");
  });

  it("picks winners only from verified Strava runs by prize-eligible runners, never the host", () => {
    const winners = windowWinners(
      [...participants, runner("ineligible", { prizeEligible: false }), runner("treadmill")],
      [...results, run("ineligible", "baseline", 40 * 60), run("ineligible", "q1", 31 * 60), run("treadmill", "baseline", 40 * 60), run("treadmill", "q1", 33 * 60, { proofKind: "other" })],
      "q1",
    );
    expect(winners.map((s) => s.participant.id)).toEqual(["fast"]);
  });

  it("counts runners, countries and km for the sponsor numbers", () => {
    expect(challengeStats(participants, results)).toEqual({ participants: 4, countries: 1, totalKm: 35 });
  });
});

describe("challenge stores", () => {
  it("demo store enforces one email and one name, and replaces a window's run", async () => {
    const store = createDemoStore({ participants: [], results: [] });
    const p = await store.createParticipant({ email: "a@example.com", displayName: "Ada", country: "NO", newsletter: false });
    await expect(store.createParticipant({ email: "a@example.com", displayName: "Other", country: "NO", newsletter: false })).rejects.toBeInstanceOf(ChallengeConflict);
    await expect(store.createParticipant({ email: "b@example.com", displayName: "ADA", country: "NO", newsletter: false })).rejects.toMatchObject({ field: "name" });
    await store.saveResult({ participantId: p.id, windowId: "baseline", timeSeconds: 1500, proofUrl: "https://x", proofKind: "other", status: "self_reported" });
    await store.saveResult({ participantId: p.id, windowId: "baseline", timeSeconds: 1400, proofUrl: "https://x", proofKind: "other", status: "self_reported" });
    expect((await store.listResults()).map((r) => r.timeSeconds)).toEqual([1400]);
    await store.deleteParticipant(p.id);
    expect(await store.listResults()).toEqual([]);
  });

  it("demo seed fills the board past the threshold, host included", async () => {
    const store = createDemoStore();
    const participants = await store.listParticipants();
    expect(participants.length).toBeGreaterThanOrEqual(challenge.minParticipantsToShow);
    expect(participants.filter((p) => p.isHost)).toHaveLength(1);
  });

  it("supabase store calls the secret-gated functions with the publishable key and maps conflicts", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      if (calls.length === 1) return new Response(JSON.stringify({ id: "11111111-1111-4111-8111-111111111111", email: "a@example.com", display_name: "Ada", country: "NO", newsletter: true, is_host: false, hidden: false, prize_eligible: false, created_at: "x" }), { status: 200 });
      if (calls.length === 2) return new Response('{"message":"duplicate key value violates unique constraint \\"challenge_participants_name_key\\""}', { status: 409 });
      if (calls.length === 3) return new Response('{"message":"duplicate key value violates unique constraint \\"challenge_participants_email_key\\""}', { status: 409 });
      if (calls.length === 4) return new Response("null", { status: 200 });
      return new Response('{"message":"forbidden"}', { status: 403 });
    }) as unknown as typeof fetch;
    const store = createSupabaseStore("https://x.supabase.co/", "sb_publishable_key", "secret-value", fetchImpl);
    const p = await store.createParticipant({ email: "a@example.com", displayName: "Ada", country: "NO", newsletter: true });
    expect(p).toMatchObject({ displayName: "Ada", newsletter: true });
    expect(calls[0].url).toBe("https://x.supabase.co/rest/v1/rpc/challenge_participant_insert");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer sb_publishable_key");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({ p_secret: "secret-value", p_row: { display_name_key: "ada" } });
    await expect(store.createParticipant({ email: "b@example.com", displayName: "ada", country: "NO", newsletter: false })).rejects.toMatchObject({ field: "name" });
    await expect(store.createParticipant({ email: "a@example.com", displayName: "Bea", country: "NO", newsletter: false })).rejects.toMatchObject({ field: "email" });
    expect(await store.findParticipantByEmail("nobody@example.com")).toBeUndefined();
    await expect(store.listResults()).rejects.toThrow("SUPABASE_FAILED:403");
    expect(await store.getParticipant("not-a-uuid")).toBeUndefined();
    expect(calls).toHaveLength(5);
  });
});

describe("challenge database settings", () => {
  const ref = "swrxucguhqlilcjedcda";
  const valid = () => {
    vi.stubEnv("SEASON_SUPABASE_PROJECT_REF", ref);
    vi.stubEnv("SEASON_SUPABASE_URL", `https://${ref}.supabase.co`);
    vi.stubEnv("SEASON_SUPABASE_KEY", "sb_publishable_abc");
    vi.stubEnv("SEASON_DB_SECRET", "s".repeat(32));
  };
  afterEach(() => {
    vi.unstubAllEnvs();
    __resetChallengeStore();
  });

  it("uses the shared Season project when every setting is valid", () => {
    valid();
    expect(seasonDatabaseConfig()).toEqual({ url: `https://${ref}.supabase.co`, key: "sb_publishable_abc", secret: "s".repeat(32) });
    expect(getChallengeStore()?.kind).toBe("supabase");
  });

  it.each([
    ["a short secret", "SEASON_DB_SECRET", "short"],
    ["a service or secret key", "SEASON_SUPABASE_KEY", "sb_secret_abc"],
    ["a URL for another project", "SEASON_SUPABASE_URL", "https://abcdefghijabcdefghij.supabase.co"],
    ["the retired fitness project", "SEASON_SUPABASE_PROJECT_REF", "mudmzagbhjriswjdzzcq"],
    ["a missing setting", "SEASON_SUPABASE_URL", ""],
  ])("stays closed, with no demo fallback, on %s", (_label, name, value) => {
    valid();
    vi.stubEnv(name, value);
    expect(seasonDatabaseConfig()).toBeNull();
    expect(getChallengeStore()).toBeUndefined();
  });
});

describe("challenge migration", () => {
  const sql = readFileSync(join(process.cwd(), "supabase/migrations/20261005030000_season_challenge.sql"), "utf8");
  const functions = [...sql.matchAll(/create or replace function (public\.\w+)\(([^)]*)\)[\s\S]*?end \$\$;/g)];

  it("keeps the tables out of the API schema", () => {
    expect(sql).not.toMatch(/create table[^(]*public\./i);
    expect(sql).toMatch(/revoke all on season_private\.challenge_participants, season_private\.challenge_results from public, anon, authenticated/);
  });

  it("gates every public function on the server secret with a pinned search path", () => {
    expect(functions.length).toBe(9);
    for (const [body, name, args] of functions) {
      expect(args.startsWith("p_secret text"), name).toBe(true);
      expect(body, name).toContain("security definer set search_path = ''");
      expect(body, name).toContain("perform season_private.check_secret(p_secret);");
      expect(sql, name).toContain(`'${name}(`);
    }
  });

  it("never touches the bidding tables", () => {
    expect(sql).not.toMatch(/season_private\.bids|api_secrets/);
  });
});
