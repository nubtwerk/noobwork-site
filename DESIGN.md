# NOOBWORK Brand Guidelines 2026

Source: Figma brandbook `NOOBWORK_Brandbook 2026` by designer.
Figma file: https://www.figma.com/design/a75Y0hDzd5ymqFUeOleJnv/NOOBWORK_Brandbook-2026

## Brand Positioning

Premium lifestyle creator brand. Earth tones, simple, grounded, warmth, ambition, Tokyo lifestyle.
No neon, no gamer cliches, no corporate feel. Refined aesthetic with subtle gaming heritage nods.

## Color Palette

All colors defined as CSS custom properties in `src/app/globals.css` via Tailwind v4 `@theme`.

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| Tokyo Green | `#2C3930` | `bg-primary` / `text-primary` | Primary actions, nav, hero masthead, CTA buttons |
| Light Green | `#3F4F44` | `bg-primary-light` / `bg-primary-hover` | Hover states, secondary green surfaces |
| Brown | `#2E1D23` | `bg-foreground` / `text-foreground` / `bg-brown` | Body text, footer background |
| Beige | `#ECD8BF` | `bg-background` / `text-background` | Page background, text on dark surfaces |
| Sand | `#A27B5D` | `bg-sand` / `text-sand` / `border-sand` | Borders, tertiary surfaces, warm accents |
| Off-white | `#F8F8F8` | `bg-surface` / `bg-offwhite` / `bg-gray` | Card backgrounds, alternate section backgrounds |
| Purple Dark | `#511B5D` | `bg-accent` / `text-accent` | Accent highlights, interest tags, section title highlights |
| Purple Light | `#B111D5` | `bg-accent-light` / `text-accent-light` | Sparingly, bright accent moments |

### Color Rules

- Primary CTA buttons use Tokyo Green (`bg-primary`), NOT purple
- Text on dark backgrounds uses Beige (`text-background`), not white
- Purple is an accent, not a primary. Use it for highlights, tags, and emphasis words in headings
- Section backgrounds alternate between Beige (`bg-background`) and Off-white (`bg-surface`)
- The Content Pillars section uses Tokyo Green (`bg-primary`) as its background
- Footer uses Brown (`bg-foreground`)
- Never use pure black (`#000000`) for text. Always use Brown (`#2E1D23`)
- Never use pure white (`#FFFFFF`) for text. Use Beige (`#ECD8BF`) or Off-white (`#F8F8F8`)

### Approved Color Combinations

| Surface | Text | Use case |
|---------|------|----------|
| Tokyo Green | Beige | Hero masthead, Content Pillars section |
| Beige | Brown | Default page sections |
| Off-white | Brown | Alternate sections (About, Connect) |
| Brown | Beige | Footer |
| Purple Dark | Beige | Accent cards, interest tags |
| Sand | Beige | Warm accent cards |

## Typography

| Role | Font | Weight | Style | CSS variable |
|------|------|--------|-------|-------------|
| Display / Headings | Newake | 400 (renders bold) | Uppercase, tight tracking | `--font-newake` / `font-[family-name:var(--font-newake)]` |
| Body / UI | Inter | 400-600 | Normal case | `--font-inter` / `font-[family-name:var(--font-inter)]` |

### Typography Rules

- All headings (h1, h2, h3 in sections) use Newake, uppercase, `tracking-tight`
- Body text uses Inter at regular weight
- Bold emphasis in body text uses `font-semibold` (Inter 600), not Newake
- Section headers: Newake `text-3xl md:text-4xl uppercase tracking-tight`
- Hero title: Newake `text-5xl md:text-7xl lg:text-8xl`
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
- Primary CTA: `bg-primary text-white rounded-full px-7 py-3 font-semibold`
- Secondary CTA: `bg-offwhite text-foreground rounded-full px-7 py-3 border border-sand`
- Form button: `bg-primary text-white rounded-lg px-8 py-3 font-medium`

### Cards
- Surface cards: `bg-surface rounded-xl p-6 border border-border`
- Content pillar cards: Colored backgrounds (`bg-sand`, `bg-accent`, `bg-brown`) with `rounded-2xl p-8`
- Info cards (Current Focus): `bg-background rounded-3xl p-8`

### Section Headers
- Use the `SectionHeader` component with `title`, `highlight` (accent-colored word), and `subtitle`
- Highlight word defaults to `text-primary`, can be `text-accent` for purple emphasis

### Interest Tags
- `bg-accent text-white rounded-full px-3 py-1 text-sm capitalize`

### Animations
- Entry: `initial={{ opacity: 0, y: 20 }}` with `whileInView`
- Duration: 0.5s, easeOut
- Staggered delays: 0.1s increments for lists

## Content Pillars

Three pillars, always in this order:
1. **Tokyo Lifestyle** - Sand background, city/temple emoji
2. **Personal Development** - Purple background, target emoji
3. **Gaming Heritage** - Brown background, gaming emoji

## Imagery

- Photography style: Natural light, Tokyo urban settings, lifestyle-focused
- Profile images: `rounded-3xl` with subtle shadow
- No stock photos, no overly processed filters
- Brand imagery should feel warm, authentic, grounded

## Don'ts

- No neon or high-saturation gaming colors
- No pure black or pure white
- No Newake for body text
- No distorted or modified logos
- No backgrounds outside the approved color palette
- No rounded corners smaller than `rounded-lg` on cards
- No drop shadows heavier than `shadow-lg`
- No animations longer than 0.6s
