# Plan 005: Auto-refresh the Latest Uploads reel from the YouTube feed at build time

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 41d69c7..HEAD -- src/data/videos.ts src/components/sections/ContentReel.tsx package.json test/videos.test.ts`
> On any mismatch with the "Current state" excerpts below, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (network-dependent build step; mitigated by hard fallback)
- **Depends on**: plans/001-ci-verification-gates.md (CI runs build, which exercises the new prebuild)
- **Category**: direction
- **Planned at**: commit `41d69c7`, 2026-06-13

## Why this matters

The homepage's "Latest Uploads." reel is hand-pinned in `src/data/videos.ts`.
The channel uploads daily, so the reel reads stale within a week of any
deploy, which undercuts the section's own claim of showing the real channel.
This plan adds a build-time refresh from the channel's public RSS feed with
a hard fallback to the pinned list, so a network failure can never break a
build and the worst case is exactly today's behavior.

This was already tracked as the top item in TODOS.md; this plan is its
specification.

## Current state

- `src/data/videos.ts` — exports `featuredVideo: VideoItem` and
  `recentVideos: VideoItem[]` where `VideoItem = { id, title, date }`
  (`date` is a display string like "Jun 2026"). Header comment documents the
  feed URL and the ordering contract:

```ts
/**
 * Real uploads from youtube.com/@Noobworkify. Refresh occasionally:
 * https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ
 *
 * Ordering contract: recentVideos is newest-first ...
 */
```

- `src/components/sections/ContentReel.tsx` — consumes
  `featuredVideo`/`recentVideos` from `@/data/videos`; already falls back
  from `maxresdefault.jpg` to `hqdefault.jpg` via an `onError` on the
  featured `<Image>`. Do not change this component.
- `test/videos.test.ts` — asserts every item has an 11-char YouTube id
  (`/^[A-Za-z0-9_-]{11}$/`), non-empty title/date, and no duplicate ids.
  These tests must keep passing against whatever videos.ts exports.
- Feed facts (verified at planning time): the feed returns ~15 entries,
  newest first, mixing Shorts and long-form. Entries contain
  `<yt:videoId>`, `<title>`, `<published>` (ISO 8601). Shorts are
  detectable WITHOUT an API key: `https://www.youtube.com/shorts/<id>`
  returns HTTP 200 for a Short and a 30x redirect for a normal video.
- `package.json` has no `prebuild` script today. npm runs `prebuild`
  automatically before `build` — this works on Vercel too.
- Builds must never require credentials (CLAUDE.md: no env vars needed).

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Refresh   | `node scripts/refresh-videos.mjs` | exit 0 ALWAYS (even offline); writes or skips `src/data/videos.generated.json` |
| Tests     | `npm test`         | all pass |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build     | `npm run build`    | 13/13 pages; prebuild ran first |

## Scope

**In scope**:
- `scripts/refresh-videos.mjs` (create)
- `src/data/videos.generated.json` (create, committed snapshot)
- `src/data/videos.ts` (rewire to prefer the generated file, keep pinned
  fallback)
- `package.json` (add `prebuild` script)
- `test/videos.test.ts` (extend), `test/refresh-videos.test.ts` (create)
- `tsconfig.json` ONLY if `resolveJsonModule` is not already enabled

**Out of scope** (do NOT touch):
- `src/components/sections/ContentReel.tsx` — the data contract is the
  interface; the component must not change.
- Anything involving the YouTube Data API or credentials.
- TODOS.md (the operator retires the item after merge).

## Git workflow

- Branch: `advisor/005-video-rss-refresh`
- Commits (bisectable): script first, then data rewiring, then prebuild hook.
  Style: `feat(reel): build-time refresh of the video list from the channel feed`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Write `scripts/refresh-videos.mjs`

Plain Node (>=18, global fetch), no new dependencies. Export the pure pieces
for testing and guard the entrypoint:

```js
export function parseFeed(xml) { /* regex over <entry> blocks -> [{id, title, publishedIso}] */ }
export function formatDisplayDate(iso) { /* -> "Jun 2026" via en-US Intl */ }
export async function isShort(id, fetchImpl = fetch) {
  const res = await fetchImpl(`https://www.youtube.com/shorts/${id}`, { method: "HEAD", redirect: "manual" });
  return res.status === 200; // 30x = regular video
}
```

Main flow (only when run directly, `process.argv[1]` check):
1. GET `https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ`
   with a 10s AbortController timeout.
2. `parseFeed`, keep newest-first order, classify each entry with `isShort`
   (sequential, stop once 5 long-form videos are found).
3. Featured = newest long-form; verify its `maxresdefault.jpg` exists
   (HEAD `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` → 200 AND
   content-length > 10000, because YouTube serves a small placeholder for
   missing maxres). If verification fails, still proceed (the component has
   a runtime fallback) but log a warning.
4. Write `src/data/videos.generated.json`:
   `{ "generatedAt": "<ISO>", "featured": {id,title,date,publishedIso}, "recent": [4 items, newest-first] }`
5. ANY failure (network, parse, fewer than 2 long-form found): log the
   reason to stderr and `process.exit(0)` WITHOUT touching the existing
   json. The build must never fail because YouTube was unreachable.

**Verify**: `node scripts/refresh-videos.mjs` → exit 0; if online,
`src/data/videos.generated.json` exists and `node -e "const j=require('./src/data/videos.generated.json'); if(!/^[A-Za-z0-9_-]{11}$/.test(j.featured.id)) throw 1; console.log('ok', j.recent.length)"` prints `ok 4`.

### Step 2: Rewire `src/data/videos.ts`

Keep the existing pinned `featuredVideo`/`recentVideos` values but rename
them to `fallbackFeatured`/`fallbackRecent` (not exported). Import the
generated json (check `tsconfig.json` has `"resolveJsonModule": true`; Next
defaults include it — add it only if missing) and export:

```ts
import generated from "./videos.generated.json";

function isValid(v: unknown): v is VideoItem { /* id 11 chars, title, date non-empty */ }

export const featuredVideo: VideoItem = isValid(generated?.featured) ? generated.featured : fallbackFeatured;
export const recentVideos: VideoItem[] =
  Array.isArray(generated?.recent) && generated.recent.length >= 2 && generated.recent.every(isValid)
    ? generated.recent
    : fallbackRecent;
```

Preserve the header comment, updating it to describe the new mechanism and
keep the newest-first ordering contract.

**Verify**: `npx tsc --noEmit` → exit 0; `npm test` → videos tests pass.

### Step 3: Commit the first generated snapshot

Run the script once (online) and commit the resulting json so local dev and
offline builds have fresh-ish data without network.

**Verify**: `git status --porcelain | grep videos.generated.json` → shows the new file staged/added.

### Step 4: Wire the prebuild hook

In `package.json` scripts add:

```json
"prebuild": "node scripts/refresh-videos.mjs"
```

**Verify**: `npm run build` → output shows the refresh script ran before the Next build; build completes 13/13.

### Step 5: Tests (see Test plan)

**Verify**: `npm test` → all pass including the new file.

## Test plan

- `test/refresh-videos.test.ts` (vitest imports the .mjs):
  - `parseFeed` against an inline fixture string containing 3 `<entry>`
    blocks (use real structure: `<yt:videoId>`, `<title>`, `<published>`) →
    returns 3 items, newest-first preserved, titles decoded.
  - `formatDisplayDate("2026-06-07T00:00:00+00:00")` → `"Jun 2026"`.
  - `isShort` with an injected fake fetch returning status 200 → true;
    status 303 → false. NO real network in tests.
- Extend `test/videos.test.ts`: keep all existing assertions (they now
  validate whichever source won); add one test importing the json directly
  and asserting that IF it parses, `recent.length >= 2` implies the exports
  came from it (sanity of the selection logic).
- Verification: `npm test` → all pass.

## Done criteria

ALL must hold:

- [ ] `node scripts/refresh-videos.mjs` exits 0 both online and with network
      blocked (simulate: temporarily set `https_proxy=http://127.0.0.1:1` for
      the command) and never deletes the existing json
- [ ] `src/data/videos.generated.json` exists and is committed
- [ ] `npm run build` runs the refresh then builds 13/13 pages
- [ ] `npm test` exits 0 including new parser tests
- [ ] `npx tsc --noEmit` and `npm run lint` exit 0
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The feed XML structure does not contain `<yt:videoId>`/`<published>` as
  described (YouTube changed the schema) — report a sample entry.
- The Shorts HEAD heuristic returns 200 for a known long-form id
  (`6Dt2jvU7Z-w` is long-form; `Jw_i9FNOI78` was a Short at planning time) —
  the heuristic broke; do not invent another one.
- vitest cannot import the .mjs (loader error) after one config attempt.
- Adding `resolveJsonModule` causes typecheck errors elsewhere.

## Maintenance notes

- The committed json snapshot goes stale between deploys by design; every
  Vercel build refreshes it in the build environment. If the operator wants
  fresher-than-deploy data, that is a separate ISR/route-handler decision.
- Plan 008 (VideoObject JSON-LD) wants ISO publish dates; the generated json
  already carries `publishedIso` per item for that purpose.
- Reviewer: confirm the script has zero dependencies and exits 0 on failure;
  that property is what makes the prebuild hook safe.
