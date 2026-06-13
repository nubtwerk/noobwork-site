# Plan 004: Style the orphaned media-kit CTA and remove dead code and assets

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 41d69c7..HEAD -- src/app/media-kit/page.tsx src/app/context/page.tsx src/app/globals.css src/data public .gitignore`
> On any mismatch with the "Current state" excerpts below, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `41d69c7`, 2026-06-13

## Why this matters

The media-kit page is the sponsor-conversion surface, and its closing
"Let's Work Together" CTA references CSS classes that do not exist, so the
heading and copy render unstyled (browser defaults) in the middle of an
otherwise art-directed page. The context page has the same problem on one
button. Separately, the repo carries dead weight: three data exports nothing
imports, five logo PNGs (~46KB) nothing references, and a 131KB TypeScript
build cache committed to git despite a .gitignore rule for it.

## Current state

- `src/app/media-kit/page.tsx:170-176` — the CTA block:

```tsx
<div className="mk-cta">
  <h2 className="newsletter-title">
    Let&apos;s Work <span className="section-heading__title--primary">Together</span>
  </h2>
  <p className="newsletter-copy">
    Interested in a partnership? Reach out directly or follow my Beacons page for updates and announcements.
  </p>
```

  `grep -c "newsletter-title\|newsletter-copy" src/app/globals.css` → 0.
  The page's other headings use `.mk-editorial__heading` (NEWAKE, defined in
  globals.css); `.mk-cta` itself IS defined (centered padded band).

- `src/app/context/page.tsx:88`:

```tsx
<Link href="/media-kit" className="btn btn--ghost">
```

  `.btn--ghost` has no definition. Defined button variants in globals.css:
  `.btn--primary` (green gradient), `.btn--secondary` (light, bordered),
  `.btn--tertiary` (translucent, for dark surfaces), `.btn--sand`. The
  context page CTA area sits on the light page background, next to a
  `btn--primary`, so `btn--secondary` is the correct existing variant.

- Unused data exports (verified zero importers at the planned-at commit):
  - `src/data/stats.ts` — `export const heroStats` (lines 3-6). KEEP
    `mediaKitStats` in the same file; it is used by /media-kit and PartnerCta.
  - `src/data/interests.ts` — entire file is one unused export.
  - `src/data/media-kit.ts` — `export const audienceDemographics` (the top
    export). KEEP `contentCategories`, `partnershipProcess`,
    `partnershipTypes` (used by the media-kit page).
- Unreferenced assets (verified `grep -rn "logo-stacked\|logo-variant" src` → 0):
  `public/logo-stacked.png`, `public/logo-variant-1.png` … `logo-variant-4.png`.
- `tsconfig.tsbuildinfo` is tracked by git even though `.gitignore` contains
  `*.tsbuildinfo` (it was committed before the rule existed).

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Tests     | `npm test`         | all pass |
| Lint      | `npm run lint`     | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build     | `npm run build`    | 13/13 static pages |

## Scope

**In scope**:
- `src/app/media-kit/page.tsx` (two className strings only)
- `src/app/context/page.tsx` (one className string only)
- `src/app/globals.css` (add two class definitions in the media-kit section)
- `src/data/stats.ts`, `src/data/interests.ts`, `src/data/media-kit.ts`
- `public/logo-stacked.png`, `public/logo-variant-{1,2,3,4}.png` (delete)
- `tsconfig.tsbuildinfo` (untrack), `.gitignore` (no change expected; rule exists)

**Out of scope** (do NOT touch):
- `public/joachim.jpg` — still referenced by `src/components/JsonLd.tsx`.
- `public/noobwork-wordmark.svg`, `public/atmosphere/` — in active use.
- Any other CSS in globals.css; no renames of existing classes.
- `src/data/videos.ts`, `src/data/social-links.ts`, `src/data/work-items.ts`,
  `src/data/external-links.ts`, `src/data/focus-items.ts` — all in use.

## Git workflow

- Branch: `advisor/004-dead-code-orphan-css`
- Commits (bisectable): `fix(media-kit): style the orphaned CTA classes`,
  `chore: remove unused data exports and logo assets`,
  `chore: untrack tsconfig.tsbuildinfo`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Define the missing CTA classes

In `src/app/globals.css`, find the media-kit section (search for `.mk-cta {`)
and add directly after that block:

```css
.mk-cta .newsletter-title {
  margin: 0 0 0.9rem;
  font-family: var(--font-family-display);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  word-spacing: 0.18em;
  color: var(--color-foreground);
}

.mk-cta .newsletter-copy {
  margin: 0 auto 1.6rem;
  max-width: 34rem;
  color: rgba(46, 29, 35, 0.65);
  line-height: 1.7;
}
```

Rationale: matches the page's NEWAKE heading treatment (`word-spacing: 0.18em`
is required on poster-scale NEWAKE per DESIGN.md "Cinematic Layer"); scoping
under `.mk-cta` keeps the names from leaking. Do NOT rename the markup
classes — the markup stays as-is, the CSS catches up.

**Verify**: `grep -c "newsletter-title" src/app/globals.css` → 1.

### Step 2: Fix the ghost button

In `src/app/context/page.tsx:88`, change `className="btn btn--ghost"` to
`className="btn btn--secondary"`.

**Verify**: `grep -rn "btn--ghost" src/` → no matches.

### Step 3: Remove unused data exports

- Delete the `heroStats` export (and its now-unused references, if any,
  inside `src/data/stats.ts` only).
- Delete the file `src/data/interests.ts`.
- Delete the `audienceDemographics` export from `src/data/media-kit.ts`.

**Verify**: `grep -rn "heroStats\|audienceDemographics\|@/data/interests" src/ test/` → no matches; `npx tsc --noEmit` → exit 0.

### Step 4: Delete unreferenced logo PNGs

```bash
grep -rn "logo-stacked\|logo-variant" src/ public/ --include="*.ts*" --include="*.json" --include="*.webmanifest" || echo CLEAN
git rm public/logo-stacked.png public/logo-variant-1.png public/logo-variant-2.png public/logo-variant-3.png public/logo-variant-4.png
```

Run the grep FIRST; only delete if it prints CLEAN.

**Verify**: `ls public/*.png 2>/dev/null` → no output.

### Step 5: Untrack the TS build cache

```bash
git rm --cached tsconfig.tsbuildinfo
```

**Verify**: `git ls-files | grep tsbuildinfo` → no output; the local file still exists on disk.

### Step 6: Full battery + visual confirmation

**Verify**: `npm run lint && npx tsc --noEmit && npm test && npm run build` → all exit 0.
If a headless browser is available (gstack `/browse`), load
`/media-kit` after `npm run start` and confirm the "Let's Work Together"
heading now renders in the NEWAKE display font; otherwise note "visual check
deferred to reviewer" in your report.

## Test plan

No new tests. Existing suites cover the touched pages indirectly; Step 3's
typecheck is the guard for the export removals. (A visual check is listed in
Step 6 because CSS correctness is not unit-testable here.)

## Done criteria

ALL must hold:

- [ ] `grep -c "newsletter-title" src/app/globals.css` → 1
- [ ] `grep -rn "btn--ghost\|heroStats\|audienceDemographics" src/ test/` → no matches
- [ ] `src/data/interests.ts` does not exist
- [ ] `ls public/*.png 2>/dev/null` → empty
- [ ] `git ls-files | grep tsbuildinfo` → empty
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` all exit 0
- [ ] Only in-scope files modified (`git status --porcelain`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The Step 4 grep does NOT print CLEAN (something references a logo PNG —
  report where).
- Removing an export breaks the typecheck somewhere outside `src/data/`
  (means a consumer exists that grep missed).
- The media-kit CTA visually still looks wrong after Step 1 (report a
  screenshot/description; do not start restyling other parts of the page).

## Maintenance notes

- If a future design pass wants the CTA heading bigger/different, edit the
  two new scoped rules; the class names were kept to avoid markup churn.
- `heroStats` was dead because Hero.tsx hardcodes its stat strip; unifying
  those is tracked separately in TODOS.md (P3) and intentionally NOT done
  here (one thing at a time).
- Reviewer: confirm the deleted PNGs aren't referenced by any external
  consumer (e.g. old social posts hotlinking them) before merge; if they
  are, move them rather than delete.
