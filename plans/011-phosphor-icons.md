# Plan 011: Icon set migration — Lucide to Phosphor

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.

## Status

- **Priority**: P3
- **Effort**: S-M
- **Risk**: LOW (visual-only swap if API mapping is careful)
- **Depends on**: —
- **Category**: polish / de-slop
- **Planned at**: 2026-06-27

## Why this matters

The redesign skill audit flags **Lucide-only iconography** as a common AI
default. The site uses Lucide sparingly (Connect rows, Content Reel play/
external link, nav hamburger SVG is inline). Swapping to **Phosphor** (or
Heroicons) adds subtle differentiation without changing layout.

## Current state

- Dependency: `lucide-react@^0.563.0` in `package.json`.
- Usages (grep at planning time):
  - `src/components/sections/Connect.tsx` — `ArrowUpRight`
  - `src/components/sections/ContentReel.tsx` — `Play`, `ArrowUpRight`
  - `src/components/ui/SocialIcon.tsx` — may use Lucide or custom SVGs (verify)
- Nav hamburger: inline SVG (no change needed).
- Tests mock rendered icons indirectly via aria labels — should survive swap if
  `aria-hidden` preserved.

## Scope

**In scope**:
- Add `@phosphor-icons/react` (tree-shaken imports: `ArrowUpRight`, `Play`).
- Replace Lucide imports component-by-component.
- Match **stroke weight** visually to current 2px Lucide stroke (Phosphor
  `weight="regular"` or `bold` — pick one site-wide).
- Standardize icon size props (Connect: 22px arrow, Reel play: 26px fill).
- Remove `lucide-react` from dependencies if no usages remain.

**Out of scope**:
- Redesigning SocialIcon brand marks (YouTube, Instagram, etc.) — those are
  custom/logomark paths, not generic UI icons.
- Favicon / app icon changes.

## Steps

### Step 1: Inventory

```bash
rg "lucide-react" src/
```

Document every import and rendered size/weight.

**Verify**: List matches grep output; no hidden dynamic imports.

### Step 2: Install Phosphor

```bash
npm install @phosphor-icons/react
```

Use subpath imports for bundle size:

```tsx
import { ArrowUpRight, Play } from "@phosphor-icons/react/dist/ssr";
```

(Use `/dist/ssr` in server components if any; Connect/Reel are client — verify
Phosphor SSR guidance for Next 16.)

**Verify**: `npm run build` — check bundle delta; note in PR if >5 KB gzipped.

### Step 3: Swap components

| File | Lucide | Phosphor |
|------|--------|----------|
| Connect.tsx | ArrowUpRight | ArrowUpRight |
| ContentReel.tsx | Play, ArrowUpRight | Play (fill weight), ArrowUpRight |

Adjust CSS if Phosphor default box differs (optical ±1px nudge per redesign
skill).

**Verify**: Visual check Connect hover arrow nudge + reel play button centering.

### Step 4: Remove Lucide

```bash
npm uninstall lucide-react
```

**Verify**: `rg lucide` returns zero in `src/`; build + tests pass.

### Step 5: Tests

Run existing `test/connect.test.tsx`, `test/content-reel.test.tsx`,
`test/social-icon.test.tsx` — update only if queries broke.

**Verify**: `npm test` all pass.

## Done criteria

- [ ] Zero `lucide-react` imports
- [ ] Icon stroke weight consistent site-wide
- [ ] No accessibility regressions (decorative icons stay `aria-hidden`)
- [ ] Full verification battery green
- [ ] `plans/README.md` status row updated

## STOP conditions

- Phosphor SSR import causes Next 16 build errors after one documented fix
  attempt — report; fallback to `@heroicons/react/24/outline` instead.
- SocialIcon unexpectedly depended on Lucide — stop and include in migration map.

## Maintenance notes

- Document chosen Phosphor weight in `DESIGN.md` Component Patterns (one line).
- Bundle measurement optional; homepage is not icon-heavy.
