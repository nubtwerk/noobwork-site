# AI Context Subpage Implementation Plan

> For Hermes: use Claude Code for implementation after approval. Do not overwrite Joachim's in-progress visual/style edits in existing files.

Goal: Add a new noobwork.no subpage that gives humans and AI models an immediately usable, up-to-date context package on Joachim Haraldsen — who he is, what he is focused on, his tone of voice, interests, and how to work with him.

Architecture: Add a branded human-readable page at `/context` and a raw markdown companion endpoint at `/context/llm.txt`, both powered by a single structured content source in `src/data/context.ts`. Keep the content code-native, markdown-friendly, easy to update, and aligned with the repo’s existing pattern of hardcoded data files feeding page components.

Tech Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, existing layout/components/data-file architecture.

---

## Product decisions

- Primary public URL: `/context`
- Raw AI-friendly URL: `/context/llm.txt`
- Optional discovery alias later: `/.well-known/llm.txt` → `/context/llm.txt`
- Single source of truth for all context content
- Content stays in code, not CMS, not MDX
- Page should work for both:
  - humans browsing normally
  - AI tools fetching either HTML or raw markdown

## Desired content blocks

1. Identity
2. Short bio / why Joachim matters
3. Current focus
4. Tone of voice
5. Interests and expertise
6. How to work with Joachim
7. Key facts / stats / credibility markers
8. Optional “what not to assume” section

## Files to create

- `src/data/context.ts`
- `src/app/context/page.tsx`
- `src/app/context/llm.txt/route.ts`
- `docs/plans/2026-03-28-ai-context-subpage.md`

## Files to modify

- `src/types/index.ts`
- `src/components/layout/Nav.tsx`
- `src/components/JsonLd.tsx`
- `next.config.ts` (optional rewrite only)

## Files to inspect before implementation

- `src/app/layout.tsx`
- `src/app/media-kit/page.tsx`
- `src/components/layout/Nav.tsx`
- `src/components/JsonLd.tsx`
- `src/data/focus-items.ts`
- `src/data/interests.ts`
- `src/data/work-items.ts`

---

### Task 1: Add typed content model for the context hub

Objective: Create a clean, reusable TypeScript shape for the new context content.

Files:
- Modify: `src/types/index.ts`

Step 1: Add a new interface for the page content.

Recommended shape:

```ts
export interface ContextSection {
  id: string;
  heading: string;
  body: string;
}
```

Step 2: Keep it intentionally small.
- Do not over-design with nested schemas unless implementation proves it necessary.
- Markdown in `body` is enough.

Step 3: Verify TypeScript remains clean.

Run:
```bash
npm run lint
```

Expected: no new type or lint issues caused by the interface addition.

---

### Task 2: Create the single source of truth for Joachim’s AI context

Objective: Add a markdown-friendly data file that powers both the human page and raw markdown endpoint.

Files:
- Create: `src/data/context.ts`
- Reference only: `src/data/focus-items.ts`, `src/data/interests.ts`, `src/data/work-items.ts`

Step 1: Export a small metadata object.

Recommended shape:

```ts
export const contextMeta = {
  title: "AI Context - Noobwork | Joachim Haraldsen",
  description:
    "Structured context for AI models and collaborators: who Joachim Haraldsen is, what he is focused on, his tone of voice, interests, and how to work with him.",
};
```

Step 2: Export the context sections.

Recommended shape:

```ts
import type { ContextSection } from "@/types";

export const contextSections: ContextSection[] = [
  {
    id: "identity",
    heading: "Who I Am",
    body: `Joachim Håkon Ljåstad Haraldsen, mostly known as Joachim and online as Noobwork, is a Norwegian entrepreneur, executive, creator, and builder currently based in Tokyo. He founded and exited Heroic Group, built one of Norway's largest gaming YouTube channels, and now operates across creator brand, startups, advisory work, and AI products.`,
  },
  {
    id: "focus",
    heading: "Current Focus",
    body: `- Rebuilding Noobwork as a premium lifestyle creator brand\n- Building AI products including dailybase.ai\n- Exploring high-leverage executive and advisory opportunities in gaming, entertainment, and adjacent sectors\n- Operating at the intersection of content, product, growth, and brand`,
  },
  {
    id: "tone",
    heading: "Tone of Voice",
    body: `- Premium, warm, grounded\n- Clear, sharp, and direct\n- High agency, low fluff\n- No neon gamer clichés\n- Sophisticated, but still human and internet-native`,
  },
  {
    id: "interests",
    heading: "Interests & Expertise",
    body: `Gaming, esports, AI, startups, content systems, personal growth, fitness, Japan, premium lifestyle branding, internet culture, audience building, and high-performance execution.`,
  },
  {
    id: "working-style",
    heading: "How to Work With Me",
    body: `- Be concise\n- Lead with the answer\n- Show judgment, not just options\n- Prioritize leverage and speed\n- Avoid bloated explanations unless asked\n- Respect context and brand tone`,
  },
  {
    id: "key-facts",
    heading: "Key Facts",
    body: `- Founder and former CEO of Heroic Group\n- 190K+ YouTube subscribers as Noobwork\n- 151M+ video views\n- 20+ years across gaming, media, entrepreneurship, and esports\n- Based in Tokyo, originally from Norway`,
  },
];
```

Step 3: Add one helper that serializes all sections into a full markdown string.

Recommended shape:

```ts
export function buildContextMarkdown() {
  const sections = contextSections
    .map((section) => `## ${section.heading}\n\n${section.body}`)
    .join("\n\n---\n\n");

  return `# Joachim Haraldsen - AI Context\n\n${sections}\n`;
}
```

Step 4: Keep content in plain English and easy to update.
- No JSX in the data file.
- No HTML in the markdown body.

Verification:
- Read through `src/data/context.ts` and confirm one person can update it in under 5 minutes.

---

### Task 3: Build the human-readable `/context` page

Objective: Add a branded, scannable page that humans can browse and AI tools can still extract from cleanly.

Files:
- Create: `src/app/context/page.tsx`
- Reuse: `src/components/layout/Nav.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/AnimatedSection.tsx`

Step 1: Add page metadata.

Recommended shape:

```ts
import type { Metadata } from "next";
import { contextMeta } from "@/data/context";

export const metadata: Metadata = {
  title: contextMeta.title,
  description: contextMeta.description,
  alternates: {
    canonical: "/context",
  },
};
```

Step 2: Render the page structure.

Recommended sections:
- top intro / title
- short explanation of what the page is
- “Raw markdown” link to `/context/llm.txt`
- “Copy all as markdown” button
- list of section cards generated from `contextSections`

Step 3: Keep styling simple and consistent with the existing site.
- Use the same layout shell as `media-kit/page.tsx`
- Avoid over-animating this page
- Optimize for readability and extraction

Step 4: Add copy UX.
- One top-level “Copy all as markdown” button
- Optional per-section copy buttons if fast to implement cleanly
- If copy buttons add noise, keep only the top-level copy action

Step 5: Include a short line explaining how to use it.

Suggested copy:

```txt
This page is designed so both humans and AI models can get up to speed on who Joachim Haraldsen is, how he communicates, what he is focused on, and how best to work with him.
```

Verification:

Run:
```bash
npm run dev
```

Check:
- `/context` loads
- page matches brand styling
- raw markdown link is visible
- copy button works
- page content is readable without needing to inspect code

---

### Task 4: Add the raw markdown endpoint at `/context/llm.txt`

Objective: Expose a plain markdown response for AI tools that do better with raw text than HTML.

Files:
- Create: `src/app/context/llm.txt/route.ts`
- Use: `src/data/context.ts`

Step 1: Implement a GET route returning markdown.

Recommended code:

```ts
import { buildContextMarkdown } from "@/data/context";

export async function GET() {
  return new Response(buildContextMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
```

Step 2: Keep the output completely plain.
- No HTML wrapper
- No JSON
- No decoration beyond markdown headings and separators

Verification:

Run:
```bash
curl -i http://localhost:3000/context/llm.txt
```

Expected:
- `200 OK`
- `Content-Type: text/markdown; charset=utf-8`
- body starts with `# Joachim Haraldsen - AI Context`

---

### Task 5: Add discoverability in site navigation

Objective: Make the new context page easy to find from the site.

Files:
- Modify: `src/components/layout/Nav.tsx`

Step 1: Add a `Context` link to the desktop nav.
Step 2: Add it to the mobile nav state currently used by the page.
Step 3: Preserve current Media Kit prominence unless Joachim wants Context to replace it.

Recommendation:
- Add `Context` as a text link beside About / Work / Connect
- Keep `Media Kit` as the pill CTA

Verification:
- Home page nav shows `Context`
- Link works from any page
- Visual hierarchy remains clean

---

### Task 6: Improve machine readability and SEO

Objective: Make the new page easier for crawlers, search engines, and AI systems to understand.

Files:
- Modify: `src/components/JsonLd.tsx`
- Optional modify: `next.config.ts`

Step 1: Extend JSON-LD.

Recommended additions:

```ts
mainEntityOfPage: "https://www.noobwork.no/context",
knowsAbout: [
  "Gaming",
  "Esports",
  "Content Creation",
  "Entrepreneurship",
  "Technology",
  "AI",
  "Japan",
  "Creator Brand Building",
],
```

Step 2: Optionally add a rewrite for a well-known discovery path.

Recommended:

```ts
async rewrites() {
  return [
    {
      source: "/.well-known/llm.txt",
      destination: "/context/llm.txt",
    },
  ];
}
```

Step 3: Only add the rewrite if it does not conflict with current deployment assumptions.

Verification:
- page metadata is present
- JSON-LD still renders
- optional rewrite resolves locally if enabled

---

### Task 7: Final validation and content polish

Objective: Make sure the feature works and the content actually feels useful.

Files:
- Review all files touched above

Step 1: Run lint.

```bash
npm run lint
```

Expected: pass

Step 2: Run production build.

```bash
npm run build
```

Expected: pass

Step 3: Manual QA checklist.
- `/context` works
- `/context/llm.txt` works
- context reads like Joachim, not generic corporate copy
- no obvious contradictions with homepage/media-kit
- no gamer-cliche tone drift
- content is useful for both LLM prompting and human collaborators

Step 4: Sanity-check against the actual use case.
- If someone pastes `https://www.noobwork.no/context` into an AI tool, does it get enough signal quickly?
- If not, tighten the opening section before shipping.

---

## Recommended implementation order

1. Add `ContextSection` type
2. Create `src/data/context.ts`
3. Create `/context/llm.txt`
4. Create `/context`
5. Add nav link
6. Improve JSON-LD
7. Optional well-known rewrite
8. Lint, build, and QA

## Recommended execution tool

Use Claude Code for implementation.

Why:
- better at page/content shaping and structured writing
- this task is half product/content design, half frontend implementation
- repo already includes `CLAUDE.md`

## Guardrails

- Do not overwrite Joachim’s existing unstaged style edits in:
  - `src/app/globals.css`
  - `src/components/layout/Nav.tsx`
  - `src/components/sections/*`
  - `src/components/ui/*`
- Keep all new logic additive and minimal
- Prefer clarity over clever abstractions
- Keep the content source dead simple to update later

## Ship criteria

This is ready when:
- there is a stable public `/context` page
- there is a raw `/context/llm.txt` endpoint
- both are generated from one content source
- the page feels on-brand for Noobwork
- the content gives AI systems immediate, useful context
