# TODOS

## Hero

### Re-export the Seoul dusk atmosphere image with more vertical resolution
**Priority:** P3
`public/atmosphere/atmosphere-seoul-dusk.jpg` is 2400x1018 but covers 124% of viewport height, so tall viewports upscale it ~1.75x. Regenerate at a taller crop (or art-direct separate mobile/desktop sources) and re-compress to ~300KB. The green wash hides most softness today.

## Content Reel

### Soften the Shorts-check failure mode under YouTube rate limiting
**Priority:** P3
`scripts/refresh-videos.mjs` `isShort()` now throws on any non-200/non-3xx status so an ambiguous response skips the entry. That is the right call for correctness, but a mid-run 429 (rate limit) makes every following entry skip, which can regress the featured/recent set to older uploads until the next build. It is fail-safe (never corrupt, never aborts, self-heals next deploy) so this is low priority. If it ever bites, treat 429/5xx as retry-with-backoff or keep-and-flag rather than skip. Surfaced by the v0.5.1.0 adversarial review.

## Completed

### Source the hero stat strip from a single source of truth
**Completed:** v0.5.0.0 (2026-06-13) — the subscriber/view figures now derive from `src/data/profile-facts.ts`, guarded against drift by a build-time test.

### Auto-refresh the video list from the channel RSS feed
**Completed:** v0.4.0.0 (2026-06-13) via plans/005-video-rss-refresh.md

### Pause the marquees when offscreen
**Completed:** v0.4.0.0 (2026-06-13) via plans/007-idle-motion-cost.md
