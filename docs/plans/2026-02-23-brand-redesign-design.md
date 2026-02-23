# Noobwork Brand Redesign — Design Document

**Date:** 2026-02-23
**Goal:** Showcase credibility through a premium visual redesign aligned with the NOOBWORK 2026 Brand Guidelines
**Approach:** Brand-First Overhaul — rebuild visual layer and content on existing Next.js architecture

## Brand Book Reference

Source: `NOOBWORK_Brandbook 2026` (29-page brand manual by Joachim Haraldsen)

### Brand Positioning
- **Premium lifestyle creator brand** born from Norway's largest gaming YouTube channel
- Comeback after 7-year hiatus, combining gaming heritage with lifestyle and personal growth
- Target audience: ambitious individuals aged 16-40, Norway-focused initially
- Tone: Premium, Approachable, Authentic, Confident, Grounded

### Content Pillars
1. **Tokyo Lifestyle** — daily experiences, cultural insights, city energy
2. **Personal Development** — self-improvement, motivation, discipline
3. **Gaming Heritage** — gaming roots fused with lifestyle and growth

## Color System

| Brand Name | Hex | CSS Variable | Role |
|---|---|---|---|
| Tokyo Green | `#3F5438` | `--color-primary` | Primary / Nav / Accents |
| Light Green | `#5E7252` | `--color-primary-light` | Secondary surfaces, hover states |
| Beige | `#DEC8A8` | `--color-background` | Main page background |
| Sand | `#C4B49A` | `--color-sand` | Card surfaces, secondary bg |
| Gray | `#ADAAA0` | `--color-gray` | Subtle backgrounds, borders |
| Brown | `#2D1B14` | `--color-foreground` | Text, headings |
| Purple Light | `#7B4B9E` | `--color-accent` | CTAs, accent elements |
| White | `#FFFFFF` | `--color-surface` | Card backgrounds |

**Note:** Hex values are eyedropper estimates from brand book visual swatches (PDF had placeholder values). Fine-tune during implementation.

**Replaces:** current cream (#FAF7F2) + violet (#7C3AED) + amber (#F59E0B) scheme

## Typography

### Primary: NEWAKE Bold
- Display/heading font (h1-h3, section titles)
- Uppercase, tight letter-spacing
- Loaded as local font via Next.js `localFont()` or `@font-face`
- Source: .woff2 file (needs to be obtained/converted from the font file)

### Secondary: Inter
- Body text font (Light 300, Medium 500, Bold 700)
- Loaded via `next/font/google`
- Light: paragraphs, body copy
- Medium: labels, buttons, nav links
- Bold: emphasis, subheadings

## Logo

### Assets (from brand book export)
- `Layer_1.png` — NOOB WORK. stacked wordmark (beige on transparent)
- `Layer_1-1.png` through `Layer_1-4.png` — additional logo variants
- NW monogram available as separate asset

### Usage
- **Nav:** NOOBWORK. horizontal wordmark (SVG preferred)
- **Favicon:** NW monogram
- **Footer:** NW monogram (small)
- **Replaces:** current text-rendered "noobwork" in nav

## Site Structure

Single-page portfolio + separate Media Kit page.

### Main Page Sections (in order)
1. **Nav** — NOOBWORK. wordmark + minimal links (About, Work, Connect) + Media Kit CTA button
2. **Hero** — Full-width, NEWAKE headline, repositioned as "premium lifestyle creator." Joachim photo. Content pillars listed: Tokyo Lifestyle / Personal Development / Gaming Heritage
3. **About** — Bio rewritten around comeback narrative (7-year hiatus, Tokyo-based, intersection of lifestyle + gaming + business)
4. **Content Pillars** — NEW SECTION. 3-card showcase: Tokyo Lifestyle, Personal Development, Gaming Heritage (descriptions from brand book page 4)
5. **Work/Ventures** — Existing 6 ventures, re-skinned with brand colors and typography
6. **Social Proof** — Brand logos (Forbes, Blast.tv, Heroic, Nava Space, YouTube)
7. **Newsletter** — Re-skinned with brand colors, updated copy to match tone
8. **Connect** — Social media links
9. **Footer** — NW monogram, copyright, minimal

### Media Kit Page (`/media-kit`)
- Re-skinned with brand colors/fonts
- Fix missing PDF download (create or remove button)
- Update stats and copy

## Visual Details

### Imagery Style
- Tokyo lifestyle photography (cherry blossoms, street scenes, cafes, food, cityscapes)
- Warm, natural tones
- Logo overlaid on photography where appropriate
- No neon, no gamer mascots, no futuristic elements

### Animations
- Keep existing Motion scroll animations (fade-in, slide-up)
- Consider subtle parallax on hero image

### Do's and Don'ts (from brand book)
- **DO:** Refined, warm aesthetic communicating sophistication with subtle gaming culture nods
- **DON'T:** Neon colors, futuristic elements, gamer mascots, complex designs

## What Changes vs What Stays

| Aspect | Current | After Redesign |
|---|---|---|
| Colors | Cream + violet + amber | Beige + Tokyo Green + Brown + Purple Light |
| Fonts | System defaults | NEWAKE Bold + Inter |
| Logo | Text "noobwork" | SVG NOOBWORK. wordmark + NW monogram |
| Hero copy | "Creator, Entrepreneur, Esports Pioneer" | Premium lifestyle creator with 3 content pillars |
| Content framing | Esports-centric portfolio | Lifestyle creator brand |
| Brand tone | Generic tech | Premium, warm, grounded, authentic |
| Sections | 6 sections | 7 sections (+ Content Pillars) |
| Tech stack | Next.js 16, React 19, Tailwind v4, Motion | No change |
| ConvertKit integration | Newsletter + Media Kit forms | No change |
| SEO/metadata | Open Graph, Schema.org | Update to match new positioning |
| Media Kit page | Exists but un-branded | Re-skinned to match |

## Technical Notes

- **Architecture stays the same** — Next.js 16 App Router, React 19, Tailwind CSS v4, Motion
- **Edit existing files** — no new framework or major dependency changes
- **Key files to modify:**
  - `src/app/globals.css` — color system, font imports
  - `src/app/layout.tsx` — font loading, metadata
  - `src/app/page.tsx` — section order, new Content Pillars section
  - `src/components/sections/*.tsx` — all sections get visual + copy updates
  - `src/components/layout/Nav.tsx` — logo swap
  - `src/components/layout/Footer.tsx` — logo swap
  - `src/data/*.ts` — updated content/copy
  - `src/app/media-kit/page.tsx` — re-skin
  - `public/` — logo SVGs, new favicon
