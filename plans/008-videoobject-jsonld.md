# Plan 008: Add VideoObject structured data for the video reel

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 41d69c7..HEAD -- src/components/JsonLd.tsx src/data/videos.ts test/`
> If plan 005 landed, `src/data/videos.ts` will have changed shape (generated
> json + fallback) — that is EXPECTED drift; read the live file and use its
> exports. Any other mismatch with the excerpts below is a STOP.

## Status

- **Priority**: P3
- **Effort**: S-M
- **Risk**: LOW
- **Depends on**: soft dependency on plans/005-video-rss-refresh.md (it provides ISO publish dates; this plan works without it using the pinned dates below)
- **Category**: direction / seo
- **Planned at**: commit `41d69c7`, 2026-06-13

## Why this matters

The homepage's second section is a reel of real YouTube videos, but the
site's structured data describes only a Person. Search engines and AI
indexers therefore see no machine-readable connection between noobwork.no
and the channel's content. Adding an ItemList of VideoObject entries (built
from the same data file the reel renders from) makes the videos indexable as
the site's creative work, at near-zero maintenance cost because it rides the
existing data source.

## Current state

- `src/components/JsonLd.tsx` — server component rendering ONE
  `<script type="application/ld+json">` via
  `dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}` with a
  Person schema (name "Joachim Haraldsen", url "https://www.noobwork.no",
  image joachim.jpg, sameAs from socialLinks). It is mounted once in
  `src/app/layout.tsx` (all routes).
- `src/data/videos.ts` — exports `featuredVideo: VideoItem` and
  `recentVideos: VideoItem[]` with `{ id, title, date }` where `date` is a
  display string ("Jun 2026"), NOT ISO. If plan 005 has landed, items may
  also carry `publishedIso`.
- ISO publish dates for the pinned items at planning time (verified against
  the channel feed) — use these as a fallback map when `publishedIso` is
  absent:

| id | publishedIso |
|----|--------------|
| j3fcJnIYBEw | 2026-06-10 |
| 6Dt2jvU7Z-w | 2026-06-07 |
| SpHxsZIVuJ4 | 2026-06-06 |
| 23zAbLMuN8I | 2026-06-03 |
| AacH4JBZK_g | 2026-05-29 |

- Google's VideoObject required properties: `name`, `thumbnailUrl`,
  `uploadDate`. We also set `description` (synthesize: `"<title> — video by
  Joachim Haraldsen (Noobwork)"` is NOT acceptable: repo rule forbids em
  dashes; use `"<title>. Video by Joachim Haraldsen (Noobwork)."`),
  `contentUrl`/`url` as the watch URL, and `embedUrl` as the
  youtube-nocookie embed.
- No test exists for JsonLd.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Tests     | `npm test`         | all pass |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build     | `npm run build`    | 13/13 pages |
| Inspect   | `grep -o "VideoObject" .next/server/app/index.html \| head -1` | prints VideoObject (run after build) |

## Scope

**In scope**:
- `src/components/JsonLd.tsx`
- `src/data/videos.ts` ONLY IF adding an optional `publishedIso?: string`
  field + values to the pinned items (skip if plan 005 already added it)
- `test/json-ld.test.tsx` (create)

**Out of scope** (do NOT touch):
- `src/app/layout.tsx` — JsonLd stays mounted where it is.
- `src/components/sections/ContentReel.tsx` — rendering is unaffected.
- The Person schema's existing fields — additive change only.

## Git workflow

- Branch: `advisor/008-videoobject-jsonld`
- Commit: `feat(seo): VideoObject structured data for the video reel`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Ensure ISO dates are available

Read the live `src/data/videos.ts`. If items lack `publishedIso`, add the
optional field to the `VideoItem` interface and fill it for the five pinned
items from the table above.

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 2: Extend JsonLd.tsx

Build the video entries from data (never hardcode ids here):

```tsx
import { featuredVideo, recentVideos } from "@/data/videos";

const toVideoObject = (v: VideoItem) => ({
  "@type": "VideoObject",
  name: v.title,
  description: `${v.title}. Video by Joachim Haraldsen (Noobwork).`,
  thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
  uploadDate: v.publishedIso,
  url: `https://www.youtube.com/watch?v=${v.id}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
});
```

(`hqdefault.jpg` deliberately, not maxres — it exists for every video.)
Omit `uploadDate` when `publishedIso` is undefined (do not invent dates).
Render a SECOND schema object alongside the Person — use the JSON-LD
`@graph` form so one script tag carries both:

```tsx
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    personSchema, // the existing object, unchanged, minus its own @context
    {
      "@type": "ItemList",
      name: "Latest videos by Noobwork",
      itemListElement: [featuredVideo, ...recentVideos].map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: toVideoObject(v),
      })),
    },
  ],
};
```

Keep the single `JSON.stringify` + script tag pattern.

**Verify**: `npm run build` → exit 0, then `grep -c "VideoObject" .next/server/app/index.html` → 5 or more.

### Step 3: Test (see Test plan)

**Verify**: `npm test` → all pass.

### Step 4: Manual validation note

Add to your final report: "validate https://www.noobwork.no after deploy at
https://validator.schema.org/" (the executor cannot do this pre-deploy; the
reviewer does it on the preview URL).

## Test plan

- `test/json-ld.test.tsx`, modeled on the render-and-inspect style of
  existing tests:
  1. Render `<JsonLd />`, grab the script tag
     (`container.querySelector('script[type="application/ld+json"]')`),
     `JSON.parse` its innerHTML — parsing must not throw.
  2. Assert `@graph` contains exactly one Person (name "Joachim Haraldsen")
     and one ItemList whose `itemListElement.length === 1 + recentVideos.length`
     (import the real data; do not hardcode 5).
  3. Assert every VideoObject has `name`, `thumbnailUrl` containing its id,
     and a `url` of the form `https://www.youtube.com/watch?v=<11 chars>`.
  4. Assert no string in the serialized JSON contains `</script` (injection
     guard for the dangerouslySetInnerHTML pattern; titles are repo-
     controlled but the guard is cheap).
- Verification: `npm test` → all pass.

## Done criteria

ALL must hold:

- [ ] Built homepage HTML contains `VideoObject` entries equal to the video count
- [ ] `npm test` exits 0 with `test/json-ld.test.tsx` passing
- [ ] `npm run lint && npx tsc --noEmit && npm run build` all exit 0
- [ ] Person schema fields unchanged (diff of JsonLd.tsx shows only additive structure)
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `videos.ts` at execution time has a shape incompatible with both the
  excerpt above AND plan 005's described output (something else changed it).
- The `@graph` restructure changes how the Person schema validates (compare
  the pre-change script JSON with the Person node inside @graph — they must
  be field-identical except the moved @context).
- A title contains characters that break JSON.parse round-tripping in the
  test (would indicate an encoding bug worth reporting, not patching).

## Maintenance notes

- When plan 005's RSS refresh rotates videos, the structured data follows
  automatically; the only invariant to keep is `publishedIso` flowing
  through the generated json.
- If per-video landing pages are ever added, move VideoObject onto those
  pages and keep only the ItemList on the homepage.
- Reviewer: run the schema validator on the preview deploy; check the
  Search Console "Videos" report a week after production deploy.
