# Plan 007: Stop paying for motion nobody can see (idle rAF, offscreen marquees)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 41d69c7..HEAD -- src/components/ui/SmoothScroll.tsx src/components/ui/TypeMarquee.tsx src/components/sections/SocialProof.tsx src/app/globals.css src/hooks`
> On any mismatch with the "Current state" excerpts below, STOP.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW-MED (touches the scroll feel — the site's signature; verify carefully)
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `41d69c7`, 2026-06-13

## Why this matters

Three things run forever on every page: the Lenis requestAnimationFrame loop
(even when the tab is hidden), and two CSS marquees (the hero NEWAKE band and
the brand marquee) that keep animating when scrolled offscreen. None of it is
visible work; all of it costs battery on mobile and compositor time on
desktop. The marquee item is already tracked as TODOS.md P4; this plan
specifies both fixes. (The hero atmosphere image re-export, TODOS P3, is
explicitly NOT in this plan — it requires regenerating an image, which an
executor cannot do; see Maintenance notes.)

## Current state

- `src/components/ui/SmoothScroll.tsx` (entire relevant body):

```tsx
useEffect(() => {
  if (reducedMotion) return;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    anchors: true,
  });

  let rafId: number;
  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
  };
}, [reducedMotion]);
```

  Note: browsers throttle rAF in hidden tabs, but they do not stop it, and
  the loop also runs at full rate when the tab is visible but idle.

- `src/components/ui/TypeMarquee.tsx` — currently a SERVER component (no
  "use client"); renders `.type-marquee__track` whose CSS is
  `animation: marquee-scroll <duration>s linear infinite` (globals.css, search
  `.type-marquee__track`). Duration comes in via inline
  `style={{ animationDuration: ... }}`.
- `src/components/sections/SocialProof.tsx` — server component rendering
  `.social-marquee__track` (globals.css, search `.social-marquee__track`,
  `animation: marquee-scroll 28s linear infinite`).
- Both marquees already have correct `prefers-reduced-motion` CSS fallbacks
  (animation: none) — do not disturb those blocks.
- `test/type-marquee.test.tsx` exists and asserts items render, the
  duplicate group is aria-hidden, and `animationDuration` is applied — it
  must keep passing.
- Repo conventions: hooks live in `src/hooks/` with a `useX.ts` name and a
  one-line doc comment (see `src/hooks/useMediaQuery.ts`). Client components
  declare `"use client"` on line 1.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Tests     | `npm test`         | all pass |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint      | `npm run lint`     | exit 0 |
| Build     | `npm run build`    | 13/13 static pages |

## Scope

**In scope**:
- `src/components/ui/SmoothScroll.tsx`
- `src/components/ui/TypeMarquee.tsx`
- `src/components/sections/SocialProof.tsx`
- `src/hooks/useMarqueePause.ts` (create)
- `test/type-marquee.test.tsx` (extend), `test/reduced-motion.test.tsx` or a
  new `test/marquee-pause.test.tsx` (create)

**Out of scope** (do NOT touch):
- `src/app/globals.css` — pausing is done via the `animation-play-state`
  inline style / element style, not by editing keyframes or media queries.
- Hero scroll choreography, ParallaxImage springs, MouseEffects hooks.
- `public/atmosphere/*` (see Maintenance notes).

## Git workflow

- Branch: `advisor/007-idle-motion-cost`
- Commits: `perf(scroll): pause the lenis raf loop in hidden tabs`, then
  `perf(marquee): pause marquee animations offscreen`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Pause the Lenis rAF loop when the document is hidden

Inside the existing effect in `SmoothScroll.tsx`, gate the loop on document
visibility:

```tsx
let rafId: number | null = null;
function raf(time: number) {
  lenis.raf(time);
  rafId = requestAnimationFrame(raf);
}
function start() { if (rafId === null) rafId = requestAnimationFrame(raf); }
function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }
function onVisibility() { document.hidden ? stop() : start(); }

document.addEventListener("visibilitychange", onVisibility);
start();

return () => {
  document.removeEventListener("visibilitychange", onVisibility);
  stop();
  lenis.destroy();
};
```

Keep the `reducedMotion` early-return exactly as is.

**Verify**: `npx tsc --noEmit` → exit 0; `npm run build` → succeeds. Manual check (if a browser is available): scrolling still feels smooth on `npm run start`; switching tabs and back does not freeze scrolling.

### Step 2: Create `src/hooks/useMarqueePause.ts`

```tsx
"use client" is NOT needed in the hook file itself; the consuming components carry it.

import { useEffect, useRef } from "react";

/** Pauses a CSS animation on the referenced element while it is offscreen. */
export function useMarqueePause<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") return;
    const io = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
```

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 3: Apply it to both marquees

- `TypeMarquee.tsx`: add `"use client"` as line 1, attach
  `const trackRef = useMarqueePause<HTMLDivElement>()` to the
  `.type-marquee__track` div (`ref={trackRef}`). Everything else unchanged —
  client components still server-render their HTML, so SSR output and the
  existing tests are unaffected.
- `SocialProof.tsx`: same treatment on the `.social-marquee__track` element
  (add `"use client"` line 1, ref on the track).

**Verify**: `npm test` → all pass (notably `test/type-marquee.test.tsx`); `npm run build` → 13/13 pages.

### Step 4: Tests (see Test plan)

**Verify**: `npm test` → all pass including the new assertions.

## Test plan

- New `test/marquee-pause.test.tsx`:
  1. Stub IntersectionObserver with a controllable implementation that
     captures the callback. Render `TypeMarquee` with two items; fire the
     callback with `isIntersecting: false` → the track element's
     `style.animationPlayState` is `"paused"`; fire with `true` → `"running"`.
  2. Same shape for `SocialProof`'s track.
  3. Cleanup: unmount → the observer's `disconnect` was called.
- Existing `test/type-marquee.test.tsx` must pass unmodified (if it needs a
  change, that is a signal you altered rendered output — STOP and re-check).
- Verification: `npm test` → all pass.

## Done criteria

ALL must hold:

- [ ] `grep -n "visibilitychange" src/components/ui/SmoothScroll.tsx` → 2 matches (add + remove)
- [ ] `grep -ln "useMarqueePause" src/components` → lists TypeMarquee.tsx and SocialProof.tsx
- [ ] `npm test` exits 0; `test/type-marquee.test.tsx` unmodified or with additive-only changes
- [ ] `npm run lint && npx tsc --noEmit && npm run build` all exit 0
- [ ] No globals.css changes (`git status --porcelain` excludes it)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Converting TypeMarquee/SocialProof to client components changes their
  server-rendered HTML in any way that breaks an existing test.
- Lenis scrolling visibly degrades after Step 1 (anchor jumps stop working,
  scroll feels stepped) — the scroll feel is the product; do not ship a
  guess.
- The inline `animationPlayState` style conflicts with the reduced-motion
  CSS (it should not — reduced motion sets `animation: none`, which makes
  play-state irrelevant — but if tests show otherwise, stop).

## Maintenance notes

- DELIBERATELY EXCLUDED: the hero atmosphere image re-export (TODOS P3).
  The correct fix is regenerating a taller source image (~2400x1440+) with
  an image-generation tool and re-compressing to ~300KB — an executor
  without image tooling cannot do this. The operator should regenerate using
  the prompt conventions in DESIGN.md "Atmosphere imagery" and simply replace
  `public/atmosphere/atmosphere-seoul-dusk.jpg` (same path, no code change).
- If a future change replaces CSS marquees with JS-driven ones, delete
  `useMarqueePause` along with it.
- Reviewer: scroll the homepage end to end on the preview deploy; the
  signature feel must be unchanged.
