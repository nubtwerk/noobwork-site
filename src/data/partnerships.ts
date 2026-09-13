/** Public offers are inquiries, not bookings or commitments to a filming date. */
export const partnershipOffers = [
  {
    id: "video",
    title: "Sponsor a video",
    description: "A brand integration in a Noobwork video that fits your product and the story.",
    deliverables: ["One agreed YouTube integration", "Description link and call to action", "Performance report after publication"],
    detail: "We agree the concept, placement and fee before filming.",
  },
  {
    id: "series",
    title: "Partner on a series",
    description: "Give your brand a recurring role in a series about training, travel or life in Seoul.",
    deliverables: ["An agreed run of episodes and short clips", "A featured website partner card for the term", "A shared schedule and performance review"],
    detail: "Deliverables, dates and any category exclusivity are agreed together.",
  },
  {
    id: "brand-content",
    title: "Content for your brand",
    description: "Videos and photographs made for your own channels, with a clear brief and scope.",
    deliverables: ["An agreed set of edited assets", "A defined review and delivery schedule", "Usage rights tailored to your campaign"],
    detail: "Publishing on Noobwork and paid-ad usage can be quoted separately.",
  },
] as const;

export type PartnershipOfferId = (typeof partnershipOffers)[number]["id"];

export function isPartnershipOffer(value: unknown): value is PartnershipOfferId {
  return typeof value === "string" && partnershipOffers.some((offer) => offer.id === value);
}

/** Public RSS observations, not platform analytics or sponsored case studies. */
export const selectedWork = [
  { id: "lz2_509mw60", category: "Training & nutrition", title: "Alt jeg spiser for å holde meg shredded", published: "2026-07-12", views: 4694 },
  { id: "bpYeEbhdsuU", category: "Life in Korea", title: "Kan jeg faktisk bli i Korea?", published: "2026-06-24", views: 9617 },
  { id: "iYDWoRI4yD8", category: "Travel", title: "Universal Studios Japan med dyreste Express Pass", published: "2026-06-20", views: 13563 },
] as const;

export const workViewsObservedAt = "2026-09-10";
export const workViewsSource = "https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ";

/**
 * Recent reach from YouTube Studio — single source of truth for the media-kit block.
 *
 * Update path (no live Studio API on this site):
 * 1. In YouTube Studio → Analytics, note 30-day views, 90-day views, and a
 *    conservative typical long-form view range for recent comparable uploads.
 * 2. Paste display strings into `metrics[].value` below (e.g. "420K", "1.1M", "8K–25K").
 * 3. Set `observedAt` to the review day (YYYY-MM-DD). Leave values null until then.
 * 4. Do not invent demographics or sponsored case studies here.
 *
 * See docs/profile-fact-review.md and docs/partnership-operations.md.
 */
export type RecentReachMetric = {
  id: "views30" | "views90" | "typicalLongForm";
  label: string;
  /** Display string from Studio export, or null until Joachim pastes figures. */
  value: string | null;
};

export const recentReach = {
  /** ISO date of the Studio export review; null means the public block stays pending. */
  observedAt: null as string | null,
  sourceLabel: "YouTube Studio",
  sourceDetail: "Owner-reviewed Analytics export (not the public RSS feed)",
  metrics: [
    { id: "views30", label: "Views · last 30 days", value: null },
    { id: "views90", label: "Views · last 90 days", value: null },
    { id: "typicalLongForm", label: "Typical long-form range", value: null },
  ] satisfies RecentReachMetric[],
};

export function recentReachIsReady(): boolean {
  return Boolean(recentReach.observedAt && recentReach.metrics.some((metric) => metric.value));
}
