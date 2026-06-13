/**
 * Canonical source of truth for the volatile facts about Joachim / Noobwork:
 * the numbers that grow over time (subscriber count, total views, videos).
 *
 * These previously lived in two places that silently drifted apart (the
 * media kit said 150M, the AI-context page said 152M). Now they live HERE
 * and nowhere else:
 *   - the AI-context markdown injects them via {{token}} placeholders
 *     (see src/lib/load-context.ts)
 *   - the media kit derives its display strings from them (see src/data/stats.ts)
 *
 * To update a figure, change it ONCE here. A test (test/context-tokens.test.ts)
 * fails if any markdown file hardcodes one of these numbers instead.
 */
export interface ProfileFact {
  /** Token used in ai-context markdown, e.g. `{{subscribers}}`. */
  token: string;
  /** Long display form for the context layer, e.g. "195,000+". */
  long: string;
  /** Short display form for the media kit, e.g. "195K+". */
  short: string;
  /** Numeric base for CountUp animations. */
  numericValue: number;
  /** Suffix appended after the counted number. */
  suffix: string;
}

export const profileFacts = {
  subscribers: {
    token: "subscribers",
    long: "195,000+",
    short: "195K+",
    numericValue: 195,
    suffix: "K+",
  },
  totalViews: {
    token: "totalViews",
    long: "150,000,000+",
    short: "150M+",
    numericValue: 150,
    suffix: "M+",
  },
  videosPublished: {
    token: "videosPublished",
    long: "1,800+",
    short: "1,800+",
    numericValue: 1800,
    suffix: "+",
  },
} as const satisfies Record<string, ProfileFact>;

/** Map of `{{token}}` name to its long display string, for markdown injection. */
export const contextTokens: Record<string, string> = Object.fromEntries(
  Object.values(profileFacts).map((f) => [f.token, f.long]),
);

/**
 * The raw long-form numbers, used by drift tests to assert that no markdown
 * file hardcodes a volatile figure instead of using its `{{token}}`.
 */
export const volatileFigures: string[] = Object.values(profileFacts).map(
  (f) => f.long,
);
