# Plan 006: Close the dangerous test gaps and deduplicate test boilerplate

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 41d69c7..HEAD -- test/ src/lib/load-context.ts src/app/context/llm.txt/route.ts src/components/ui/AnimatedSection.tsx src/components/ui/ScrollProgress.tsx src/components/ui/SmoothScroll.tsx`
> Note: plan 003 legitimately changes `load-context.ts` line 8 (build-time
> date) — that exact change is expected, not drift. Anything else mismatching
> the excerpts is a STOP.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (coordinates with 003: if 003 landed, CopyContextButton tests already exist — skip anything duplicate)
- **Category**: tests
- **Planned at**: commit `41d69c7`, 2026-06-13

## Why this matters

This is a motion-heavy site whose accessibility story depends on
prefers-reduced-motion branches, yet the three components that orchestrate
motion site-wide (AnimatedSection, ScrollProgress, SmoothScroll) have zero
tests on those branches. The /llms.txt endpoint and the file-loading error
path that feeds it are also untested, so a regression there ships silently.
Finally, ten test files duplicate global stubs that `test/setup.ts` already
provides, which makes every stub change a ten-file edit.

## Current state

- `test/setup.ts` installs guarded global stubs (only when missing):
  IntersectionObserver and a `window.matchMedia` returning
  `{ matches: false, ... }`. Because they are installed at setup time, the
  per-file `vi.stubGlobal` blocks below are redundant.
- Ten test files carry this identical beforeEach block (hero, reveal-text,
  about, newsletter, parallax-image, partner-cta, type-marquee, content-reel,
  content-pillars, connect — verify the exact list with the grep in Step 1):

```ts
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
```

  EXCEPTION: `test/reveal-text.test.tsx` has one test that overrides
  matchMedia with `matches: true` (reduced-motion). Per-test overrides like
  that are correct and must be kept.

- Untested reduced-motion branches:
  - `src/components/ui/AnimatedSection.tsx` — `if (prefersReducedMotion) return <div className={className}>{children}</div>;`
  - `src/components/ui/ScrollProgress.tsx` — `if (reducedMotion) return null;` (the whole component is 16 lines; it renders `<motion.div className="scroll-progress" ... aria-hidden="true" />` otherwise)
  - `src/components/ui/SmoothScroll.tsx` — `useEffect(() => { if (reducedMotion) return; const lenis = new Lenis({...}); ... })` — when reduced motion is on, Lenis must never be constructed.
- `src/lib/load-context.ts` — `loadFile` wraps `fs.readFile` in try/catch and
  on error returns a section containing `*Content unavailable for ...*` and
  calls `console.error`. No test exercises the catch.
- `src/app/context/llm.txt/route.ts` — GET handler returning
  `buildContextMarkdown()` with `Content-Type` and `Cache-Control` headers.
  No test imports it.
- Test conventions: vitest + @testing-library/react + jsdom; reduced-motion
  pattern to copy lives in `test/reveal-text.test.tsx` (stub matchMedia with
  `matches: true`, render, assert the static branch).

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Tests     | `npm test`         | all pass |
| One file  | `npx vitest run test/<file>` | that file passes |
| Lint      | `npm run lint`     | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0 |

## Scope

**In scope**:
- All files under `test/` (edits + new files)
- NOTHING under `src/` — if a test reveals a real bug in src, STOP and
  report it; fixing src is not this plan.

**Out of scope** (do NOT touch):
- `src/**` (read-only for this plan)
- `vitest.config.ts` unless a new test physically cannot run without a
  config change (treat as STOP-and-report first)

## Git workflow

- Branch: `advisor/006-test-hardening`
- Commits: `test: dedupe global stubs into setup.ts usage`, then
  `test: cover reduced-motion branches and context error paths`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Remove the redundant stub blocks

Find the duplicates:

```bash
grep -ln "vi.stubGlobal(\"IntersectionObserver\"" test/*.tsx
```

In each listed file, delete the shared beforeEach stub block (and now-unused
`vi`/`beforeEach` imports). KEEP any per-test stub that sets
`matches: true` (reveal-text's reduced-motion test) — convert it to a local
override inside that single test if it currently lives in a shared hook.

**Verify**: `npm test` → all pass; `grep -c "stubGlobal(\"IntersectionObserver\"" test/*.tsx | grep -v ":0"` → at most the files that genuinely need a custom observer (expected: none).

### Step 2: Reduced-motion tests (new file `test/reduced-motion.test.tsx`)

Model on `test/reveal-text.test.tsx`'s reduced-motion test. Three cases:

1. AnimatedSection with matchMedia `matches: true` renders a plain `div`
   (no inline `opacity` style) containing its children.
2. ScrollProgress with `matches: true` renders nothing
   (`container.firstChild` is null); with `matches: false` renders an
   element with class `scroll-progress`.
3. SmoothScroll with `matches: true` never constructs Lenis: mock the
   module (`vi.mock("lenis", () => ({ default: vi.fn(() => ({ raf: vi.fn(), destroy: vi.fn() })) }))`),
   render, assert the mock constructor was not called; with
   `matches: false`, assert it was called once and `destroy` is called on
   unmount.

**Verify**: `npx vitest run test/reduced-motion.test.tsx` → 4+ tests pass.

### Step 3: load-context error path (new file `test/load-context.test.ts`)

Mock the fs layer (`vi.mock("fs/promises")` or whatever module
`load-context.ts` actually imports — read the import line first and mock
exactly that). Case 1: readFile rejects → returned markdown contains
`Content unavailable` and `console.error` was called (spy). Case 2: readFile
resolves with `"# Hello"` → output contains `# Hello` and the
`Last updated:` line.

**Verify**: `npx vitest run test/load-context.test.ts` → passes.

### Step 4: llm.txt route test (new file `test/llm-txt-route.test.ts`)

Import `{ GET }` from `@/app/context/llm.txt/route`, call it, and assert:
status 200, `content-type` header contains `text/markdown` (read the actual
header value from the route source first and assert that exact value),
body text length > 100 and contains a markdown heading. If the route file
imports something jsdom can't satisfy, mock `@/lib/load-context`'s
`buildContextMarkdown` to return a fixture string instead and assert
pass-through.

**Verify**: `npx vitest run test/llm-txt-route.test.ts` → passes.

### Step 5: Full battery

**Verify**: `npm test && npm run lint && npx tsc --noEmit` → all exit 0; total test count strictly greater than before (record before/after counts in your report).

## Test plan

This plan IS the test plan; the new coverage targets are enumerated in
Steps 2-4. Structural patterns: `test/reveal-text.test.tsx` (reduced motion),
`test/content-reel.test.tsx` (mock-and-assert).

## Done criteria

ALL must hold:

- [ ] `npm test` exits 0 with 3 new test files passing
- [ ] No redundant IntersectionObserver/matchMedia stub blocks remain
      (Step 1 grep)
- [ ] Zero modifications under `src/` (`git status --porcelain` shows test/ only)
- [ ] Lint + typecheck exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Removing a stub block makes a test fail (means a test depended on stub
  specifics; report which one rather than re-adding ad-hoc stubs).
- Any new test reveals a genuine src bug (e.g. Lenis constructed despite
  reduced motion). That is a finding, not something to fix here.
- The route handler cannot be imported in the vitest environment after one
  mocking attempt (Next runtime coupling) — report; do not install
  additional test frameworks.

## Maintenance notes

- After this plan, the rule is: global stubs live in `test/setup.ts`,
  per-test overrides (e.g. reduced motion) are local `vi.stubGlobal` calls
  inside the test that needs them.
- The reduced-motion tests guard CSS-independent behavior only; full visual
  verification of motion remains a manual/headless-browser concern (the
  operator uses gstack /browse for that).
- Reviewer: confirm no `src/` diff snuck in.
