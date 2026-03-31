# Changelog

All notable changes to this project will be documented in this file.

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
