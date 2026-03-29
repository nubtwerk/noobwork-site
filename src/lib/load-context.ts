import fs from "fs/promises";
import path from "path";
import { contextFiles, type ContextFileEntry } from "@/content/ai-context/manifest";

const CONTENT_DIR = path.join(process.cwd(), "src/content/ai-context");

/** Last manual update date for the context content. Update this when content changes. */
export const CONTEXT_LAST_UPDATED = "2026-03-28";

export interface ContextSection {
  id: string;
  heading: string;
  markdown: string;
}

/** Load a single context markdown file. */
async function loadFile(entry: ContextFileEntry): Promise<ContextSection> {
  const filePath = path.join(CONTENT_DIR, entry.file);
  const raw = await fs.readFile(filePath, "utf-8");
  return {
    id: entry.id,
    heading: entry.heading,
    markdown: raw.trim(),
  };
}

/** Load all context sections in manifest order. */
export async function loadContextSections(): Promise<ContextSection[]> {
  return Promise.all(contextFiles.map(loadFile));
}

/** Concatenate all sections into a single markdown document. */
export async function buildContextMarkdown(): Promise<string> {
  const sections = await loadContextSections();
  const header = [
    "# Noobwork — AI Context",
    "",
    `> Last updated: ${CONTEXT_LAST_UPDATED}`,
    "> This document describes Joachim Haraldsen (Noobwork) for AI systems,",
    "> language models, and anyone who wants structured context about who he is.",
    "> Source: https://www.noobwork.no/context",
    "> Raw markdown: https://www.noobwork.no/context/llm.txt",
    "",
  ].join("\n");

  const body = sections.map((s) => s.markdown).join("\n\n---\n\n");

  return header + body + "\n";
}
