/**
 * scripts/refresh-videos.mjs
 *
 * Build-time script: fetches the latest uploads from the channel's public
 * RSS feed and writes src/data/videos.generated.json.
 *
 * Rules:
 *  - ZERO new npm dependencies (plain Node >= 18, global fetch).
 *  - Exits 0 always. Network failure or parse error leaves the existing
 *    json untouched so the build falls back to the pinned snapshot.
 *  - Shorts are detected by HEAD-requesting https://www.youtube.com/shorts/<id>;
 *    a 200 means Short, a 3xx means regular video.
 *
 * Feed: https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const FEED_URL =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "../src/data/videos.generated.json");

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Parse an Atom <entry> block from the YouTube RSS feed.
 * Returns [{id, title, publishedIso}] in feed order (newest-first).
 */
export function parseFeed(xml) {
  const entries = [];
  // Split on <entry> boundaries so we handle each entry independently.
  const entryBlocks = xml.split(/<entry[\s>]/);
  // First element is the feed header before the first <entry>; skip it.
  for (let i = 1; i < entryBlocks.length; i++) {
    const block = entryBlocks[i];

    const idMatch = block.match(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/);
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const publishedMatch = block.match(/<published>([\s\S]*?)<\/published>/);

    if (!idMatch || !titleMatch || !publishedMatch) continue;

    const id = idMatch[1];
    const title = decodeXmlEntities(titleMatch[1].trim());
    const publishedIso = publishedMatch[1].trim();

    entries.push({ id, title, publishedIso });
  }
  return entries;
}

/**
 * Decode the handful of XML entities YouTube uses in titles.
 */
function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    );
}

/**
 * Format an ISO 8601 date string -> "Jun 2026" (en-US locale).
 */
export function formatDisplayDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Returns true if the given YouTube id is a Short.
 * Short detection: HEAD https://www.youtube.com/shorts/<id>
 *   - HTTP 200 => is a Short
 *   - HTTP 3xx => regular video
 * fetchImpl is injectable for tests.
 */
export async function isShort(id, fetchImpl = fetch) {
  const res = await fetchWithTimeout(
    fetchImpl,
    `https://www.youtube.com/shorts/${id}`,
    { method: "HEAD", redirect: "manual" }
  );
  return res.status === 200;
}

/**
 * Every network call gets a hard timeout: a reachable-but-hanging YouTube
 * must never stall a CI or production build (undici's default is minutes).
 */
export async function fetchWithTimeout(fetchImpl, url, options = {}, ms = 8_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Main flow (only when run directly)
// ---------------------------------------------------------------------------

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  await main();
}

async function main() {
  try {
    // 1. Fetch the feed with a 10s timeout.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let feedXml;
    try {
      const res = await fetch(FEED_URL, { signal: controller.signal });
      feedXml = await res.text();
    } finally {
      clearTimeout(timeout);
    }

    // 2. Parse; feed is already newest-first.
    const entries = parseFeed(feedXml);
    if (entries.length < 2) {
      console.error(
        `refresh-videos: only ${entries.length} entries parsed — aborting, keeping existing json`
      );
      process.exit(0);
    }

    // 3. Classify shorts sequentially, collect up to 5 long-form.
    const longForm = [];
    for (const entry of entries) {
      if (longForm.length >= 5) break;
      let short;
      try {
        short = await isShort(entry.id);
      } catch (err) {
        // Network error on Shorts check: skip this entry conservatively.
        console.error(`refresh-videos: isShort(${entry.id}) failed: ${err.message}`);
        continue;
      }
      if (!short) {
        longForm.push(entry);
      }
    }

    if (longForm.length < 2) {
      console.error(
        `refresh-videos: only ${longForm.length} long-form videos found — aborting, keeping existing json`
      );
      process.exit(0);
    }

    // 4. Featured = newest long-form. Verify maxres thumbnail.
    const featuredRaw = longForm[0];
    const thumbUrl = `https://i.ytimg.com/vi/${featuredRaw.id}/maxresdefault.jpg`;
    try {
      const thumbRes = await fetchWithTimeout(fetch, thumbUrl, { method: "HEAD" });
      const contentLength = parseInt(
        thumbRes.headers.get("content-length") || "0",
        10
      );
      if (thumbRes.status !== 200 || contentLength <= 10_000) {
        console.warn(
          `refresh-videos: maxres thumb for ${featuredRaw.id} not ideal (status=${thumbRes.status}, length=${contentLength}) — proceeding anyway`
        );
      }
    } catch (err) {
      console.warn(
        `refresh-videos: thumb check failed for ${featuredRaw.id}: ${err.message} — proceeding anyway`
      );
    }

    // 5. Build the output: featured + 4 recent (after featured, still newest-first).
    const recentRaw = longForm.slice(1, 5);

    const toVideoItem = (e) => ({
      id: e.id,
      title: e.title,
      date: formatDisplayDate(e.publishedIso),
      publishedIso: e.publishedIso,
    });

    const output = {
      generatedAt: new Date().toISOString(),
      featured: toVideoItem(featuredRaw),
      recent: recentRaw.map(toVideoItem),
    };

    // Deterministic builds: if the video content is unchanged, do not rewrite
    // the file just to bump generatedAt (a build must not dirty the worktree).
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
      // generatedAt: undefined is dropped by JSON.stringify, so this compares
      // video content only.
      const stripTs = (o) => JSON.stringify({ ...o, generatedAt: undefined });
      if (stripTs(existing) === stripTs(output)) {
        console.log("refresh-videos: feed content unchanged — skipping write");
        return;
      }
    } catch {
      // No existing file or unparsable: fall through and write.
    }

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
    console.log(
      `refresh-videos: wrote ${OUTPUT_PATH} (featured=${output.featured.id}, recent=${output.recent.length})`
    );
  } catch (err) {
    console.error(`refresh-videos: unexpected error — ${err.message}`);
    // Do NOT touch the existing json. Exit 0 so the build never fails.
    process.exit(0);
  }
}
