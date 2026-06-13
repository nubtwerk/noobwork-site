/**
 * Canonical source of truth for the volatile facts about Joachim / Noobwork:
 * the numbers that grow over time (subscriber count, total views, videos).
 *
 * These previously lived in several places that silently drifted apart (the
 * media kit said 150M, the AI-context page said 152M, the hero said 150M).
 * Now they live HERE and nowhere else:
 *   - the AI-context markdown injects them via `{{key}}` placeholders, where
 *     the placeholder name IS the object key (see src/lib/load-context.ts)
 *   - the media kit and hero derive their display strings from these objects
 *     (see src/data/stats.ts, src/components/sections/Hero.tsx)
 *
 * To update a figure, change it ONCE here. The drift guard in
 * test/context-layer.test.ts fails the build if any markdown or source file
 * hardcodes one of these figures instead of deriving it.
 */
export interface ProfileFact {
  /** Long display form for the context layer, e.g. "195,000+". */
  long: string;
  /** Short display form for the media kit and hero, e.g. "195K+". */
  short: string;
  /** Numeric base for CountUp animations. */
  numericValue: number;
  /** Suffix appended after the counted number. */
  suffix: string;
}

export const profileFacts = {
  subscribers: { long: "195,000+", short: "195K+", numericValue: 195, suffix: "K+" },
  totalViews: { long: "150,000,000+", short: "150M+", numericValue: 150, suffix: "M+" },
  videosPublished: { long: "1,800+", short: "1,800+", numericValue: 1800, suffix: "+" },
} as const satisfies Record<string, ProfileFact>;

/**
 * Map of `{{key}}` to its long display string, for markdown injection. The
 * markdown placeholder is the object key itself, so no separate token field
 * can drift out of sync with it.
 */
export const contextTokens: Record<string, string> = Object.fromEntries(
  Object.entries(profileFacts).map(([key, f]) => [key, f.long]),
);

/**
 * Every display string for a volatile figure (long and short forms), used by
 * the drift guard to assert that no markdown or source file hardcodes one.
 */
export const volatileFigures: string[] = [
  ...new Set(Object.values(profileFacts).flatMap((f) => [f.long, f.short])),
];
