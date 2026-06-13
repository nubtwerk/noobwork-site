import { Stat } from "@/types";
import { profileFacts } from "@/data/profile-facts";

const { subscribers, totalViews, videosPublished } = profileFacts;

/**
 * Media kit stats. The three volatile figures (subscribers, views, videos)
 * derive from src/data/profile-facts.ts so they can never drift from the
 * AI-context layer again. "Years Creating" is a soft, stable number.
 */
export const mediaKitStats: Stat[] = [
  { label: "YouTube Subscribers", value: subscribers.short, numericValue: subscribers.numericValue, suffix: subscribers.suffix },
  { label: "Total Video Views", value: totalViews.short, numericValue: totalViews.numericValue, suffix: totalViews.suffix },
  { label: "Videos Published", value: videosPublished.short, numericValue: videosPublished.numericValue, suffix: videosPublished.suffix },
  { label: "Years Creating", value: "13+", numericValue: 13, suffix: "+" },
];
