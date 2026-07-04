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

1. Create a new Vercel project rooted at `plants/`
2. Set root directory to `plants` in project settings
3. Add domain `plants.noobwork.no`
4. Set `AUTH_SECRET`, `RESEND_API_KEY`, `OPENAI_API_KEY`, and `NEXT_PUBLIC_APP_URL`

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
