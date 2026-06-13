export interface VideoItem {
  /** YouTube video ID */
  id: string;
  title: string;
  /** Display date, already formatted (e.g. "Jun 2026") */
  date: string;
  /** ISO 8601 publish date, present only in generated data */
  publishedIso?: string;
}

/**
 * Real uploads from youtube.com/@Noobworkify.
 *
 * At build time, scripts/refresh-videos.mjs fetches the channel's public RSS
 * feed (https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ)
 * and writes src/data/videos.generated.json. That file is preferred when valid.
 * If the generated file is missing or malformed, we fall back to the pinned
 * snapshot below so the build is always safe.
 *
 * Ordering contract: recentVideos is newest-first (the section is headed
 * "Latest Uploads."). The generated file preserves this from the feed.
 */

import generated from "./videos.generated.json";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function isValid(v: unknown): v is VideoItem {
  if (!v || typeof v !== "object") return false;
  const item = v as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    YOUTUBE_ID.test(item.id) &&
    typeof item.title === "string" &&
    item.title.length > 0 &&
    typeof item.date === "string" &&
    item.date.length > 0
  );
}

// ---------------------------------------------------------------------------
// Pinned fallback (renamed from original exports)
// ---------------------------------------------------------------------------

const fallbackFeatured: VideoItem = {
  id: "j3fcJnIYBEw",
  title: "Min første dag i Kyoto | Shinkansen, Airbnb og meal prep",
  date: "Jun 2026",
};

const fallbackRecent: VideoItem[] = [
  {
    id: "6Dt2jvU7Z-w",
    title: "Første push day tilbake i Norge | Trening",
    date: "Jun 2026",
  },
  {
    id: "SpHxsZIVuJ4",
    title: "Jeg testet alle matkjedene i Norge (Kiwi vant)",
    date: "Jun 2026",
  },
  {
    id: "23zAbLMuN8I",
    title: "Jeg hentet Rolexen jeg har ventet på | Norge vlog",
    date: "Jun 2026",
  },
  {
    id: "AacH4JBZK_g",
    title: "Jeg testet Emirates First Class hjem til Norge",
    date: "May 2026",
  },
];

// ---------------------------------------------------------------------------
// Exported values: prefer generated, fall back to pinned
// ---------------------------------------------------------------------------

export const featuredVideo: VideoItem = isValid(generated?.featured)
  ? generated.featured
  : fallbackFeatured;

export const recentVideos: VideoItem[] =
  Array.isArray(generated?.recent) &&
  generated.recent.length >= 2 &&
  generated.recent.every(isValid)
    ? generated.recent
    : fallbackRecent;
