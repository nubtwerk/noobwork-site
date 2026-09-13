# YouTube Latest Uploads refresh

The homepage reel prefers a generated snapshot of the channel’s public RSS feed, with a pinned fallback when the snapshot is missing or invalid.

## Surfaces

| Path | Behavior |
|------|----------|
| `npm run build` → `prebuild` | Runs `scripts/refresh-videos.mjs` **non-fatally**. Network/parse failures leave the existing `src/data/videos.generated.json` alone so Vercel/CI builds never break. |
| `npm run refresh:videos` | Same script; local/manual use. |
| `npm run refresh:videos -- --strict` | Same fetch/select logic, but **exits non-zero** on failure and emits a GitHub Actions error annotation + job summary when `GITHUB_ACTIONS` is set. |
| Daily Action (`.github/workflows/refresh-videos.yml`) | Cron `0 6 * * *` (06:00 UTC) plus `workflow_dispatch`. Runs strict refresh; if `videos.generated.json` changed, opens/updates PR branch `chore/refresh-videos`. |

Runtime (`src/lib/get-videos.ts`) may also re-fetch the feed on an hourly cache; if that fails it falls back to the committed snapshot / pinned list in `src/data/videos.ts`.

## Failure visibility

- **Scheduled job:** `--strict` fails the workflow. Check the Actions log, `::error::` annotation, and job summary.
- **Prebuild / default:** still exit `0`, but under GitHub Actions a failed or sparse feed emits a `::warning::` annotation and a job-summary note so degraded refreshes are not silent.

## Snapshot field

Successful writes set `generatedAt` (ISO) on `src/data/videos.generated.json`. The reel shows a subtle “As of …” line from the newest upload publish date (preferred) or that snapshot timestamp.
