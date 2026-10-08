import { track } from "@vercel/analytics";

type Event = "season_viewed" | "season_follow_requested";

/**
 * Allowlisted properties only. `ref` is the brand label Joachim puts in a link
 * he sends (/season?ref=aker), never anything a visitor typed.
 */
export function trackSeason(event: Event, input: { source?: "season" | "home"; ref?: string } = {}) {
  const properties: Record<string, string> = {};
  if (input.source === "season" || input.source === "home") properties.source = input.source;
  if (input.ref) properties.ref = input.ref;
  try {
    track(event, properties);
  } catch {
    // Analytics availability must never break the page.
  }
}
