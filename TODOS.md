# TODOS

## Hero

### Re-export the Seoul dusk atmosphere image with more vertical resolution
**Priority:** P3
`public/atmosphere/atmosphere-seoul-dusk.jpg` is 2400x1018 but covers 124% of viewport height, so tall viewports upscale it ~1.75x. Regenerate at a taller crop (or art-direct separate mobile/desktop sources) and re-compress to ~300KB. The green wash hides most softness today.

### Source the hero stat strip from src/data/stats.ts
**Priority:** P3
Hero.tsx hardcodes 195K+/150M+/Forbes/13 yrs inline while stats.ts carries overlapping values for the media kit. Single source would prevent the two surfaces drifting when the numbers change.

## Completed

### Auto-refresh the video list from the channel RSS feed
**Completed:** v0.4.0.0 (2026-06-13) via plans/005-video-rss-refresh.md

### Pause the marquees when offscreen
**Completed:** v0.4.0.0 (2026-06-13) via plans/007-idle-motion-cost.md
