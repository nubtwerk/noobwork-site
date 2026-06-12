# TODOS

## Content Reel

### Auto-refresh the video list from the channel RSS feed
**Priority:** P2
`src/data/videos.ts` is a manually pinned list under a "Latest Uploads." heading. Fetch https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ at build time (filter shorts, keep newest-first, verify maxresdefault exists for the featured pick) so the reel never goes stale. Noticed during the v0.3.0.0 cinematic redesign review.

## Hero

### Re-export the Seoul dusk atmosphere image with more vertical resolution
**Priority:** P3
`public/atmosphere/atmosphere-seoul-dusk.jpg` is 2400x1018 but covers 124% of viewport height, so tall viewports upscale it ~1.75x. Regenerate at a taller crop (or art-direct separate mobile/desktop sources) and re-compress to ~300KB. The green wash hides most softness today.

### Source the hero stat strip from src/data/stats.ts
**Priority:** P3
Hero.tsx hardcodes 195K+/150M+/Forbes/13 yrs inline while stats.ts carries overlapping values for the media kit. Single source would prevent the two surfaces drifting when the numbers change.

## Performance

### Pause the marquees when offscreen
**Priority:** P4
`.type-marquee__track` and `.social-marquee__track` run infinite compositor animations for the page's lifetime. An IntersectionObserver toggling `animation-play-state: paused` (or `content-visibility: auto` on the bands) would save battery on long reads.

## Completed
