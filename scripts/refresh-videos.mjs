/**
 * scripts/refresh-videos.mjs
 *
 * Build-time script: fetches the latest uploads from the channel's public
 * RSS feed and writes src/data/videos.generated.json.
 *
 * Rules:
 *  - ZERO new npm dependencies (plain Node >= 18, global fetch).
 *  - Default (prebuild): exits 0 always. Network failure or parse error
 *    leaves the existing json untouched so the build falls back to the
 *    pinned snapshot.
 *  - Strict (`--strict` or REFRESH_VIDEOS_STRICT=1): exits non-zero on
 *    refresh failure so the daily scheduled Action surfaces the problem.
 *  - Shorts are detected by HEAD-requesting https://www.youtube.com/shorts/<id>;
 *    a 200 means Short, a 3xx means regular video. Any other status is
 *    ambiguous and throws, so the entry is skipped conservatively.
 *
 * Feed: https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ
 */

import { appendFileSync, readFileSync, writeFileSync } from "fs";
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
 * Strict mode fails the process on refresh errors (scheduled Action).
 * Default mode keeps prebuild/Vercel builds non-fatal.
 * @param {string[]} [argv]
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env]
 */
export function isStrictMode(argv = process.argv, env = process.env) {
  return (
    argv.includes("--strict") ||
    env.REFRESH_VIDEOS_STRICT === "1" ||
    env.REFRESH_VIDEOS_STRICT === "true"
  );
}

/** Emit a GitHub Actions annotation when running inside Actions. */
export function emitGithubAnnotation(level, message, title = "YouTube video refresh") {
  if (!process.env.GITHUB_ACTIONS) return;
  const safe = String(message).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  const safeTitle = String(title).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  console.error(`::${level} title=${safeTitle}::${safe}`);
}

/** Append a short Markdown block to the Actions job summary when available. */
export function appendJobSummary(markdown) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  try {
    appendFileSync(summaryPath, `${markdown}\n`);
  } catch {
    // Summary is best-effort; never break the refresh over a write failure.
  }
}

/**
 * Report a soft or hard refresh failure. Returns the exit code that callers
 * should use (1 in strict mode, 0 otherwise).
 */
export function reportRefreshFailure(message, { strict = false } = {}) {
  console.error(`refresh-videos: ${message}`);
  emitGithubAnnotation(strict ? "error" : "warning", message);
  appendJobSummary(
    `### Video refresh ${strict ? "failed" : "degraded"}\n\n${message}\n`
  );
  return strict ? 1 : 0;
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
  const strict = isStrictMode();
  try {
    // 1. Fetch the feed; the 10s budget covers headers AND body.
    const feedXml = await fetchTextWithTimeout(FEED_URL, 10_000);

    // 2. Parse + select featured/recent via the shared resolver (same logic the
    //    runtime path in src/lib/get-videos.ts uses).
    const entries = parseFeed(feedXml);
    const selected = await selectLatestVideos(entries);
    if (!selected) {
      const code = reportRefreshFailure(
        "feed did not yield 2+ long-form videos with 2+ recent — aborting, keeping existing json",
        { strict }
      );
      process.exit(code);
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
        appendJobSummary(
          "### Video refresh ok\n\nFeed content unchanged; kept existing `videos.generated.json`.\n"
        );
        return;
      }
    } catch {
      // No existing file or unparsable: fall through and write.
    }

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
    console.log(
      `refresh-videos: wrote ${OUTPUT_PATH} (featured=${output.featured.id}, recent=${output.recent.length})`
    );
    appendJobSummary(
      `### Video refresh wrote snapshot\n\n- Featured: \`${output.featured.id}\` — ${output.featured.title}\n- Recent: ${output.recent.length}\n- generatedAt: \`${output.generatedAt}\`\n`
    );
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const code = reportRefreshFailure(`unexpected error — ${detail}`, {
      strict,
    });
    // Do NOT touch the existing json.
    process.exit(code);
  }
}
