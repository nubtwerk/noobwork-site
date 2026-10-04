/**
 * Season 1 sponsorship: the single source for the /season page.
 *
 * Selling a spot is a data change here, not a page edit:
 * 1. Set the spot's `status` to "reserved" (verbal yes) or "sold" (signed and invoiced).
 * 2. Add `sponsor` only once the agreement allows the brand to be named publicly.
 * 3. Never name a brand that has not signed. An open spot stays anonymous.
 *
 * `isPublic` keeps the page out of search, the sitemap and the navigation while
 * spots are sold privately. Flip it at the public announcement.
 *
 * Bidding: a spot with an `openingBid` is auctioned while `seasonBidding.enabled`
 * is true. Bids are non-binding offers stored outside this file (see
 * `src/lib/season-bids/`); marking a winner in /season/admin shows the spot as
 * Reserved, and "sold" stays a change here once the contract is signed.
 */
export type SeasonSpotStatus = "open" | "talks" | "reserved" | "sold";

export type SeasonSpot = {
  id: string;
  title: string;
  /** How long the placement runs, as shown to a buyer. */
  term: string;
  /** Where the spot sits on the banner board; `null` for spots off the banner. */
  board: "partner" | "banner" | null;
  includes: readonly string[];
  status: SeasonSpotStatus;
  sponsor?: { name: string; url?: string };
  /** USD. Present only on spots that are auctioned; the minimum first bid. */
  openingBid?: number;
  /** Shown next to the amount, e.g. "per quarter". */
  bidUnit?: string;
};

export const seasonBidding = {
  /** Off returns every spot to the "Claim this spot" inquiry flow. */
  enabled: true,
  currency: "USD",
  /** 1 December 2026, 21:00 KST. Every Q1 auction closes here unless extended. */
  closesAt: "2026-12-01T12:00:00Z",
  minRaise: 250,
  /** A bid confirmed this close to the end pushes that spot's close out by the same amount. */
  extensionMinutes: 30,
  /** Highest single bid accepted, to catch typos. */
  maxBid: 250_000,
  /** One brand per category per quarter. Supplements stay out while Aker is the season partner. */
  categories: [
    "AI and creator tools",
    "Gaming hardware and setups",
    "Energy and hydration",
    "Apparel and footwear",
    "Recovery and wellness",
    "Gyms and training",
    "Food and drink",
    "Software and apps",
    "Travel and lifestyle",
    "Other",
  ],
} as const;

export type SeasonBidCategory = (typeof seasonBidding.categories)[number];

export const season = {
  name: "Season 1",
  isPublic: false,
  /** ISO dates. The baseline is filmed on the start date. */
  startsOn: "2027-01-01",
  finaleOn: "2028-01-01",
  checkpoints: [
    { id: "baseline", label: "Baseline", month: "January 2027", text: "The starting numbers, filmed on day one. Nothing hidden, including the unflattering parts." },
    { id: "q1", label: "First retest", month: "April 2027", text: "Three months in. The first honest read on what the training and the products did." },
    { id: "q2", label: "Second retest", month: "July 2027", text: "Halfway. Summer in Seoul, the hardest stretch to stay consistent." },
    { id: "q3", label: "Third retest", month: "October 2027", text: "Nine months. The trends I tested either show up in the numbers or they don't." },
    { id: "finale", label: "Finale", month: "January 2028", text: "A year of work against the same tests. The full before and after." },
  ],
  measures: ["Body composition scan", "5 km run", "Strength benchmarks"],
} as const;

export const seasonSpots: readonly SeasonSpot[] = [
  {
    id: "season-partner",
    title: "Season partner",
    term: "12 months",
    board: "partner",
    includes: [
      "Named in the bio on every platform",
      "Largest logo on the YouTube and X banners",
      "Pinned season posts",
      "Logo on the training shirt",
      "A segment in every retest episode",
    ],
    status: "talks",
  },
  ...[1, 2, 3, 4].map((n): SeasonSpot => ({
    id: `banner-${n}`,
    title: `Banner spot ${n}`,
    term: "Q1 2027, renewable each quarter",
    board: "banner",
    includes: [
      "Logo on the YouTube and X banners",
      "Named in every episode description that quarter",
      "Logo on this page",
    ],
    status: "open",
    openingBid: 2_500,
    bidUnit: "for Q1",
  })),
  {
    id: "apparel",
    title: "Apparel partner",
    term: "6 or 12 months",
    board: null,
    includes: ["Your shirt, cap or shoes worn in training episodes", "Only gear I would wear anyway"],
    status: "open",
    openingBid: 1_500,
    bidUnit: "per quarter, plus product",
  },
  {
    id: "retest-q1",
    title: "First retest presenter",
    term: "April 2027 episode",
    board: null,
    includes: ["Presents the first retest episode", "Logo on the thumbnail and the retest posts"],
    status: "open",
    openingBid: 2_000,
    bidUnit: "for the episode",
  },
];

export function findSeasonSpot(id: unknown): SeasonSpot | undefined {
  return typeof id === "string" ? seasonSpots.find((spot) => spot.id === id) : undefined;
}

export const seasonStatusLabel: Record<SeasonSpotStatus, string> = {
  open: "Open",
  talks: "In talks",
  reserved: "Reserved",
  sold: "Sold",
};

/** Spots taking bids right now, according to this file alone. */
export function isBiddable(spot: SeasonSpot): spot is SeasonSpot & { openingBid: number } {
  return seasonBidding.enabled && spot.status === "open" && typeof spot.openingBid === "number";
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
