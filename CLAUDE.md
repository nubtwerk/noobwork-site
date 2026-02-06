# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Joachim Haraldsen (noobwork.no). Static site with no backend, API routes, database, or CMS — all content is hardcoded in React components.

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

- `layout.tsx` — Root layout with Inter font, SEO metadata (Open Graph, Twitter Card)
- `page.tsx` — The full portfolio page (nav, hero, about, work/ventures, connect, footer) as one component
- `globals.css` — Tailwind imports and CSS custom properties for the design system

Path alias: `@/*` maps to `./src/*`

## Design System

CSS custom properties defined in `globals.css`:
- `--background: #FAF7F2` (cream)
- `--foreground: #3D2E24` (dark brown)
- `--primary: #7C3AED` (purple/violet)

The site uses a warm color palette with purple accents. Responsive via Tailwind's `md:` and `lg:` breakpoints, mobile-first.

## Deployment

Standard Vercel-compatible Next.js setup. No environment variables required.
