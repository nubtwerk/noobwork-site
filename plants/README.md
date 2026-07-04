# Plants Dashboard — plants.noobwork.no

Apartment plant dashboard for Noobwork: watering timers, species care info, and AI photo check-ins.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** (NOOBWORK earth-tone palette)
- **Local JSON store** (default) or **Supabase Postgres** (production)
- **Anthropic Claude** via Vercel AI SDK for photo condition analysis (optional)
- **Species catalog** from [plantfolio-common-plants](https://github.com/Luminoid/plantfolio-common-plants) (filtered at build)

## Commands

```bash
cd plants
npm install
npm run dev          # http://localhost:3001
npm test
npm run build
```

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `PLANTS_STORE=local` | File store in `.plants-data/` (no Supabase needed) |
| `PLANTS_STORE=supabase` | Use Supabase — run `supabase/schema.sql` first |
| `ANTHROPIC_API_KEY` | Enables real photo analysis (stub without it) |

## Deploy to plants.noobwork.no

1. Create a new Vercel project rooted at `plants/`
2. Set root directory to `plants` in project settings
3. Add domain `plants.noobwork.no`
4. Configure env vars for Supabase + Anthropic when ready

## Features (v0.1)

- **Today** dashboard — overdue, due today, photo check-ins
- **Add plant** — species search, room, pot/light modifiers
- **Water / snooze** — one-tap timer reset
- **Photo check-in** — upload + optional AI health summary
- **Care info** — per-species tips from bundled catalog

## Connectors (planned)

- Web Push + Vercel Cron for reminders
- Open-Meteo for Seoul humidity adjustments
- Perenual API fallback for unknown species
