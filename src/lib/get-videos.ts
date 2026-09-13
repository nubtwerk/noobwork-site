import { unstable_cache } from "next/cache";
import type { VideoItem } from "@/data/videos";
import {
  featuredVideo as snapshotFeatured,
  recentVideos as snapshotRecent,
  videosGeneratedAt,
} from "@/data/videos";

const FEED_URL =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ";

/** How often production re-fetches the channel feed (seconds). */
export const VIDEO_REVALIDATE_SECONDS = 3600;

export interface LatestVideos {
  featuredVideo: VideoItem;
  recentVideos: VideoItem[];
  /** Subtle reel caption, e.g. "19 Jul 2026", or null when unknown. */
  asOfLabel: string | null;
}

/**
 * Format an ISO date for the reel "As of" line (day + short month + year, UTC).
 * Exported for unit tests.
 */
export function formatAsOfLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Prefer the newest upload publish date among the reel items; fall back to the
 * committed snapshot's generatedAt. Returns null when neither is usable.
 */
export function resolveAsOfLabel(
  featured: VideoItem,
  recent: VideoItem[],
  snapshotGeneratedAt: string | null = videosGeneratedAt
): string | null {
  const publishDates = [featured, ...recent]
    .map((v) => v.publishedIso)
    .filter((iso): iso is string => typeof iso === "string" && iso.length > 0)
    .sort();
  const newestPublish = publishDates.at(-1);
  if (newestPublish) {
    const label = formatAsOfLabel(newestPublish);
    return label || null;
  }
  if (snapshotGeneratedAt) {
    const label = formatAsOfLabel(snapshotGeneratedAt);
    return label || null;
  }
  return null;
}

async function fetchFromYouTubeFeed(): Promise<Omit<LatestVideos, "asOfLabel"> | null> {
  // parseFeed/selectLatestVideos/fetchTextWithTimeout are shared with the
  // build-time script so the two feed paths can never diverge.
  const { parseFeed, selectLatestVideos, fetchTextWithTimeout } = await import(
    "../../scripts/refresh-videos.mjs"
  );

  // fetchTextWithTimeout bounds BOTH the headers and the body read (undici's
  // default is minutes), so a reachable-but-hanging feed can never stall a
  // production build or an ISR regeneration. It throws on a non-ok response,
  // which resolveLatestVideos catches and treats as a fallback.
  const feedXml = await fetchTextWithTimeout(FEED_URL, 10_000);
  const entries = parseFeed(feedXml);
  const selected = await selectLatestVideos(entries);
  if (!selected) return null;

  return { featuredVideo: selected.featured, recentVideos: selected.recent };
}

function fromBuildSnapshot(): Omit<LatestVideos, "asOfLabel"> {
  return {
    featuredVideo: snapshotFeatured,
    recentVideos: snapshotRecent,
  };
}

function withAsOf(videos: Omit<LatestVideos, "asOfLabel">): LatestVideos {
  return {
    ...videos,
    asOfLabel: resolveAsOfLabel(videos.featuredVideo, videos.recentVideos),
  };
}

async function resolveLatestVideos(): Promise<LatestVideos> {
  try {
    const fromFeed = await fetchFromYouTubeFeed();
    if (fromFeed) return withAsOf(fromFeed);
    // Feed reachable but too sparse to render a full reel — log so a silently
    // degraded (stale-but-coherent) feed is observable in production logs.
    console.warn(
      "get-videos: live feed yielded too few long-form videos — using build snapshot"
    );
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn(
      `get-videos: live feed fetch failed (${detail}) — using build snapshot`
    );
  }
  return withAsOf(fromBuildSnapshot());
}

const getCachedLatestVideos = unstable_cache(
  resolveLatestVideos,
  ["noobwork-youtube-videos"],
  { revalidate: VIDEO_REVALIDATE_SECONDS, tags: ["youtube-videos"] }
);

/** Latest long-form uploads for the homepage reel and JSON-LD. */
export async function getLatestVideos(): Promise<LatestVideos> {
  return getCachedLatestVideos();
}
