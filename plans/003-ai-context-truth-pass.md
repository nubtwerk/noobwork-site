# Plan 003: Make the AI-context pages factually consistent and self-maintaining

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 41d69c7..HEAD -- src/content/ai-context src/lib/load-context.ts src/app/context/CopyContextButton.tsx src/data/stats.ts`
> On any mismatch with the "Current state" excerpts below, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug / docs
- **Planned at**: commit `41d69c7`, 2026-06-13

## Why this matters

The /context page and /llms.txt endpoint advertise themselves as the
source-of-truth about Joachim for AI agents and researchers. Today that
source of truth (a) claims 152,000,000+ total views while the site itself
says 150M+ everywhere else, (b) shows a hand-maintained "Last updated"
date that is already stale, and (c) has a copy button that, on an HTTP
error, copies the error page to the clipboard while showing "Copied to
clipboard". Wrong facts served to AI systems get repeated; this plan fixes
the drift and makes the timestamp derive from the build so it can never go
stale again.

## Current state

- `src/content/ai-context/07-key-facts.md:6`:

```markdown
| Total video views | 152,000,000+ |
```

- `src/data/stats.ts` (authoritative numbers; `mediaKitStats` is rendered on
  /media-kit and in the PartnerCta section):

```ts
export const mediaKitStats: Stat[] = [
  { label: "YouTube Subscribers", value: "195K+", numericValue: 195, suffix: "K+" },
  { label: "Total Video Views", value: "150M+", numericValue: 150, suffix: "M+" },
  { label: "Videos Published", value: "1,800+", numericValue: 1800, suffix: "+" },
  { label: "Years Creating", value: "13+", numericValue: 13, suffix: "+" },
];
```

- `src/lib/load-context.ts:8` and its use at line 47:

```ts
export const CONTEXT_LAST_UPDATED = "2026-06-10";
...
    `> Last updated: ${CONTEXT_LAST_UPDATED}`,
```

  All consumers (/context page, /context/llm.txt route) are statically
  prerendered, so a value computed at module scope is evaluated once per
  build — i.e., "build date" is a truthful "last updated" for this site
  because content only changes via deploys.

- `src/app/context/CopyContextButton.tsx:8-19` (client component):

```tsx
async function handleCopy() {
  try {
    const res = await fetch("/context/llm.txt");
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    // Fallback: open the raw text in a new tab
    window.open("/context/llm.txt", "_blank");
  }
}
```

  Two defects: no `res.ok` check (4xx/5xx bodies are copied as success), and
  the timeout is never cleared if the component unmounts.

- Test conventions: vitest + @testing-library/react; see
  `test/content-reel.test.tsx` for the structural pattern (render, mock,
  assert). `test/setup.ts` already stubs IntersectionObserver and matchMedia.
- Repo copy rule (CLAUDE.md): no em dashes or en dashes in any user-facing
  text you write.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Tests     | `npm test`         | all pass |
| Lint      | `npm run lint`     | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build     | `npm run build`    | 13/13 static pages |

## Scope

**In scope**:
- `src/content/ai-context/07-key-facts.md`
- `src/lib/load-context.ts`
- `src/app/context/CopyContextButton.tsx`
- `test/ai-context-facts.test.ts` (create)
- `test/copy-context-button.test.tsx` (create)

**Out of scope** (do NOT touch):
- The other 14 ai-context markdown files' substance (you will only READ them
  in Step 2 to scan for the same numeric drift; report, don't rewrite prose).
- `src/data/stats.ts` — it is the authority, not the thing to change.
- The llm.txt route handler.

## Git workflow

- Branch: `advisor/003-ai-context-truth-pass`
- Commits: conventional, e.g. `fix(content): align total-views figure with stats.ts`, `fix(context): derive last-updated from build date`, `fix(context): handle HTTP errors in copy button`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Fix the views figure

In `src/content/ai-context/07-key-facts.md` line 6, change
`152,000,000+` to `150,000,000+`.

**Verify**: `grep -rn "152,000,000" src/content/` → no matches.

### Step 2: Scan the other context files for numeric drift

```bash
grep -rn "195\|150\|152\|1,800\|1800\|13" src/content/ai-context/*.md | grep -vi "2026\|2013" | head -30
```

Compare every subscriber/view/video/year figure you find against
`mediaKitStats` above. Fix figures that contradict stats.ts; leave prose
alone. List every change (or "none needed") in your final report.

**Verify**: re-run the grep; remaining hits all match stats.ts values.

### Step 3: Derive CONTEXT_LAST_UPDATED at build time

In `src/lib/load-context.ts`, replace line 8 with:

```ts
/** Evaluated once per production build; content only changes via deploys. */
export const CONTEXT_LAST_UPDATED = new Date().toISOString().slice(0, 10);
```

**Verify**: `npm run build` exits 0, then
`grep -rl "Last updated: $(date +%Y-%m-%d)" .next/server/app 2>/dev/null | head -1` → prints at least one file (the prerendered context output contains today's date).

### Step 4: Harden CopyContextButton

Apply both fixes, preserving the existing fallback behavior:

```tsx
const res = await fetch("/context/llm.txt");
if (!res.ok) throw new Error(`HTTP ${res.status}`);
```

and move the reset timer into an effect so it is cleaned up:

```tsx
useEffect(() => {
  if (!copied) return;
  const id = setTimeout(() => setCopied(false), 2000);
  return () => clearTimeout(id);
}, [copied]);
```

(`handleCopy` then only calls `setCopied(true)` after a successful clipboard
write. Keep the `catch` fallback `window.open` exactly as is.)

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 5: Write the tests (see Test plan)

**Verify**: `npm test` → all pass, including the new files.

## Test plan

- `test/ai-context-facts.test.ts` — drift guard, no rendering needed:
  read `src/content/ai-context/07-key-facts.md` with `fs.readFileSync` and
  assert it contains `150,000,000+` and does NOT contain `152,000,000`.
  Also assert it contains `195,000` or `195K` (subscriber figure consistent
  with stats.ts). Keep assertions on figures only, not prose.
- `test/copy-context-button.test.tsx` — model after `test/content-reel.test.tsx`:
  1. happy path: mock `fetch` resolving `{ ok: true, text: () => "# md" }` and
     `navigator.clipboard.writeText`; click; assert writeText called with
     "# md" and button text becomes "Copied to clipboard".
  2. HTTP error: mock fetch resolving `{ ok: false, status: 500 }`; mock
     `window.open`; click; assert clipboard writeText NOT called and
     `window.open` called with "/context/llm.txt".
  3. reset: with vi.useFakeTimers, after a successful copy advance 2000ms and
     assert text returns to "Copy all as markdown".
- Verification: `npm test` → all pass (66+ tests).

## Done criteria

ALL must hold:

- [ ] `grep -rn "152,000,000" src/` → no matches
- [ ] `grep -n "2026-06-10" src/lib/load-context.ts` → no matches
- [ ] `grep -n "res.ok" src/app/context/CopyContextButton.tsx` → 1 match
- [ ] `npm test` exits 0 with the two new test files passing
- [ ] `npm run lint && npx tsc --noEmit && npm run build` all exit 0
- [ ] Only in-scope files modified (`git status --porcelain`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Step 2 uncovers contradictions that are judgment calls (e.g. two different
  founding years in prose) — list them, do not pick a winner yourself.
- The build-time date approach fails because a consumer turns out to be
  dynamically rendered (look for `export const dynamic` in the context
  route/page — none exists at planning time).
- Clipboard tests fight jsdom (no `navigator.clipboard`): stub it with
  `Object.assign(navigator, { clipboard: { writeText: vi.fn() } })`; if that
  still fails twice, stop and report.

## Maintenance notes

- The drift test makes stats changes deliberately two-step: update stats.ts
  AND 07-key-facts.md together. That friction is the point.
- When the video reel gets RSS automation (plan 005), consider the same
  pattern for subscriber counts later; out of scope here.
- Reviewer: check the diff touches no prose meaning in ai-context files,
  numbers only.
