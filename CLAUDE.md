# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Premium lifestyle creator brand website for Joachim Haraldsen (noobwork.no). Single-page portfolio + Media Kit page. Newsletter and update signups are handled externally through Beacons (`https://beacons.ai/noobwork`). Core content is hardcoded in React components and data files.

## Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** via PostCSS (no tailwind.config; CSS-based config in `globals.css`)
- **ESLint 9** with flat config (`eslint.config.mjs`), extending `next/core-web-vitals` and `next/typescript`

## Architecture

Single-page portfolio using the Next.js App Router. The app lives in `src/app/`:

- `layout.tsx` - Root layout with NEWAKE + Inter fonts, SEO metadata (Open Graph, Twitter Card)
- `page.tsx` - Main page: Hero, SocialProof, About, ContentPillars, Work, Newsletter, Connect
- `media-kit/page.tsx` - Dedicated Media Kit page for brand partnerships
- `globals.css` - Tailwind imports and CSS custom properties for the design system

Path alias: `@/*` maps to `./src/*`.

## Design System

Based on the **NOOBWORK 2026 Brand Guidelines**. Full specification in `DESIGN.md` (colors, typography, spacing, component patterns, do's/don'ts). All changes must follow `DESIGN.md`.

Figma source: https://www.figma.com/design/a75Y0hDzd5ymqFUeOleJnv/NOOBWORK_Brandbook-2026

**Typography:** NEWAKE (headings/display, uppercase) + Inter (body). NEWAKE loaded as a local font from `src/fonts/`.

**Colors** (CSS custom properties in `globals.css`):
- `--background: #ECD8BF` (beige)
- `--foreground: #2E1D23` (brown)
- `--primary: #2C3930` (Tokyo Green)
- `--primary-hover: #3F4F44` (Light Green)
- `--accent: #511B5D` (Purple Dark)
- `--accent-light: #B111D5` (Purple Light)
- `--sand: #A27B5D` (sand/borders)
- `--surface: #F8F8F8` (off-white cards/sections)

**Brand tone:** Premium, warm, grounded. No neon, no gamer cliches. Refined aesthetic with subtle gaming heritage nods.

Responsive via Tailwind `md:` and `lg:` breakpoints, mobile-first.

## Deployment

Standard Vercel-compatible Next.js setup. No environment variables are required for newsletter subscription flows.
