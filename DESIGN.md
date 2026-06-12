# NOOBWORK Brand Guidelines 2026

Source: Figma brandbook `NOOBWORK_Brandbook 2026` by designer.
Figma file: https://www.figma.com/design/a75Y0hDzd5ymqFUeOleJnv/NOOBWORK_Brandbook-2026

## Brand Positioning

Premium lifestyle creator brand. Earth tones, simple, grounded, warmth, ambition, the Seoul fitness chapter.
No neon, no gamer cliches, no corporate feel. Refined aesthetic with subtle gaming heritage nods.

## Color Palette

All colors defined as CSS custom properties in `src/app/globals.css` via Tailwind v4 `@theme`.

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| Tokyo Green | `#2C3930` | `bg-primary` / `text-primary` | Primary actions, nav, hero masthead, CTA buttons |
| Light Green | `#3F4F44` | `bg-primary-light` / `bg-primary-hover` | Hover states, secondary green surfaces |
| Brown | `#2E1D23` | `bg-foreground` / `text-foreground` / `bg-brown` | Body text, footer background |
| Off-white | `#F8F8F8` | `bg-background` / `text-background` / `bg-offwhite` | Page background, text on dark surfaces |
| Sand | `#ECDBBF` | `bg-sand` / `text-sand` / `border-sand` | Hover text, warm accents, light warm surfaces |
| Beige | `#A27B5D` | `bg-beige` / `text-beige` | Focus rings, tertiary warm accents |
| Gray | `#D6C6B0` | `bg-gray` | Muted surfaces, subtle backgrounds |
| Purple Dark | `#511B5D` | `bg-accent-dark` / `text-accent-dark` | Accent highlights, interest tags, section title highlights |
| Purple Light | `#B111D5` | `bg-accent` / `text-accent` / `bg-accent-light` | Sparingly, bright accent moments |

### Color Rules

- Primary CTA buttons use Tokyo Green (`bg-primary`), NOT purple
- Text on dark backgrounds uses Off-white (`text-background`), not pure white
- Purple is an accent, not a primary. Use it for highlights, tags, and emphasis words in headings
- Section backgrounds alternate between Off-white (`bg-background`) and Surface (`bg-surface`)
- The Content Pillars section uses Tokyo Green (`bg-primary`) as its background
- Footer uses Brown (`bg-foreground`)
- Never use pure black (`#000000`) for text. Always use Brown (`#2E1D23`)
- Never use pure white (`#FFFFFF`) for text. Use Off-white (`#F8F8F8`) or Sand (`#ECDBBF`)

### Approved Color Combinations

| Surface | Text | Use case |
|---------|------|----------|
| Tokyo Green | Off-white | Hero masthead, Content Pillars section |
| Off-white | Brown | Default page sections |
| Surface | Brown | Alternate sections (About, Connect) |
| Brown | Off-white | Footer |
| Purple Dark | Off-white | Accent cards, interest tags |
| Sand | Off-white | Warm accent cards |

## Typography

| Role | Font | Weight | Style | CSS variable |
|------|------|--------|-------|-------------|
| Display / Headings | Newake | 400 (renders bold) | Uppercase, tight tracking | `--font-newake` / `font-[family-name:var(--font-newake)]` |
| Body / UI | Inter | 400-600 | Normal case | `--font-inter` / `font-[family-name:var(--font-inter)]` |

### Typography Rules

- All headings (h1, h2, h3 in sections) use Newake, uppercase, `tracking-tight`
- Body text uses Inter at regular weight
- Bold emphasis in body text uses `font-semibold` (Inter 600), not Newake
- Section headers: chapter header pattern (`.chapter-head__title`, type scale in the Cinematic Layer section)
- Hero title: poster hero pattern (`.poster-hero__line`, type scale in the Cinematic Layer section)
- Card headings: Newake `text-xl uppercase tracking-tight`
- Never use Newake for body paragraphs or small UI text

## Logo

- **Wordmark:** "NOOBWORK." in Newake, always includes the period
- **Monogram:** "NW" in Newake, used for small applications (favicon, footer, mobile nav)
- Logo colors: Beige on dark backgrounds, Tokyo Green or Brown on light backgrounds
- Never distort, rotate, stretch, outline, or change the logo colors outside the approved palette

## Spacing & Layout

- Max content width: `max-w-6xl` (1152px)
- Section padding: `py-20 px-6`
- Card padding: `p-6` to `p-8`
- Card border radius: `rounded-xl` to `rounded-2xl`
- Image border radius: `rounded-3xl`
- Button border radius: `rounded-full` (pill) for CTAs, `rounded-lg` for form buttons
- Grid gaps: `gap-4` to `gap-12`
- Mobile-first responsive design using `md:` and `lg:` breakpoints

## Component Patterns

### Buttons
- Primary CTA: `bg-primary text-background rounded-full px-7 py-3 font-semibold`
- Secondary CTA: `bg-offwhite text-foreground rounded-full px-7 py-3 border border-sand`
- Form button: `bg-primary text-background rounded-lg px-8 py-3 font-medium`

### Cards
- Surface cards: `bg-surface rounded-xl p-6 border border-border`
- Content pillar cards: Colored backgrounds (`bg-sand`, `bg-accent`, `bg-brown`) with `rounded-2xl p-8`
- Info cards (Current Focus): `bg-background rounded-3xl p-8`

### Section Headers
- The `SectionHeader` component is retired (v0.3.0.0). Sections open with a chapter header: a `.chapter-head__marker` eyebrow ("01 / The Story") above a `.chapter-head__title` or `.chapter-head__display` statement
- Accent words in display statements use the outline stroke variant (`.chapter-head__display-accent`). Type scale and rules live in the Cinematic Layer section

### Interest Tags
- `bg-accent text-background rounded-full px-3 py-1 text-sm capitalize`

### Animations
- Entry: `initial={{ opacity: 0, y: 20 }}` with `whileInView`
- Duration: 0.5s, easeOut
- Staggered delays: 0.1s increments for lists

## Content Pillars

Three pillars, always in this order:
1. **Fitness & Wellness** - Green background, numbered badge ("01")
2. **Personal Development** - Purple background, numbered badge ("02")
3. **Gaming Heritage** - Sand background, numbered badge ("03")

## Imagery

- Photography style: Natural light, Seoul urban settings, fitness and lifestyle-focused
- Profile images: `rounded-3xl` with subtle shadow
- No stock photos, no overly processed filters
- Brand imagery should feel warm, authentic, grounded

### Atmosphere imagery (AI-generated)

The homepage uses AI-generated atmosphere images in `public/atmosphere/`. Rules:

- **Never AI-generate people.** Atmosphere only: cityscapes, interiors, textures
- Color grade must match the palette: deep forest green shadows (#2C3930), warm sand light (#ECDBBF), brown midtones (#2E1D23), subtle 35mm film grain, no neon saturation
- Always dimmed under a brand-colored wash (hero) or framed as an editorial figure with a caption (`ParallaxImage`)
- Real content (YouTube thumbnails, real photos of Joachim) carries authenticity; AI imagery only carries mood

## Cinematic Layer (homepage)

Introduced in the 2026 redesign. Typography and motion carry the design.

### Poster typography
- Hero lines (`.poster-hero__line`): Newake `clamp(3.4rem, 13vw, 12rem)`, line-height 0.86
- Outline variant: transparent fill + `-webkit-text-stroke` in Sand. Used for the second hero line and accent words in display headings (`.chapter-head__display-accent`)
- Chapter titles (`.chapter-head__title`): Newake `clamp(2.6rem, 6.5vw, 5.4rem)`
- Display statements (`.chapter-head__display`): Newake `clamp(2.8rem, 8.5vw, 7.4rem)`
- **Newake's space glyph is very narrow.** All poster-scale classes carry `word-spacing: 0.18em`. Keep this on any new display class
- Chapter markers (`.chapter-head__marker`): Inter 0.74rem, 700, `letter-spacing: 0.22em`, uppercase ("01 / The Story")

### Dark/light scroll rhythm
Sections alternate, in order: Hero (Tokyo Green + Seoul dusk image), SocialProof (light), ContentReel (Brown), About (light), ContentPillars (Tokyo Green + gym image), Work (light), PartnerCta (Sand), Newsletter + Connect + Footer (Brown finale).

### Motion grammar
- Scroll choreography: hero lines shear apart on scroll-out, background sinks slower than the page (`useScroll` + `useTransform`), editorial images drift via `ParallaxImage`
- Entrance: masked line rises (`.poster-hero__line-mask`), word-by-word `RevealText`, `AnimatedSection` blur-up
- Marquees: `TypeMarquee` (poster Newake band, solid or outline) and `.social-marquee` (brand names)
- Index rows (work, pillars, connect, reel list): hover slides the row `translateX(8-10px)` and recolors to Sand
- Every animation has a `prefers-reduced-motion` fallback. Scroll-linked transforms are exempt from the 0.6s duration cap; discrete animations are not (entrance reveals up to 0.9s are the approved exception)

## Don'ts

- No neon or high-saturation gaming colors
- No pure black or pure white
- No Newake for body text
- No distorted or modified logos
- No backgrounds outside the approved color palette
- No rounded corners smaller than `rounded-lg` on cards
- No drop shadows heavier than `shadow-lg`
- No animations longer than 0.6s
