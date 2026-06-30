import { unstable_cache } from "next/cache";
import type { VideoItem } from "@/data/videos";
import {
  featuredVideo as snapshotFeatured,
  recentVideos as snapshotRecent,
} from "@/data/videos";

const FEED_URL =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ";

/** How often production re-fetches the channel feed (seconds). */
export const VIDEO_REVALIDATE_SECONDS = 3600;

export interface LatestVideos {
  featuredVideo: VideoItem;
  recentVideos: VideoItem[];
}

async function fetchFromYouTubeFeed(): Promise<LatestVideos | null> {
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

function fromBuildSnapshot(): LatestVideos {
  return {
    featuredVideo: snapshotFeatured,
    recentVideos: snapshotRecent,
  };
}

async function resolveLatestVideos(): Promise<LatestVideos> {
  try {
    const fromFeed = await fetchFromYouTubeFeed();
    if (fromFeed) return fromFeed;
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
  return fromBuildSnapshot();
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
