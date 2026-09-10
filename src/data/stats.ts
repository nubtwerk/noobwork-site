import { Stat } from "@/types";
import { profileFacts } from "@/data/profile-facts";

const { subscribers, totalViews, videosPublished } = profileFacts;

/**
 * Media kit stats. The three volatile figures (subscribers, views, videos)
 * derive from src/data/profile-facts.ts so they can never drift from the
 * AI-context layer again. The channel launch year is a fixed date.
 */
export const mediaKitStats: Stat[] = [
  { label: "YouTube Subscribers", value: subscribers.short, numericValue: subscribers.numericValue, suffix: subscribers.suffix },
  { label: "Total Video Views", value: totalViews.short, numericValue: totalViews.numericValue, suffix: totalViews.suffix },
  { label: "Videos Published", value: videosPublished.short, numericValue: videosPublished.numericValue, suffix: videosPublished.suffix },
  { label: "On YouTube since", value: "2013" },
];
