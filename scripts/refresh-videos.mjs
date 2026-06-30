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
 *    a 200 means Short, a 3xx means regular video. Any other status is
 *    ambiguous and throws, so the entry is skipped conservatively.
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
 * Forced to UTC so the label is deterministic and matches the feed's UTC
 * publish dates regardless of the build host's timezone (a video published just
 * after midnight UTC must not render as the previous month west of UTC).
 */
export function formatDisplayDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns true if the given YouTube id is a Short.
 * Short detection: HEAD https://www.youtube.com/shorts/<id>
 *   - HTTP 200 => is a Short
 *   - HTTP 3xx => regular video (Shorts URL redirects to /watch)
 *   - anything else (404/429/5xx/etc.) is ambiguous: throw so the caller skips
 *     the entry conservatively instead of mislabeling a Short as long-form.
 * fetchImpl is injectable for tests.
 */
export async function isShort(id, fetchImpl = fetch) {
  const res = await fetchWithTimeout(
    `https://www.youtube.com/shorts/${id}`,
    { method: "HEAD", redirect: "manual" },
    8_000,
    fetchImpl
  );
  if (res.status === 200) return true;
  if (res.status >= 300 && res.status < 400) return false;
  throw new Error(`unexpected status ${res.status} for shorts/${id}`);
}

/**
 * Every network call gets a hard timeout: a reachable-but-hanging YouTube
 * must never stall a CI or production build (undici's default is minutes).
 */
export async function fetchWithTimeout(url, options = {}, ms = 8_000, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  // Respect a caller-supplied signal instead of clobbering it.
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  try {
    return await fetchImpl(url, { ...options, signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Like fetchWithTimeout, but the timeout also covers reading the body —
 * needed for the feed download, where a hung body read would stall the build
 * just as badly as hung headers.
 */
export async function fetchTextWithTimeout(url, ms = 10_000, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetchImpl(url, { signal: controller.signal });
    // Fail fast on an HTTP error so an error/throttle page is never parsed as
    // feed XML; main()'s catch keeps the existing json and exits 0.
    if (!res.ok) throw new Error(`feed fetch failed: ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * True when two generated-json payloads carry the same video content.
 * generatedAt: undefined is dropped by JSON.stringify, so timestamps are
 * ignored; a build must not rewrite the file just to bump the timestamp.
 */
export function isSameVideoContent(a, b) {
  const strip = (o) => JSON.stringify({ ...o, generatedAt: undefined });
  return strip(a) === strip(b);
}

/** Convert a parsed feed entry to the stored VideoItem shape. */
export function toVideoItem(e) {
  return {
    id: e.id,
    title: e.title,
    date: formatDisplayDate(e.publishedIso),
    publishedIso: e.publishedIso,
  };
}

/**
 * Shared feed -> { featured, recent } selection used by BOTH the build script
 * (main, below) and the runtime resolver (src/lib/get-videos.ts), so the two
 * paths can never diverge. Classifies Shorts (skipping anything ambiguous),
 * takes the newest long-form as featured and the next up-to-four as recent,
 * de-dupes the featured id out of recent, and returns null unless there are 2+
 * long-form AND 2+ recent — a sparse result is rejected in favour of the
 * caller's pinned fallback rather than rendering a half-empty reel.
 *
 * isShortFn is injectable for tests. classifyBudgetMs caps total Shorts-
 * classification time so a hostile or hanging HEAD endpoint can never dominate
 * a build or an ISR regeneration (each individual request is timed too).
 */
export async function selectLatestVideos(
  entries,
  isShortFn = isShort,
  classifyBudgetMs = 25_000
) {
  if (!Array.isArray(entries) || entries.length < 2) return null;

  const deadline = Date.now() + classifyBudgetMs;
  const longForm = [];
  for (const entry of entries) {
    if (longForm.length >= 5) break;
    if (Date.now() > deadline) break;
    // parseFeed already enforces the 11-char id; guard the title so an entry
    // with an empty title can never ship (mirrors the build-time whitelist).
    if (!entry || !entry.id || !entry.title) continue;
    try {
      if (!(await isShortFn(entry.id))) longForm.push(entry);
    } catch {
      // Ambiguous Shorts status — skip this entry conservatively.
      continue;
    }
  }

  if (longForm.length < 2) return null;

  const featured = toVideoItem(longForm[0]);
  const recent = longForm
    .slice(1, 5)
    .map(toVideoItem)
    .filter((v) => v.id !== featured.id);

  if (recent.length < 2) return null;

  return { featured, recent };
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
    // 1. Fetch the feed; the 10s budget covers headers AND body.
    const feedXml = await fetchTextWithTimeout(FEED_URL, 10_000);

    // 2. Parse + select featured/recent via the shared resolver (same logic the
    //    runtime path in src/lib/get-videos.ts uses).
    const entries = parseFeed(feedXml);
    const selected = await selectLatestVideos(entries);
    if (!selected) {
      console.error(
        "refresh-videos: feed did not yield 2+ long-form videos with 2+ recent — aborting, keeping existing json"
      );
      process.exit(0);
    }
    const { featured, recent } = selected;

    // 3. Verify the featured maxres thumbnail (warn-only; never blocks a build).
    const thumbUrl = `https://i.ytimg.com/vi/${featured.id}/maxresdefault.jpg`;
    try {
      const thumbRes = await fetchWithTimeout(thumbUrl, { method: "HEAD" });
      const contentLength = parseInt(
        thumbRes.headers.get("content-length") || "0",
        10
      );
      if (thumbRes.status !== 200 || contentLength <= 10_000) {
        console.warn(
          `refresh-videos: maxres thumb for ${featured.id} not ideal (status=${thumbRes.status}, length=${contentLength}) — proceeding anyway`
        );
      }
    } catch (err) {
      console.warn(
        `refresh-videos: thumb check failed for ${featured.id}: ${err.message} — proceeding anyway`
      );
    }

    // 4. Build the output.
    const output = {
      generatedAt: new Date().toISOString(),
      featured,
      recent,
    };

    // Deterministic builds: if the video content is unchanged, do not rewrite
    // the file just to bump generatedAt (a build must not dirty the worktree).
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
      if (isSameVideoContent(existing, output)) {
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
