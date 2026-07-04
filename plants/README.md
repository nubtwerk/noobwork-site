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
   | `PLANTS_SEED_DEMO` | `true` |
   | `PLANTS_STORE` | `local` |
   | `RESEND_API_KEY` | Your Resend key (magic-link login) |
   | `OPENAI_API_KEY` | Your OpenAI key (photo analysis) |

5. **Deploy** → then **Settings → Domains** → add `plants.noobwork.no`
6. DNS: CNAME `plants` → `cname.vercel-dns.com` (or value Vercel shows)

Demo plants seed automatically on first deploy (`PLANTS_SEED_DEMO=true`).

### Option B — GitHub Actions (optional)

If you prefer CI deploys, add these [GitHub repo secrets](https://github.com/nubtwerk/noobwork-site/settings/secrets/actions):

- `VERCEL_TOKEN` — [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` — Vercel team/project settings → General
- `VERCEL_PLANTS_PROJECT_ID` — same page, Project ID

Then run **Actions → Deploy Plants**, or push a change under `plants/`.

### Cursor / Cloud Agent Vercel access

The Vercel MCP server is **not authenticated** in this cloud agent environment, so the agent cannot create projects or set env vars for you automatically.

To give **Cursor on your machine** Vercel access:

1. **Cursor Settings → MCP → Vercel** → connect / sign in
2. Re-run deploy tasks from the desktop agent

Until then, use Option A in the Vercel dashboard.

## Features

- **Today** dashboard — overdue, due today, photo check-ins
- **Add plant** — species search, room, pot/light modifiers (signed in)
- **Water / snooze** — one-tap timer reset (signed in)
- **Photo check-in** — upload + GPT-4o health summary (signed in)
- **Care info** — per-species tips from bundled catalog (public)

## Connectors (planned)

- Web Push + Vercel Cron for reminders
- Open-Meteo for Seoul humidity adjustments
- Perenual API fallback for unknown species
