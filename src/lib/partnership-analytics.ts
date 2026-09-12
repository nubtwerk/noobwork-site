import { track } from "@vercel/analytics";
import { isPartnershipOffer } from "@/data/partnerships";

const sources = ["hero", "navigation", "footer", "homepage-partner", "media-kit-hero", "media-kit-offer", "featured-series", "context", "connect", "email"] as const;
type Event = "partnership_cta_clicked" | "partnership_offer_selected" | "inquiry_started" | "inquiry_submitted";

/** Allowlisted labels only. Form text, emails, names and budgets never enter analytics. */
export function trackPartnership(event: Event, input: { source?: string; offer?: unknown } = {}) {
  const properties: Record<string, string> = {};
  if (sources.some((source) => source === input.source)) properties.source = input.source!;
  if (isPartnershipOffer(input.offer)) properties.offer = input.offer;
  try {
    track(event, properties);
  } catch {
    // Analytics availability must never prevent an inquiry or navigation.
  }
}
