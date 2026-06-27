# Plan 009: Hero atmosphere image — taller Seoul dusk crop

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.

## Status

- **Priority**: P3
- **Effort**: S (operator image work) + S (site wiring if art-directed variants)
- **Risk**: LOW
- **Depends on**: —
- **Category**: polish / imagery
- **Planned at**: 2026-06-27

## Why this matters

The poster hero uses `public/atmosphere/atmosphere-seoul-dusk.jpg` as a
full-bleed background with `inset: -12%` parallax (`poster-hero__bg`). The
source is **2400×1018** but the hero covers **124% of viewport height**, so
on tall viewports (common on desktop and modern phones) the image upscales
~1.75×. The green wash hides most softness today, but the hero is the first
thing visitors see — a sharper, taller source removes the upscale and gives
more room for art-directed cropping.

Tracked in `TODOS.md` (Hero section, P3).

## Current state

- `src/components/sections/Hero.tsx` — `<Image fill priority sizes="100vw"
  className="poster-hero__bg-image" />` with `object-position: center 38%`
  (CSS in `globals.css`).
- `poster-hero` uses `min-height: 100svh`; background layer extends `-12%`
  vertically for scroll parallax.
- Brand rules (`DESIGN.md` → Imagery → Atmosphere): AI-generated atmosphere
  only, **no people**, palette must match Tokyo Green / Sand / Brown, subtle
  35mm grain, dimmed under brand wash.
- No `srcset` / separate mobile-desktop sources today — one JPEG for all
  breakpoints.

## Scope

**In scope**:
- Regenerate or re-export `atmosphere-seoul-dusk.jpg` at a taller aspect
  (target **2400×1600** or **2400×1800**, subject centered on N Seoul Tower
  skyline band).
- Re-compress to **≤300 KB** (current budget; verify with `ls -lh`).
- Optional: add `poster-hero__bg-image` `object-position` tweak after visual
  QA if the new crop shifts the focal point.
- Optional: `<picture>` or Next `<Image>` with `media` queries if operator
  wants distinct mobile ( tighter crop ) vs desktop ( wider ) assets.

**Out of scope**:
- Changing hero copy, motion, or layout structure.
- Replacing atmosphere with real photography of Joachim (brand rule: real
  people only in authentic content, not atmosphere slots).

## Steps

### Step 1: Generate / export the taller asset

Use the brand atmosphere prompt pattern from `DESIGN.md`:

- Seoul dusk skyline, Namsan tower visible, deep forest-green shadows
  (#2C3930), warm sand light (#ECDBBF), brown midtones (#2E1D23), subtle
  film grain, no neon, **no people**.

Export at ≥2400px wide, aspect ≥3:2 height:width.

**Verify**: `file public/atmosphere/atmosphere-seoul-dusk.jpg` exists;
dimensions ≥2400×1400; file size ≤300 KB (or document intentional exception).

### Step 2: Visual QA at tall and short viewports

Run `npm run dev`, check:

- 390×844 (mobile)
- 1440×900 (desktop)
- 1920×1080 (wide)

Confirm tower remains in frame, wash still legible, no banding after compression.

**Verify**: Screenshot the three viewports; no visible upscale blur on tower
silhouette at 1440×900.

### Step 3: Wire optional art-directed sources (only if Step 1 produced two crops)

If mobile and desktop variants exist:

- `atmosphere-seoul-dusk-mobile.jpg` / `atmosphere-seoul-dusk-desktop.jpg`
- Update `Hero.tsx` with `<picture>` or conditional `src` via `useMediaQuery`
  (client component already).

Skip this step if a single tall crop works everywhere.

**Verify**: Lighthouse / manual check — hero `Image` still has `priority` and
`sizes="100vw"`.

### Step 4: Update TODOS.md

Mark the hero atmosphere item completed with version note.

**Verify**: `npm run lint && npm run typecheck && npm test` pass (no test changes
expected unless Hero snapshot tests added).

## Done criteria

- [ ] Taller atmosphere JPEG committed, ≤300 KB (or justified)
- [ ] Hero looks sharp on 1440×900 without obvious upscale
- [ ] Brand atmosphere rules preserved (no people, palette, grain)
- [ ] TODOS.md item retired
- [ ] `plans/README.md` status row updated

## STOP conditions

- Operator cannot source a taller image without people in frame — report and
  pause; do not substitute stock with visible humans.
- Compressed file exceeds 400 KB at acceptable quality — report tradeoff
  (quality vs weight) before committing.
