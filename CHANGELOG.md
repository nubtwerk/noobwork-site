# Changelog

All notable changes to this project will be documented in this file.

## [0.5.0.0] - 2026-06-13

Sharpens the AI-context layer: it now keeps itself honest, points agents at itself, and follows the emerging llms.txt convention.

### Added
- Two-tier llms.txt: `/llms.txt` is now a concise index (one-paragraph summary, contact, links, and a map of every section) for AI agents, while `/llms-full.txt`, `/.well-known/llm.txt`, and `/context/llm.txt` serve the complete profile. This matches the llmstxt.org convention. (The full content moved off `/llms.txt`; it remains reachable at the three paths above and is linked from the index.)
- Active discoverability for the context layer: the Person JSON-LD now carries a `subjectOf` pointer to `/context` (with the llms.txt URL), and the document head advertises a `<link rel="alternate" type="text/markdown">` to `/llms.txt`

### Changed
- The three figures that grow over time (subscriber count, total views, videos published) are now single-sourced in `src/data/profile-facts.ts`. The AI-context markdown injects them via `{{token}}` placeholders at build time, and the media kit and homepage hero derive their display strings from the same source. A build-time guard fails CI if any markdown or source file hardcodes one of these figures instead of deriving it, so the media kit, hero, and context layer can never drift apart again (they had: the context page once claimed 152M views while the rest of the site said 150M+)

### Fixed
- The homepage hero stat strip hardcoded the subscriber and view counts, a copy the earlier single-sourcing work missed; it now derives from `src/data/profile-facts.ts` (closes the tracked hero-stats-dedup item)

## [0.4.0.0] - 2026-06-13

Hardening release from a full-repo deep audit, plus two real features: the video reel now keeps itself current, and the videos are machine-readable to search engines.

### Added
- The Latest Uploads reel refreshes itself from the channel feed on every deploy: a build-time script pulls the YouTube RSS feed, filters out Shorts, verifies thumbnails, and writes the video list, with a hard fallback to the pinned list so an offline build can never break
- VideoObject structured data: the JSON-LD now carries an ItemList of all reel videos (titles, thumbnails, upload dates, watch and embed URLs) alongside the Person schema, making the channel's work indexable from noobwork.no
- `npm run typecheck` script, and CI now gates every push and PR on lint, typecheck, production build, and tests (previously tests only), with a read-only workflow token
- 42 new tests (63 to 105): reduced-motion fallbacks for the motion orchestrators, the llm.txt endpoint, context file-loading error paths, the copy button, the feed parser and its timeout/skip-write helpers, marquee pausing, JSON-LD shape, and a hostile-title escape regression
- The plans/ directory: the full audit findings, executor-ready plans, and execution record

### Changed
- Next.js patched 16.1.6 to 16.2.9, clearing all four high-severity advisories; dev-only dependency advisories fixed; lockfile resynced; next and eslint-config-next are now pinned exactly so framework upgrades are always deliberate
- The Lenis smooth-scroll loop now pauses while the tab is hidden, and both marquees pause when scrolled offscreen, cutting idle battery and compositor cost
- The /context "Last updated" date now derives from the build instead of a hand-maintained constant, so it can never go stale

### Fixed
- The media-kit "Let's Work Together" heading and copy were rendering unstyled (their CSS classes never existed); now styled in the NEWAKE display treatment
- The context page's Media Kit button referenced an undefined button variant; now uses the standard secondary button
- The AI-context page claimed 152,000,000+ total views while the rest of the site says 150M+; figures now agree with stats.ts, guarded by a drift test
- The context copy button copied error pages to the clipboard with a success message when the endpoint failed; it now checks the response and falls back properly, and its reset timer is cleaned up on unmount
- Removed dead code: three unused data exports and five unreferenced logo PNGs

## [0.3.0.0] - 2026-06-12

Cinematic redesign of the homepage. Typography and motion now carry the design; the real channel carries the authenticity.

### Added
- Poster-scale kinetic hero: "NOOBWORK. IS BACK." in NEWAKE at up to 12rem over a Seoul dusk skyline, with masked line reveals on load and scroll-linked choreography (the two lines shear apart, the skyline sinks slower than the page, the stage dims on scroll-out)
- Latest Uploads reel on a dark brown chapter: the real featured video plays in place behind a click facade, four real recent uploads link out to YouTube, newest first, with a subscribe CTA
- Make Something With Me partner section on a sand band: media kit CTA, direct email, and the four headline stats brands care about
- Outline-stroke display type (hero second line, accent words in chapter statements) with a solid-fill fallback wherever text-stroke is unsupported
- TypeMarquee poster band ("Fitness / Personal Development / Gaming Heritage / Seoul") at the hero's bottom edge
- ParallaxImage editorial figures with captions, used for two new AI-generated atmosphere images (Seoul hanok street, gym at dawn). No people, brand color grade
- Giant editorial index rows for Connect (each platform a poster-scale link) and Work & Ventures (NEWAKE venture names with role and phase)
- Legacy /#latest-video anchor preserved inside the new reel section
- No-JS fallback: without JavaScript every motion-hidden element is forced visible
- 23 new tests (videos data validity, content reel facade swap, partner CTA, type marquee, parallax figure, hero, and a regression lock on the RevealText word-spacing fix)

### Changed
- The page now alternates dark and light chapters: green hero, light proof marquee, brown reel, light story, green pillars, light index, sand partner band, brown finale
- About rebuilt as an editorial chapter ("Creator roots. Founder scars.") with asymmetric copy and image columns
- Content Pillars rebuilt as a poster list on Tokyo Green with the gym atmosphere image
- Brand marquee upgraded to NEWAKE display scale
- Newsletter restyled as the dark "Noobwork Is Back" sign-off band
- Navigation fades from a transparent scrim over the hero to the frosted light bar on scroll
- Hero entrance timing tightened so content lands faster after load

### Fixed
- RevealText collapsed the spaces between words at display scale (the separator lived inside the inline-block mask); "Creator roots." no longer renders as "Creatorroots."
- NEWAKE's narrow space glyph compensated with word-spacing on all poster-scale classes
- WCAG AA contrast on chapter markers, section notes, reel dates, and hero/partner stat labels
- Reduced-motion users no longer see the hero entrance animation (CSS-level override beats the hydration race)
- Invalid dt/dd order in the partner stats list
- Stale .connect-chip selector in the magnetic-hover hook
- Removed dead CSS and the unused SectionHeader component

## [0.2.0.0] - 2026-06-10

### Changed
- Repositioned the site from Tokyo lifestyle to the Seoul fitness chapter: hero, about, content pillars (Fitness & Wellness first), metadata, structured data, OG image, and all 15 AI-context pages now tell the current story
- Work & Ventures now features Team Haraldsen and DailyBase alongside Noobwork and Heroic Group; retired Enkelt.ai and the advisory card
- Corrected every public stat against live channel data: 195K+ subscribers, 150M+ total views, 1,800+ videos, 13+ years creating
- Media kit audience data now reflects real YouTube Analytics: 96/4 gender split, 18-34 core, Norway/Sweden/US/Denmark top regions
- All YouTube links use the canonical https://www.youtube.com/@Noobworkify handle
- Featured video updated to the latest training upload

### Added
- Site-wide momentum smooth scrolling (Lenis) so the whole site glides instead of stepping
- Kinetic section headings that reveal word by word, rising out of a mask and unblurring
- Scroll-linked parallax on the hero portrait, staggered stat entrances, and magnetic CTA buttons
- Infinite brand marquee (Forbes, YouTube, Heroic, Blast.tv, Team Haraldsen, DailyBase) with edge fade and pause on hover
- Scroll progress bar under the navigation
- Click-to-play YouTube facade so visitors no longer download YouTube's player on page load
- Root /llms.txt and /llms-full.txt endpoints plus canonical URLs on every page for AI and search discoverability
- Shared useMediaQuery hook (useSyncExternalStore) with tests

All motion respects prefers-reduced-motion and falls back to static layouts.

### Fixed
- Restored the Inter body font via self-hosted next/font
- Open Graph image and llm.txt are now statically generated; every route prerenders at build time
- React lint errors: setState-in-effect in AnimatedSection and MouseEffects, ref-write-during-render in useMousePosition
- Vitest and ESLint no longer scan stale agent worktrees under .claude/

## [0.1.0.0] - 2026-03-31

### Changed
- Replace text-based logo with inline SVG wordmark from Figma brand guidelines, with unique clipPath IDs per instance
- Split monolithic MouseEffects component into 5 focused hooks (useSpotlight, useMagnetic, useTilt, useParallaxAndShimmer, useMousePosition)
- Extract markdown renderer from context page into shared `renderMarkdown` utility
- Separate WorkItem `status` field into explicit `role` and `phase` properties
- Centralize navigation scroll threshold and animation viewport margin into constants
- Centralize Beacons URL into external-links data file
- Derive JSON-LD social links from socialLinks data instead of hardcoding
- Move 404 page inline styles to CSS classes
- Add error handling for missing context files in load-context

### Removed
- Delete unused InterestTag and PillarIcon components

### Added
- 8 new test files covering about, connect, content pillars, external links, render markdown, section header, social icon, and social links
