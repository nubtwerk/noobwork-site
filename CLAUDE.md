# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Premium lifestyle creator brand website for Joachim Haraldsen (noobwork.no). Single-page portfolio + Media Kit page. ConvertKit API integration for newsletter/media-kit signups. All content hardcoded in React components and data files.

## Commands

- `npm run dev` — Start Next.js development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** via PostCSS (not a tailwind.config — uses CSS-based config in `globals.css`)
- **ESLint 9** with flat config (`eslint.config.mjs`), extending `next/core-web-vitals` and `next/typescript`

## Architecture

Single-page portfolio using the Next.js App Router. The entire app lives in `src/app/`:

- `layout.tsx` — Root layout with NEWAKE + Inter fonts, SEO metadata (Open Graph, Twitter Card)
- `page.tsx` — Main page: Hero, SocialProof, About, ContentPillars, Work, Newsletter, Connect
- `media-kit/page.tsx` — Dedicated Media Kit page for brand partnerships
- `globals.css` — Tailwind imports and CSS custom properties for the design system
- `api/subscribe/route.ts` — ConvertKit newsletter/media-kit subscription endpoint

Path alias: `@/*` maps to `./src/*`

## Design System

Based on the **NOOBWORK 2026 Brand Guidelines**.

**Typography:** NEWAKE Bold (headings/display) + Inter (body). NEWAKE loaded as local font from `src/fonts/`.

**Colors** (CSS custom properties in `globals.css`):
- `--background: #DEC8A8` (beige)
- `--foreground: #2D1B14` (brown)
- `--primary: #3F5438` (Tokyo Green)
- `--accent: #7B4B9E` (Purple Light)
- `--sand: #C4B49A` (sand/borders)

**Brand tone:** Premium, warm, grounded. No neon, no gamer cliches. Refined aesthetic with subtle gaming heritage nods.

Responsive via Tailwind's `md:` and `lg:` breakpoints, mobile-first.

## Deployment

Standard Vercel-compatible Next.js setup. Environment variables: `KIT_API_KEY`, `KIT_FORM_ID_NEWSLETTER`, `KIT_FORM_ID_MEDIA_KIT` for ConvertKit integration.
