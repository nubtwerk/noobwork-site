# Noobwork Brand Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign noobwork.no to match the NOOBWORK 2026 Brand Guidelines — new colors, typography, logo, and content positioning as a premium lifestyle creator brand.

**Architecture:** Edit existing Next.js 16 / Tailwind v4 components in-place. No new frameworks or dependencies beyond the NEWAKE font file. All changes are CSS theme updates, component re-styling, and copy rewrites.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), ConvertKit API

**Design Doc:** `docs/plans/2026-02-23-brand-redesign-design.md`

---

### Task 1: Add NEWAKE Font and Update Font Loading

**Files:**
- Create: `src/fonts/newake-bold.woff2` (or .otf/.ttf — download NEWAKE Bold font file)
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Obtain NEWAKE Bold font file**

Download NEWAKE Bold font (free display font). Place the .woff2 (or .otf) file at `src/fonts/newake-bold.woff2`.

NEWAKE is a free font by Dhia Eddin. Can be found on dafont, fontspace, or similar.

**Step 2: Update layout.tsx — load both fonts**

Replace the current Inter import with both NEWAKE (local) and Inter (Google):

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import SkipToContent from "@/components/layout/SkipToContent";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newake = localFont({
  src: "../fonts/newake-bold.woff2",
  variable: "--font-newake",
  weight: "700",
  display: "swap",
});

// ... rest of layout (metadata updated in Task 14)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${newake.variable}`}>
      <body className={inter.className}>
        <JsonLd />
        <SkipToContent />
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Update globals.css — add font-family references**

Add to the `@theme` block:
```css
--font-family-display: var(--font-newake), system-ui, sans-serif;
--font-family-body: var(--font-inter), system-ui, sans-serif;
```

Update body:
```css
body {
  color: var(--color-foreground);
  background: var(--color-background);
  font-family: var(--font-family-body);
}
```

**Step 4: Verify fonts load**

Run: `npm run dev`
Open browser, inspect elements. Headings should show NEWAKE, body should show Inter.

**Step 5: Commit**

```bash
git add src/fonts/ src/app/layout.tsx src/app/globals.css
git commit -m "feat: add NEWAKE display font and Inter body font"
```

---

### Task 2: Update Color System

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace the @theme block with brand colors**

```css
@import "tailwindcss";

@theme {
  --color-background: #DEC8A8;
  --color-foreground: #2D1B14;
  --color-primary: #3F5438;
  --color-primary-hover: #5E7252;
  --color-primary-light: #5E7252;
  --color-accent: #7B4B9E;
  --color-sand: #C4B49A;
  --color-gray: #ADAAA0;
  --color-border: #C4B49A;
  --color-surface: #FFFFFF;
  --font-family-display: var(--font-newake), system-ui, sans-serif;
  --font-family-body: var(--font-inter), system-ui, sans-serif;
}
```

**Step 2: Verify colors in dev server**

Run: `npm run dev`
Page background should now be warm beige (#DEC8A8). Text should be dark brown (#2D1B14). Primary accents should be Tokyo Green (#3F5438).

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: update color system to brand guidelines"
```

---

### Task 3: Add Logo Assets

**Files:**
- Copy: brand book `Layer_1.png` files to `public/`
- Create: `src/components/ui/Logo.tsx`

**Step 1: Copy logo files from brand book to public/**

```bash
cp "/c/Users/joach/Downloads/NOOBWORK_Brandbook 2026/Layer_1.png" public/logo-stacked.png
cp "/c/Users/joach/Downloads/NOOBWORK_Brandbook 2026/Layer_1-1.png" public/logo-variant-1.png
cp "/c/Users/joach/Downloads/NOOBWORK_Brandbook 2026/Layer_1-2.png" public/logo-variant-2.png
cp "/c/Users/joach/Downloads/NOOBWORK_Brandbook 2026/Layer_1-3.png" public/logo-variant-3.png
cp "/c/Users/joach/Downloads/NOOBWORK_Brandbook 2026/Layer_1-4.png" public/logo-variant-4.png
```

**Step 2: Create Logo component**

Create `src/components/ui/Logo.tsx`:

```tsx
import Image from "next/image";

interface LogoProps {
  variant?: "wordmark" | "monogram";
  className?: string;
  height?: number;
}

export default function Logo({ variant = "wordmark", className, height = 24 }: LogoProps) {
  if (variant === "wordmark") {
    return (
      <span className={`font-[family-name:var(--font-newake)] text-primary font-bold tracking-tight uppercase ${className ?? ""}`}>
        NOOBWORK.
      </span>
    );
  }

  return (
    <span className={`font-[family-name:var(--font-newake)] text-primary font-bold tracking-tight uppercase text-sm ${className ?? ""}`}>
      NW
    </span>
  );
}
```

**Step 3: Commit**

```bash
git add public/logo-*.png src/components/ui/Logo.tsx
git commit -m "feat: add brand logo assets and Logo component"
```

---

### Task 4: Update Nav

**Files:**
- Modify: `src/components/layout/Nav.tsx`

**Step 1: Replace nav with brand-styled version**

```tsx
"use client";

import { useState } from "react";
import Logo from "@/components/ui/Logo";
import MediaKitModal from "@/components/ui/MediaKitModal";

export default function Nav() {
  const [mediaKitOpen, setMediaKitOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main navigation" className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-sand">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" onClick={(e) => { if (window.location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className="cursor-pointer text-xl">
            <Logo variant="wordmark" />
          </a>
          <div className="flex items-center gap-6 text-sm text-foreground/70 font-medium">
            <a href="/#about" className="hover:text-primary transition-colors">About</a>
            <a href="/#work" className="hover:text-primary transition-colors">Work</a>
            <a href="/#connect" className="hover:text-primary transition-colors">Connect</a>
            <button
              onClick={() => setMediaKitOpen(true)}
              className="px-4 py-1.5 bg-primary text-white rounded-full text-sm hover:bg-primary-hover transition-colors"
            >
              Media Kit
            </button>
          </div>
        </div>
      </nav>
      <MediaKitModal isOpen={mediaKitOpen} onClose={() => setMediaKitOpen(false)} />
    </>
  );
}
```

**Step 2: Verify nav renders with NOOBWORK. wordmark in Tokyo Green**

Run: `npm run dev` — nav should show bold "NOOBWORK." text in dark green, with a filled green Media Kit button.

**Step 3: Commit**

```bash
git add src/components/layout/Nav.tsx
git commit -m "feat: update nav with brand wordmark and colors"
```

---

### Task 5: Update Hero Section

**Files:**
- Modify: `src/components/sections/Hero.tsx`

**Step 1: Rewrite Hero with brand positioning**

```tsx
"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-primary text-sm font-medium tracking-wide uppercase mb-4">
            Tokyo Lifestyle &bull; Personal Development &bull; Gaming Heritage
          </p>
          <h1 className="font-[family-name:var(--font-newake)] text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 uppercase tracking-tight">
            NOOBWORK.
          </h1>
          <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
            Premium lifestyle creator brand founded by Joachim Haraldsen. Returning after a seven-year hiatus — combining gaming heritage with a new focus on growth, Tokyo lifestyle, and personal development.
          </p>
          <div className="flex gap-4 mb-8">
            <a href="#work" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors">
              View My Work
            </a>
            <a href="#connect" className="bg-surface text-foreground px-6 py-3 rounded-lg font-medium border border-sand hover:border-primary transition-colors">
              Get in Touch
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <span className="text-accent font-semibold">Forbes</span>
              <span>Featured</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">200K+</span> subscribers
            </div>
            <div>
              <span className="font-semibold text-foreground">12+</span> years creating
            </div>
          </div>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3"></div>
          <Image
            src="/joachim.jpg"
            alt="Joachim Haraldsen"
            width={500}
            height={600}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="relative rounded-3xl shadow-xl object-cover"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Verify hero displays new copy and brand colors**

Run: `npm run dev` — hero should show "NOOBWORK." in NEWAKE font, content pillars tagline, updated description.

**Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: update hero with brand positioning and content pillars"
```

---

### Task 6: Create Content Pillars Section

**Files:**
- Create: `src/components/sections/ContentPillars.tsx`

**Step 1: Create the new section**

```tsx
import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars = [
  {
    title: "Tokyo Lifestyle",
    desc: "Daily experiences, cultural insights, and the energy of the city — creating relatable connections for our audience.",
    icon: "🏯",
  },
  {
    title: "Personal Development",
    desc: "Guidance on self-improvement, motivation, and building discipline — empowering you to achieve your aspirations.",
    icon: "🎯",
  },
  {
    title: "Gaming Heritage",
    desc: "Combining gaming roots with lifestyle and personal growth — the foundation that started it all.",
    icon: "🎮",
  },
];

export default function ContentPillars() {
  return (
    <section className="py-20 px-6 bg-primary text-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <h2 className="font-[family-name:var(--font-newake)] text-3xl md:text-4xl uppercase tracking-tight mb-2">
            Content Pillars
          </h2>
          <p className="text-white/60 mb-12">What Noobwork is all about</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={pillar.title} delay={i * 0.1}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:-translate-y-1 transition-transform">
                <div className="text-3xl mb-4">{pillar.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{pillar.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{pillar.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit (will be wired into page.tsx in Task 10)**

```bash
git add src/components/sections/ContentPillars.tsx
git commit -m "feat: add Content Pillars section"
```

---

### Task 7: Update About Section

**Files:**
- Modify: `src/components/sections/About.tsx`
- Modify: `src/data/focus-items.ts`
- Modify: `src/data/interests.ts`

**Step 1: Update focus items and interests data**

`src/data/focus-items.ts`:
```ts
import { FocusItem } from "@/types";

export const focusItems: FocusItem[] = [
  { label: "Noobwork comeback — building a premium lifestyle creator brand" },
  { label: "Executive Advisor at Blast.tv" },
  { label: "Executive Advisor at Nåva Space" },
  { label: "Building two stealth startups" },
];
```

`src/data/interests.ts`:
```ts
export const interests = ["Tokyo Lifestyle", "Fitness", "Gaming", "Esports", "Japanese Culture", "Personal Growth", "Piano"];
```

**Step 2: Rewrite About section copy**

Update `src/components/sections/About.tsx` — change the bio paragraphs to match the brand book positioning:

- Replace "shaping the gaming and esports landscape" framing with the comeback narrative
- Emphasize: 7-year hiatus, premium lifestyle brand, gaming heritage + personal growth
- Keep the same component structure (SectionHeader, two-column, focus items, interests)

Update the bio paragraphs to:
```
Paragraph 1: "I'm Joachim Haraldsen — a Norwegian creator and entrepreneur based in Tokyo. In 2013, I created Noobwork and pioneered gaming content on YouTube in Norway, building a community of nearly 200,000 subscribers."

Paragraph 2: "I founded Heroic Group from scratch and built it into one of the largest esports organizations in the world, earning a Forbes feature along the way. After successfully selling the company, I moved to Tokyo to start the next chapter."

Paragraph 3: "Now, after a seven-year hiatus, Noobwork is back — reimagined as a premium lifestyle brand at the intersection of personal development, Tokyo lifestyle, and gaming heritage."
```

**Step 3: Update SectionHeader call**

Change from `title="About" highlight="Me"` to `title="About" highlight="Joachim"` and subtitle to `"The story behind the brand"`.

**Step 4: Verify about section renders with new copy**

Run: `npm run dev` — scroll to About section, verify updated text and interests.

**Step 5: Commit**

```bash
git add src/components/sections/About.tsx src/data/focus-items.ts src/data/interests.ts
git commit -m "feat: update About section with brand comeback narrative"
```

---

### Task 8: Update SectionHeader with NEWAKE Font

**Files:**
- Modify: `src/components/ui/SectionHeader.tsx`

**Step 1: Add NEWAKE font to headings**

```tsx
interface SectionHeaderProps {
  title: string;
  highlight: string;
  subtitle: string;
  center?: boolean;
}

export default function SectionHeader({ title, highlight, subtitle, center }: SectionHeaderProps) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="font-[family-name:var(--font-newake)] text-3xl md:text-4xl text-foreground mb-2 uppercase tracking-tight">
        {title} <span className="text-primary">{highlight}</span>
      </h2>
      <p className="text-foreground/60 mb-12">{subtitle}</p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ui/SectionHeader.tsx
git commit -m "feat: apply NEWAKE font to section headers"
```

---

### Task 9: Update Work, SocialProof, Newsletter, Connect Sections

**Files:**
- Modify: `src/components/sections/Work.tsx` — change bg from `bg-background` to use brand colors consistently
- Modify: `src/components/sections/SocialProof.tsx` — update border/bg colors to use `border-sand` instead of `border-border`
- Modify: `src/components/sections/Newsletter.tsx` — update highlight color references, change `text-primary` spans to `text-accent` for variety
- Modify: `src/components/sections/Connect.tsx` — update `border-border` to `border-sand`
- Modify: `src/components/ui/WorkCard.tsx` — update badge colors
- Modify: `src/components/ui/InterestTag.tsx` — update tag styling

**Step 1: Update SocialProof**

Change `border-y border-border` to `border-y border-sand`.

**Step 2: Update Newsletter**

Change the `<span className="text-primary">Loop</span>` to `<span className="text-accent">Loop</span>` for purple accent contrast.

**Step 3: Update Connect**

Change `border-border` to `border-sand` in the social link buttons.

**Step 4: Update WorkCard badge**

Keep `bg-primary/10 text-primary` — this now renders as green-tinted badges which matches the brand.

**Step 5: Update InterestTag if needed**

Read current InterestTag styling and ensure it uses brand-compatible colors.

**Step 6: Verify all sections look correct with brand colors**

Run: `npm run dev` — scroll through entire page, verify color consistency.

**Step 7: Commit**

```bash
git add src/components/sections/ src/components/ui/
git commit -m "feat: update remaining sections with brand colors"
```

---

### Task 10: Update Page Layout and Section Order

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add ContentPillars import and insert after About**

```tsx
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import About from "@/components/sections/About";
import ContentPillars from "@/components/sections/ContentPillars";
import Work from "@/components/sections/Work";
import Newsletter from "@/components/sections/Newsletter";
import Connect from "@/components/sections/Connect";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <About />
        <ContentPillars />
        <Work />
        <Newsletter />
        <Connect />
      </main>
      <Footer />
    </div>
  );
}
```

**Step 2: Verify full page flow**

Run: `npm run dev` — verify section order: Hero → SocialProof → About → Content Pillars → Work → Newsletter → Connect → Footer.

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add Content Pillars to page layout"
```

---

### Task 11: Update Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Step 1: Update footer with brand styling**

```tsx
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-foreground text-white/60 text-center text-sm">
      <div className="mb-4">
        <Logo variant="monogram" className="text-white/40" />
      </div>
      <p>&copy; {new Date().getFullYear()} Noobwork. All rights reserved.</p>
      <p className="mt-1">Built in Tokyo</p>
    </footer>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: update footer with brand logo and styling"
```

---

### Task 12: Update Metadata and SEO

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/JsonLd.tsx`

**Step 1: Update metadata in layout.tsx**

Change title from "Creator, Entrepreneur, Esports Pioneer" to align with brand:

```tsx
export const metadata: Metadata = {
  title: "Noobwork — Joachim Haraldsen | Tokyo Lifestyle, Personal Development, Gaming Heritage",
  description: "Premium lifestyle creator brand by Joachim Haraldsen. Tokyo lifestyle, personal development, and gaming heritage. Founded from Norway's largest gaming YouTube channel.",
  openGraph: {
    title: "Noobwork — Joachim Haraldsen",
    description: "Premium lifestyle creator brand. Tokyo lifestyle, personal development, and gaming heritage.",
    url: "https://www.noobwork.no",
    siteName: "Noobwork",
    images: [
      {
        url: "https://www.noobwork.no/joachim.jpg",
        width: 500,
        height: 600,
        alt: "Joachim Haraldsen - Noobwork",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noobwork — Joachim Haraldsen",
    description: "Premium lifestyle creator brand. Tokyo lifestyle, personal development, and gaming heritage.",
    images: ["https://www.noobwork.no/joachim.jpg"],
  },
};
```

**Step 2: Update JsonLd component if needed**

Update structured data description to match new brand positioning.

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/components/JsonLd.tsx
git commit -m "feat: update metadata and SEO for brand positioning"
```

---

### Task 13: Re-skin Media Kit Page

**Files:**
- Modify: `src/app/media-kit/page.tsx`

**Step 1: Read current media kit page**

Review the current page structure and update:
- Apply NEWAKE font to headings
- Update color references (`text-primary` → verify it maps to Tokyo Green)
- Remove or fix the broken PDF download link
- Update positioning copy to match brand

**Step 2: Apply brand fonts and colors throughout**

All `font-bold text-xl` headings → add `font-[family-name:var(--font-newake)] uppercase tracking-tight`
All `border-border` → `border-sand`
Fix the PDF download button: either remove it or change to a "Coming Soon" state.

**Step 3: Verify media kit page**

Run: `npm run dev` and navigate to `/media-kit` — verify brand consistency.

**Step 4: Commit**

```bash
git add src/app/media-kit/page.tsx
git commit -m "feat: re-skin media kit page with brand guidelines"
```

---

### Task 14: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update design system documentation**

Update the Design System section in CLAUDE.md to reflect new brand colors and fonts:

```markdown
## Design System

CSS custom properties defined in `globals.css`:
- `--background: #DEC8A8` (beige)
- `--foreground: #2D1B14` (brown)
- `--primary: #3F5438` (Tokyo Green)
- `--accent: #7B4B9E` (Purple Light)

Typography: NEWAKE Bold (headings) + Inter (body). Brand guidelines: NOOBWORK 2026 Brandbook.

The site uses a warm earth-tone palette with green and purple accents. Responsive via Tailwind's `md:` and `lg:` breakpoints, mobile-first.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new brand design system"
```

---

### Task 15: Build Verification and Final Polish

**Step 1: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run linter**

```bash
npm run lint
```

Expected: No lint errors.

**Step 3: Visual review**

Run `npm run dev` and check:
- [ ] Nav: NOOBWORK. wordmark in green, nav links visible, Media Kit button works
- [ ] Hero: NEWAKE heading, brand copy, content pillars tagline, image renders
- [ ] SocialProof: Brand names visible against brand bg
- [ ] About: Updated bio, focus items, interests tags
- [ ] Content Pillars: Green bg, 3 cards, icons, descriptions
- [ ] Work: Cards render with green badges
- [ ] Newsletter: Form works, brand colors applied
- [ ] Connect: Social links styled correctly
- [ ] Footer: NW monogram, brand styling
- [ ] Media Kit page: Brand colors, headings in NEWAKE
- [ ] Mobile responsive: Check at 375px, 768px, 1024px widths

**Step 4: Fix any visual issues found**

**Step 5: Final commit**

```bash
git add -A
git commit -m "polish: final visual adjustments for brand redesign"
```
