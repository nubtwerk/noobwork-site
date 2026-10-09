import { challenge, windowIndex, type ChallengeWindowId } from "@/data/challenge";
import type { Participant, ResultStatus, RunResult } from "./store";

export type Standing = {
  participant: Participant;
  baseline: RunResult;
  /** The runner's most recent counted retest, if any. */
  latest?: RunResult;
  /** Percentage faster than the baseline; negative means slower. */
  improvementPct?: number;
  /** Both runs checked by Joachim. */
  verified: boolean;
  rank?: number;
};

const COUNTED: readonly ResultStatus[] = ["self_reported", "verified"];
const counts = (r: RunResult) => COUNTED.includes(r.status);

export function improvementPct(baselineSeconds: number, latestSeconds: number): number {
  return ((baselineSeconds - latestSeconds) / baselineSeconds) * 100;
}

/**
 * Ranks every runner with a counted baseline by improvement up to `upTo`
 * (default: the whole season). Flagged and rejected runs never count, and a
 * runner with only a baseline is listed after the ranked runners, unranked.
 */
export function computeStandings(participants: Participant[], results: RunResult[], upTo: ChallengeWindowId = "finale"): Standing[] {
  const limit = windowIndex(upTo);
  const byRunner = new Map<string, RunResult[]>();
  for (const r of results) {
    if (!counts(r) || windowIndex(r.windowId) > limit) continue;
    byRunner.set(r.participantId, [...(byRunner.get(r.participantId) ?? []), r]);
  }

  const standings: Standing[] = [];
  for (const participant of participants) {
    const runs = byRunner.get(participant.id) ?? [];
    const baseline = runs.find((r) => r.windowId === "baseline");
    if (!baseline) continue;
    const latest = runs
      .filter((r) => r.windowId !== "baseline")
      .sort((a, b) => windowIndex(b.windowId) - windowIndex(a.windowId))[0];
    standings.push({
      participant,
      baseline,
      latest,
      improvementPct: latest ? improvementPct(baseline.timeSeconds, latest.timeSeconds) : undefined,
      verified: baseline.status === "verified" && (!latest || latest.status === "verified"),
    });
  }

  const ranked = standings
    .filter((s) => s.improvementPct !== undefined)
    .sort((a, b) => b.improvementPct! - a.improvementPct! || a.latest!.submittedAt.localeCompare(b.latest!.submittedAt));
  ranked.forEach((s, i) => (s.rank = i + 1));
  const unranked = standings
    .filter((s) => s.improvementPct === undefined)
    .sort((a, b) => a.baseline.submittedAt.localeCompare(b.baseline.submittedAt));
  return [...ranked, ...unranked];
}

export type PublicBoard = {
  /** Joachim's own row, pinned above the list. */
  host?: Standing;
  rows: Standing[];
  /** Runners on the board beyond the rows shown. */
  more: number;
  hasRetests: boolean;
};

export function publicBoard(standings: Standing[], size: number = challenge.boardSize): PublicBoard {
  const visible = standings.filter((s) => !s.participant.hidden);
  const host = visible.find((s) => s.participant.isHost);
  const others = visible.filter((s) => !s.participant.isHost);
  return {
    host,
    rows: others.slice(0, size),
    more: Math.max(0, others.length - size),
    hasRetests: visible.some((s) => s.rank !== undefined),
  };
}

export type ChallengeStats = { participants: number; countries: number; totalKm: number };

export function challengeStats(participants: Participant[], results: RunResult[]): ChallengeStats {
  const shown = participants.filter((p) => !p.hidden);
  const ids = new Set(shown.map((p) => p.id));
  return {
    participants: shown.length,
    countries: new Set(shown.map((p) => p.country)).size,
    totalKm: results.filter((r) => ids.has(r.participantId) && r.status !== "rejected").length * challenge.distanceKm,
  };
}

/**
 * Status for a new run. Suspiciously fast times, and big jumps against the
 * runner's previous counted run, are held for review instead of ranking.
 */
export function assessSubmission(earlier: RunResult[], windowId: ChallengeWindowId, timeSeconds: number): ResultStatus {
  if (timeSeconds < challenge.fastestPlausibleSeconds) return "flagged";
  const previous = earlier
    .filter((r) => counts(r) && windowIndex(r.windowId) < windowIndex(windowId))
    .sort((a, b) => windowIndex(b.windowId) - windowIndex(a.windowId))[0];
  if (previous && improvementPct(previous.timeSeconds, timeSeconds) > challenge.flagAbovePct) return "flagged";
  return "self_reported";
}

/** Prize candidates for a window: verified Strava runs from runners Joachim marked prize-eligible. */
export function windowWinners(participants: Participant[], results: RunResult[], windowId: ChallengeWindowId, count = 3): Standing[] {
  return computeStandings(participants, results, windowId)
    .filter(
      (s) =>
        s.rank !== undefined &&
        s.latest?.windowId === windowId &&
        s.verified &&
        s.latest.proofKind === "strava" &&
        s.baseline.proofKind === "strava" &&
        s.participant.prizeEligible &&
        !s.participant.hidden &&
        !s.participant.isHost,
    )
    .slice(0, count);
}

export function formatImprovement(pct: number): string {
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${Math.abs(rounded).toFixed(1)}%`;
}
