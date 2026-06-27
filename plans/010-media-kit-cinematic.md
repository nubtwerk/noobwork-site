# Plan 010: Media Kit — cinematic layer parity with homepage

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (page is partner-facing; copy/stats must stay accurate)
- **Depends on**: Taste-skill polish pass on homepage (optional reference)
- **Category**: direction / brand
- **Planned at**: 2026-06-27

## Why this matters

The homepage received the 2026 cinematic redesign (poster typography, chapter
headers, dark/light rhythm, index-row hover grammar). The Media Kit at
`/media-kit` still reads as a **functional editorial page** — correct content,
but visually disconnected from the premium portfolio experience partners see
before clicking "Open the Media Kit". Brand partners should feel the same
NOOBWORK world on both surfaces.

## Current state

- `src/app/media-kit/page.tsx` — separate route, uses `.media-hero-section`,
  `.mk-stat-band`, `.mk-editorial` patterns in `globals.css`.
- Typography: Newake headings exist but lack chapter markers, outline accents,
  and `RevealText` / `AnimatedSection` motion used on homepage sections.
- Nav/Footer: shared layout components (good).
- Stats: sourced from `src/data/media-kit.ts` and `src/data/stats.ts` — must
  not drift from `profile-facts.ts` where figures overlap.
- Tests: `test/partner-cta.test.tsx` links to media-kit; no dedicated media-kit
  page test suite today.

## Design read (Taste Skill)

**Reading this as:** B2B partner landing for brand/media buyers, with a
premium consumer/editorial language, leaning toward homepage cinematic patterns
(chapter headers, sand/green/brown rhythm) while keeping scannable stats and
process steps.

**Dials:** preserve brand — match homepage variance/motion; do not introduce new
accent colors or generic SaaS layouts.

## Scope

**In scope**:
- Restructure `/media-kit` hero to use **chapter-head** pattern (marker +
  display title with optional outline accent).
- Apply **dark/light section rhythm** aligned with homepage (green hero masthead
  or brown editorial — pick one primary chapter, not random mid-page dark jumps).
- Add **AnimatedSection** / **RevealText** to hero and section openings (respect
  `prefers-reduced-motion`).
- Unify CTA buttons to `.btn--sand` / `.btn--primary` patterns from homepage.
- Ensure stat band uses **tabular-nums** and Newake values (mirror homepage
  partner block).
- Visual pass on audience charts / process grid — tighten spacing to
  `--section-space` tokens.

**Out of scope**:
- Changing partnership copy, pricing, or stats without operator approval.
- PDF download generation (separate product decision; remove dead button if still
  present — verify live page).
- YouTube reel on media kit (homepage owns fresh video proof).

## Steps

### Step 1: Audit the live media-kit page

Read `src/app/media-kit/page.tsx`, `src/data/media-kit.ts`, and screenshot
https://www.noobwork.no/media-kit. List every section and map to a homepage
equivalent pattern (hero → poster/chapter, stats → partner-stats, etc.).

**Verify**: Written section map in PR description or plan comment.

### Step 2: Hero + stat band

Replace `.media-hero` / `.media-title` block with:

- `.site-section--dark` or `.brand-masthead` wrapper (match homepage hero energy
  at smaller scale — media kit is a sub-page, not full 100svh poster).
- Chapter marker: `"Media Kit / Partnerships"` or similar.
- Display title with outline accent on one line (e.g. "Work with" / "Noobwork.").
- Stat band below fold: reuse `.partner-stats` grid styling from homepage
  PartnerCta where possible (DRY CSS, not duplicate rules).

**Verify**: `npm run dev` — hero readable on mobile; stats match data files.

### Step 3: Editorial sections

For each `.mk-editorial` block:

- Sticky sidebar heading on desktop (already partially there).
- Add `.chapter-head__marker` per section ("Audience", "Deliverables", etc.).
- Entrance: `AnimatedSection` with stagger consistent with homepage (0.1s steps).

**Verify**: No layout shift on load; reduced-motion shows all content immediately.

### Step 4: CTA finale

Bottom CTA should mirror homepage PartnerCta + Newsletter tone:

- Sand or brown chapter, single primary CTA to email + secondary to Beacons if
  relevant.
- `data-magnetic` on CTAs if homepage uses it there.

**Verify**: All mailto/links match `src/data/external-links.ts`.

### Step 5: Tests

Add `test/media-kit.test.tsx`:

- Renders hero heading (accessible name).
- Stat values from `mediaKitStats` appear.
- Primary CTA href is `joachim@noobwork.no` or `/media-kit` anchor as designed.

**Verify**: Full battery passes.

## Done criteria

- [ ] Media kit visually matches homepage cinematic language
- [ ] Stats/copy unchanged unless operator approved typos
- [ ] `prefers-reduced-motion` respected
- [ ] New tests added; `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] `plans/README.md` status row updated

## STOP conditions

- Stats in `media-kit.ts` conflict with `profile-facts.ts` — stop and reconcile
  with operator before changing displayed numbers.
- Scoped CSS exceeds ~150 new lines — split into `media-kit.css` import in page
  only, do not bloat `globals.css` further without justification.
