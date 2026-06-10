# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Premium lifestyle creator brand website for Joachim Haraldsen (noobwork.no). Single-page portfolio + Media Kit page. Newsletter and update signups are handled externally through Beacons (`https://beacons.ai/noobwork`). Core content is hardcoded in React components and data files.

## Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

- `npm test` - Run Vitest test suite
- `npm run test:watch` - Run Vitest in watch mode

Tests live in `test/`. Uses Vitest + @testing-library/react + jsdom.

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** via PostCSS (no tailwind.config; CSS-based config in `globals.css`)
- **ESLint 9** with flat config (`eslint.config.mjs`), extending `next/core-web-vitals` and `next/typescript`

## Architecture

Single-page portfolio using the Next.js App Router. The app lives in `src/app/`:

- `layout.tsx` - Root layout with NEWAKE + Inter fonts, SEO metadata (Open Graph, Twitter Card)
- `page.tsx` - Main page: Hero, SocialProof, About, ContentPillars, Work, Newsletter, Connect
- `media-kit/page.tsx` - Dedicated Media Kit page for brand partnerships
- `globals.css` - Tailwind imports and CSS custom properties for the design system

Path alias: `@/*` maps to `./src/*`.

## Design System

Based on the **NOOBWORK 2026 Brand Guidelines**. Full specification in `DESIGN.md` (colors, typography, spacing, component patterns, do's/don'ts). All changes must follow `DESIGN.md`.

Figma source: https://www.figma.com/design/a75Y0hDzd5ymqFUeOleJnv/NOOBWORK_Brandbook-2026

**Typography:** NEWAKE (headings/display, uppercase) + Inter (body). NEWAKE loaded as a local font from `src/fonts/`.

**Colors** (CSS custom properties in `globals.css`):
- `--background: #F8F8F8` (off-white page background)
- `--foreground: #2E1D23` (brown)
- `--primary: #2C3930` (Tokyo Green)
- `--primary-hover: #3F4F44` (Light Green)
- `--accent: #B111D5` (Purple Light)
- `--accent-dark: #511B5D` (Purple Dark)
- `--sand: #ECDBBF` (warm light beige/hover text)
- `--beige: #A27B5D` (warm brown/focus rings)
- `--surface: #F8F8F8` (off-white cards/sections)

**Brand tone:** Premium, warm, grounded. No neon, no gamer cliches. Refined aesthetic with subtle gaming heritage nods.

Responsive via Tailwind `md:` and `lg:` breakpoints, mobile-first.

## Deployment

Standard Vercel-compatible Next.js setup. No environment variables are required for newsletter subscription flows.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review

## GBrain Search Guidance (configured by /sync-gbrain)
<!-- gstack-gbrain-search-guidance:start -->

GBrain is set up and synced on this machine. The agent should prefer gbrain
over Grep when the question is semantic or when you do not know the exact
identifier yet.

**This worktree is pinned to a worktree-scoped code source** via the
`.gbrain-source` file in the repo root (kubectl-style context). Any
`gbrain code-def`, `code-refs`, `code-callers`, `code-callees`, or `query`
call from anywhere under this worktree routes to that source by default —
no `--source` flag needed.

Two indexed corpora available via the `gbrain` CLI:
- This worktree code (auto-pinned via `.gbrain-source`).
- `~/.gstack/` curated memory (registered as `gstack-brain-<user>` source).

Prefer gbrain when:
- "Where is X handled?" / semantic intent, no exact string yet:
    `gbrain search "<terms>"` or `gbrain query "<question>"`
- "Where is symbol Y defined?" / symbol-based code questions:
    `gbrain code-def <symbol>` or `gbrain code-refs <symbol>`
- "What calls Y?" / "What does Y depend on?":
    `gbrain code-callers <symbol>` / `gbrain code-callees <symbol>`
- "What did we decide last time?" / past plans, retros, learnings:
    `gbrain search "<terms>" --source gstack-brain-<user>`

Grep is still right for known exact strings, regex, multiline patterns, and
file globs. Run `/sync-gbrain` after meaningful code changes.

<!-- gstack-gbrain-search-guidance:end -->
