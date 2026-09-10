# Plants Dashboard — plants.noobwork.no

Apartment plant dashboard for Noobwork: watering timers, species care info, and AI photo check-ins.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** (NOOBWORK earth-tone palette)
- **Local JSON store** (default) or **Supabase Postgres** (production)
- **OpenAI GPT-4o** via Vercel AI SDK for photo condition analysis (optional)
- **Magic-link auth** — public read, owner-only write
- **Species catalog** from [plantfolio-common-plants](https://github.com/Luminoid/plantfolio-common-plants) (filtered at build)

## Commands

```bash
cd plants
npm install
npm run dev          # http://localhost:3001
npm test
npm run build
```

## Auth (public read · owner write)

- **Anyone** can browse Today, all plants, care info, and health summaries
- **Only `ADMIN_EMAIL`** (default `joachim@noobwork.no`) can add plants, water, upload photos, or delete
- Sign in via **magic link** emailed through Resend
- Local dev: set `PLANTS_DEV_LOGIN=true` to print the link when Resend is not configured

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `PLANTS_STORE=local` | File store in `.plants-data/` (no Supabase needed) |
| `PLANTS_STORE=supabase` | Use Supabase — run `supabase/schema.sql` first |
| `ADMIN_EMAIL` | Sole account allowed to edit |
| `AUTH_SECRET` | Signs session + magic-link JWTs (32+ chars) |
| `RESEND_API_KEY` | Sends magic link emails |
| `NEXT_PUBLIC_APP_URL` | Base URL for login links |
| `OPENAI_API_KEY` | GPT-4o photo analysis (stub without it) |
| `PLANTS_DEV_LOGIN` | Show dev login link locally |

## Deploy to plants.noobwork.no

### Option A — Vercel dashboard (recommended, ~5 min)

No GitHub secrets needed. Vercel builds on every push to `main`.

1. Open [vercel.com/new](https://vercel.com/new) → import **`nubtwerk/noobwork-site`**
2. **Root Directory** → `plants` (Edit → set to `plants`, not repo root)
3. **Project name** → e.g. `noobwork-plants`
4. **Environment variables** (Production):

   | Variable | Value |
   |---|---|
   | `AUTH_SECRET` | Random 32+ char string (`openssl rand -hex 32`) |
   | `ADMIN_EMAIL` | `joachim@noobwork.no` |
   | `NEXT_PUBLIC_APP_URL` | `https://plants.noobwork.no` |
   | `PLANTS_SEED_DEMO` | `false` |
   | `PLANTS_STORE` | `supabase` (configure durable storage before deployment) |
   | `RESEND_API_KEY` | Your Resend key (magic-link login) |
   | `OPENAI_API_KEY` | Your OpenAI key (photo analysis) |

5. **Deploy** → then **Settings → Domains** → add `plants.noobwork.no`
6. DNS: CNAME `plants` → `cname.vercel-dns.com` (or value Vercel shows)

Configure durable database and photo storage before deploying a writable collection. Local JSON storage is for a single Node process on a persistent local disk; Vercel function filesystems do not provide persistent application storage. See Production persistence below.

### Option B — GitHub Actions (optional)

If you prefer CI deploys, add these [GitHub repo secrets](https://github.com/nubtwerk/noobwork-site/settings/secrets/actions):

- `VERCEL_TOKEN` — [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` — Vercel team/project settings → General
- `VERCEL_PLANTS_PROJECT_ID` — same page, Project ID

Set the repository variable `PLANTS_ACTIONS_DEPLOY_ENABLED=true` only after these secrets and durable storage are configured. Then run **Actions → Deploy Plants**, or push a change under `plants/`. The workflow verifies lint, types, tests and build before deployment; ordinary repository CI verifies Plants even when this optional deployment is disabled.

## Local collection integrity

Build-time demo seeding creates a missing store only; it never replaces an existing collection. A deliberately empty store stays empty, and read/parse errors are reported without silently resetting the file. In-process transactions are serialized and written through an atomic rename. This does not coordinate multiple processes or machines; use durable database storage for that environment. Back up `.plants-data/` before moving an existing local installation.

## Features

- **Today** dashboard — overdue, due today, photo check-ins, collection stats, Seoul weather nudge
- **By room** — grouped view across living room, bedroom, kitchen, balcony
- **Add / edit plant** — species search, room, pot/light modifiers, custom water interval (signed in)
- **Water / snooze / fertilize** — one-tap care logging (signed in)
- **Bulk water** — water all due plants in one tap (signed in)
- **Photo check-in** — upload + GPT-4o health summary with follow-up scheduling (signed in)
- **Photo timeline** — gallery with before/after comparison on plant detail
- **Why this schedule?** — watering interval explainer with season + pot modifiers
- **JSON export** — full collection backup at `/api/export` (signed in)
- **JSON Feed** — public `/feed.json` for due tasks and health alerts
- **Web Push** — morning digest via Vercel Cron (requires VAPID keys)
- **Care info** — per-species tips from bundled catalog (public)

## Production persistence

On Vercel, set these for durable storage:

| Variable | Purpose |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Photo uploads via Vercel Blob (auto-provisioned in Vercel dashboard) |
| `PLANTS_STORE=supabase` | Postgres for plants, logs, analyses — run `supabase/schema.sql` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push notifications |
| `CRON_SECRET` | Protects `/api/cron/reminders` |

Generate VAPID keys: `npx web-push generate-vapid-keys`

## Connectors

- **Open-Meteo** — Seoul humidity/temperature nudge on Today (disable with `OPEN_METEO_ENABLED=false`)
- **Vercel Cron** — daily push digest at 08:00 KST (`0 23 * * *` UTC)
