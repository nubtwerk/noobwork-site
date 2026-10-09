import { isProductionRuntime } from "@/lib/runtime-env";

/**
 * Season 1 community challenge ("Climb with me"): followers run a 5 km at the
 * start of the season and again in each retest window, and the leaderboard on
 * /season ranks the percentage improvement against their own baseline.
 *
 * `enabled` keeps the challenge out of production until the launch. Preview and
 * local builds always show it (against demo data when no database is set), so it
 * can be reviewed without going live. Design: docs/community-challenge.md.
 */
export type ChallengeWindowId = "baseline" | "q1" | "q2" | "q3" | "finale";

export type ChallengeWindow = {
  id: ChallengeWindowId;
  label: string;
  /** Opening and closing instants, Korea time. Each window runs 1 to 14 of the month. */
  opensAt: string;
  closesAt: string;
};

export const challenge = {
  name: "Climb with me",
  enabled: false,
  /** Set once a lawyer has reviewed /season/challenge/rules. Until then the page carries a draft notice. */
  rulesReviewed: false,
  /** Countries excluded from prizes (not from the board). To be confirmed in the legal review. */
  prizeExcludedCountries: ["BR", "IT"],
  /** Rough cap per prize, in US dollars, so winners and sponsors avoid tax paperwork. */
  maxPrizeValueUsd: 500,
  test: "5 km run",
  distanceKm: 5,
  /** The board and the participant counter stay hidden until this many people have joined. */
  minParticipantsToShow: 50,
  boardSize: 25,
  /** An improvement above this share against the previous run is held for review before it ranks. */
  flagAbovePct: 25,
  /** Faster than this is held for review (the 5 km world record is about 12:35). */
  fastestPlausibleSeconds: 13 * 60,
  slowestAcceptedSeconds: 2 * 60 * 60,
  windows: [
    { id: "baseline", label: "Baseline", opensAt: "2027-01-01T00:00:00+09:00", closesAt: "2027-01-14T23:59:59+09:00" },
    { id: "q1", label: "First retest", opensAt: "2027-04-01T00:00:00+09:00", closesAt: "2027-04-14T23:59:59+09:00" },
    { id: "q2", label: "Second retest", opensAt: "2027-07-01T00:00:00+09:00", closesAt: "2027-07-14T23:59:59+09:00" },
    { id: "q3", label: "Third retest", opensAt: "2027-10-01T00:00:00+09:00", closesAt: "2027-10-14T23:59:59+09:00" },
    { id: "finale", label: "Finale", opensAt: "2028-01-01T00:00:00+09:00", closesAt: "2028-01-14T23:59:59+09:00" },
  ] satisfies ChallengeWindow[],
  prizes: [
    "Each quarter: the three biggest verified improvers win prizes from the season's sponsors.",
    "Season finale: the biggest improvement from January 2027 to January 2028.",
    "Finisher draw: everyone who logs all five runs goes into a draw. Showing up counts.",
  ],
} as const;

export function isChallengeWindowId(value: unknown): value is ChallengeWindowId {
  return typeof value === "string" && challenge.windows.some((w) => w.id === value);
}

export function findChallengeWindow(id: ChallengeWindowId): ChallengeWindow {
  return challenge.windows.find((w) => w.id === id)!;
}

/** The window open at `now`, if any. */
export function openChallengeWindow(now: number): ChallengeWindow | undefined {
  return challenge.windows.find((w) => now >= Date.parse(w.opensAt) && now <= Date.parse(w.closesAt));
}

/** The next window that has not closed yet at `now`. */
export function nextChallengeWindow(now: number): ChallengeWindow | undefined {
  return challenge.windows.find((w) => now <= Date.parse(w.closesAt));
}

export function windowIndex(id: ChallengeWindowId): number {
  return challenge.windows.findIndex((w) => w.id === id);
}

/** Production shows the challenge only once `enabled` is set; previews and local builds always do. */
export function isChallengeVisible(): boolean {
  return challenge.enabled || !isProductionRuntime();
}

/** "1 to 14 April 2027" for a window, in Korea time. */
export function formatWindowDates(window: ChallengeWindow): string {
  const fmt = (iso: string, withYear: boolean) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      ...(withYear ? { year: "numeric" } : {}),
      timeZone: "Asia/Seoul",
    });
  return `${fmt(window.opensAt, false).split(" ")[0]} to ${fmt(window.closesAt, true)}`;
}
