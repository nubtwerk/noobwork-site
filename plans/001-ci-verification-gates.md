# Plan 001: Make CI catch type errors, lint violations, and broken builds before merge

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 41d69c7..HEAD -- .github/workflows/test.yml package.json`
> If either file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `41d69c7`, 2026-06-13

## Why this matters

CI currently runs only the vitest suite. There is no typecheck script in the
repo at all, and neither `npm run lint` nor `next build` runs in CI, so a
TypeScript error or a broken production build can merge green into main and
only surface on the Vercel production deploy. The workflow also has no
`permissions:` block, so the GITHUB_TOKEN gets default (broader) permissions
it never needs. After this plan, every push and PR is gated on lint, types,
build, and tests, with a read-only token.

## Current state

- `.github/workflows/test.yml` — the entire CI:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
```

- `package.json` scripts (no typecheck entry):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- `tsconfig.json` already has `"noEmit": true`, so `tsc --noEmit` is the
  correct typecheck invocation. The repo builds clean today (verified at the
  planned-at commit): `npm run build` compiles and prerenders 13 static pages.
- No environment variables are required for the build (stated in CLAUDE.md
  "Deployment" section and true in practice).

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `npm ci`           | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no output |
| Lint      | `npm run lint`     | exit 0, no output |
| Build     | `npm run build`    | exit 0, "Compiled successfully", 13/13 static pages |
| Tests     | `npm test`         | exit 0, all tests pass (63 at planning time) |

## Scope

**In scope** (the only files you should modify):
- `.github/workflows/test.yml`
- `package.json` (scripts block only)

**Out of scope** (do NOT touch):
- Any source file under `src/` — if typecheck or lint fails on current code,
  that is a STOP condition, not something to fix here.
- `package-lock.json` — adding a script does not change dependencies; if the
  lockfile shows a diff, you did something wrong.
- Vercel configuration of any kind.

## Git workflow

- Branch: `advisor/001-ci-verification-gates` (repo uses feature branches; CLAUDE.md mandates them)
- Commit style: conventional commits, e.g. `ci: gate merges on lint, typecheck, and build` (see `git log --oneline` for examples like `feat(seo): ...`, `chore: bump version...`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the typecheck script

In `package.json`, add to `scripts`:

```json
"typecheck": "tsc --noEmit"
```

**Verify**: `npm run typecheck` → exits 0 with no errors.

### Step 2: Harden and extend the workflow

Replace the `jobs:` section of `.github/workflows/test.yml` so the file reads:

```yaml
name: Test
on: [push, pull_request]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm test
```

Order rationale: cheap fast checks first, build before tests so a broken
build is reported as the build's failure, not as cascading test noise.

**Verify** (locally simulating CI): `npm ci && npm run lint && npm run typecheck && npm run build && npm test` → every command exits 0.

### Step 3: Validate the workflow syntax

**Verify**: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/test.yml')); print('valid yaml')"` → prints `valid yaml`. (If `actionlint` is installed, prefer `actionlint .github/workflows/test.yml` → no output.)

## Test plan

No new tests — this plan changes only tooling. The full existing suite is the
regression check and is run in Step 2's verification.

## Done criteria

ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `grep -c "permissions:" .github/workflows/test.yml` returns 1
- [ ] `grep -c "npm run build" .github/workflows/test.yml` returns 1
- [ ] `npm ci && npm run lint && npm run typecheck && npm run build && npm test` all exit 0
- [ ] `git status --porcelain` shows only the two in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npx tsc --noEmit` fails on the current codebase — the baseline is broken
  and fixing source files is out of scope for this plan.
- `npm run lint` reports errors on the current codebase (same reason).
- The workflow file no longer matches the "Current state" excerpt (someone
  already extended CI — reconcile instead of overwriting).

## Maintenance notes

- Any future plan in this directory assumes these gates exist; this plan is
  the verification baseline and should land first.
- CI wall time grows by roughly the build time (~1-2 min). If that becomes
  annoying, split lint/typecheck and build+test into parallel jobs — do not
  remove gates.
- Reviewer should scrutinize: that no `permissions` beyond `contents: read`
  were added, and that the npm cache config was preserved.
