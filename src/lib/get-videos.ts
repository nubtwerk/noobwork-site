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
  const { parseFeed, formatDisplayDate, isShort } = await import(
    "../../scripts/refresh-videos.mjs"
  );

  const res = await fetch(FEED_URL, {
    next: { revalidate: VIDEO_REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;

  const feedXml = await res.text();
  const entries = parseFeed(feedXml);
  if (entries.length < 2) return null;

  const longForm = [];
  for (const entry of entries) {
    if (longForm.length >= 5) break;
    try {
      if (!(await isShort(entry.id))) longForm.push(entry);
    } catch {
      continue;
    }
  }

  if (longForm.length < 2) return null;

  const toVideoItem = (e: {
    id: string;
    title: string;
    publishedIso: string;
  }): VideoItem => ({
    id: e.id,
    title: e.title,
    date: formatDisplayDate(e.publishedIso),
    publishedIso: e.publishedIso,
  });

  const featuredVideo = toVideoItem(longForm[0]);
  const recentVideos = longForm
    .slice(1, 5)
    .map(toVideoItem)
    .filter((v) => v.id !== featuredVideo.id);

  if (recentVideos.length < 2) return null;

  return { featuredVideo, recentVideos };
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
  } catch {
    // Offline, rate-limited, or parse failure — fall back to build snapshot.
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
