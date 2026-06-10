# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0.0] - 2026-06-10

### Changed
- Repositioned the site from Tokyo lifestyle to the Seoul fitness chapter: hero, about, content pillars (Fitness & Wellness first), metadata, structured data, OG image, and all 15 AI-context pages now tell the current story
- Work & Ventures now features Team Haraldsen and DailyBase alongside Noobwork and Heroic Group; retired Enkelt.ai and the advisory card
- Corrected every public stat against live channel data: 195K+ subscribers, 150M+ total views, 1,800+ videos, 13+ years creating
- Media kit audience data now reflects real YouTube Analytics: 96/4 gender split, 18-34 core, Norway/Sweden/US/Denmark top regions
- All YouTube links use the canonical https://www.youtube.com/@Noobworkify handle
- Featured video updated to the latest training upload

### Added
- Click-to-play YouTube facade so visitors no longer download YouTube's player on page load
- Root /llms.txt and /llms-full.txt endpoints plus canonical URLs on every page for AI and search discoverability
- Shared useMediaQuery hook (useSyncExternalStore) with tests

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
