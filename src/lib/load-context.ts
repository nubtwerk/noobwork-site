import fs from "fs/promises";
import path from "path";
import { contextFiles, type ContextFileEntry } from "@/content/ai-context/manifest";
import { contextTokens } from "@/data/profile-facts";

const CONTENT_DIR = path.join(process.cwd(), "src/content/ai-context");
const SITE = "https://www.noobwork.no";

/** Evaluated once per production build; content only changes via deploys. */
export const CONTEXT_LAST_UPDATED = new Date().toISOString().slice(0, 10);

export interface ContextSection {
  id: string;
  heading: string;
  markdown: string;
}

/**
 * Replace `{{token}}` placeholders with their canonical values from
 * src/data/profile-facts.ts. Unknown tokens are left intact so a typo stays
 * visible (and is caught by test/context-tokens.test.ts) rather than vanishing.
 */
export function substituteTokens(markdown: string): string {
  return markdown.replace(/\{\{(\w+)\}\}/g, (whole, token: string) =>
    Object.prototype.hasOwnProperty.call(contextTokens, token)
      ? contextTokens[token]
      : whole,
  );
}

/** Load a single context markdown file, with volatile facts injected. */
async function loadFile(entry: ContextFileEntry): Promise<ContextSection> {
  const filePath = path.join(CONTENT_DIR, entry.file);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return {
      id: entry.id,
      heading: entry.heading,
      markdown: substituteTokens(raw.trim()),
    };
  } catch (error) {
    console.error(`Failed to load context file: ${entry.file}`, error);
    return {
      id: entry.id,
      heading: entry.heading,
      markdown: `*Content unavailable for ${entry.heading}.*`,
    };
  }
}

/** Load all context sections in manifest order. */
export async function loadContextSections(): Promise<ContextSection[]> {
  return Promise.all(contextFiles.map(loadFile));
}

/** Concatenate all sections into a single markdown document (the full dump). */
export async function buildContextMarkdown(): Promise<string> {
  const sections = await loadContextSections();
  const header = [
    "# Noobwork AI Context",
    "",
    `> Last updated: ${CONTEXT_LAST_UPDATED}`,
    "> This document describes Joachim Haraldsen (Noobwork) for AI systems,",
    "> language models, and anyone who wants structured context about who he is.",
    `> Source: ${SITE}/context`,
    `> Index: ${SITE}/llms.txt`,
    `> Full markdown: ${SITE}/llms-full.txt`,
    "",
  ].join("\n");

  const body = sections.map((s) => s.markdown).join("\n\n---\n\n");

  return header + body + "\n";
}

/**
 * Build the concise llms.txt index: a short summary plus links to the full
 * document and the section list. Per the llms.txt convention, the primary
 * `/llms.txt` is a lightweight map; `/llms-full.txt` carries everything.
 */
export async function buildContextIndex(): Promise<string> {
  const sections = await loadContextSections();
  return [
    "# Noobwork — Joachim Haraldsen",
    "",
    "> Norwegian founder, operator, and content creator based in Seoul. Built and",
    "> exited Heroic Group; now rebuilding Noobwork around fitness, health, and the",
    "> discipline of building. This is the self-authored, AI-readable context layer.",
    "",
    `> Last updated: ${CONTEXT_LAST_UPDATED}`,
    "",
    "## Read this",
    "",
    `- [Full AI context, all sections](${SITE}/llms-full.txt): the complete self-authored profile in one document`,
    `- [Human-readable version](${SITE}/context): the same content, rendered`,
    `- Contact: joachim@noobwork.no`,
    "",
    "## What the full context covers",
    "",
    ...sections.map((s) => `- ${s.heading}`),
    "",
  ].join("\n");
}
