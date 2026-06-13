import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  substituteTokens,
  buildContextMarkdown,
  buildContextIndex,
} from "@/lib/load-context";
import { profileFacts, contextTokens, volatileFigures } from "@/data/profile-facts";
import { mediaKitStats } from "@/data/stats";
import { contextFiles } from "@/content/ai-context/manifest";

const CONTENT_DIR = join(process.cwd(), "src/content/ai-context");

describe("profile facts single-sourcing", () => {
  it("media kit subscriber/views/videos values derive from profileFacts", () => {
    const byLabel = Object.fromEntries(mediaKitStats.map((s) => [s.label, s.value]));
    expect(byLabel["YouTube Subscribers"]).toBe(profileFacts.subscribers.short);
    expect(byLabel["Total Video Views"]).toBe(profileFacts.totalViews.short);
    expect(byLabel["Videos Published"]).toBe(profileFacts.videosPublished.short);
  });

  it("contextTokens maps every fact token to its long form", () => {
    expect(contextTokens.subscribers).toBe(profileFacts.subscribers.long);
    expect(contextTokens.totalViews).toBe(profileFacts.totalViews.long);
    expect(contextTokens.videosPublished).toBe(profileFacts.videosPublished.long);
  });
});

describe("substituteTokens", () => {
  it("replaces known tokens with their long form", () => {
    expect(substituteTokens("views: {{totalViews}}")).toBe("views: 150,000,000+");
  });

  it("leaves unknown tokens intact so typos stay visible", () => {
    expect(substituteTokens("{{nope}}")).toBe("{{nope}}");
  });
});

describe("no markdown file hardcodes a volatile figure", () => {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    it(`${file} uses tokens, not raw volatile numbers`, () => {
      const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
      for (const fig of volatileFigures) {
        expect(
          raw.includes(fig),
          `${file} hardcodes ${fig} — use the {{token}} instead`,
        ).toBe(false);
      }
    });
  }
});

describe("buildContextMarkdown (full dump)", () => {
  it("injects the canonical figures and leaves no tokens behind", async () => {
    const md = await buildContextMarkdown();
    expect(md).toContain(profileFacts.totalViews.long);
    expect(md).not.toMatch(/\{\{\w+\}\}/);
    expect(md).toContain("llms-full.txt");
  });
});

describe("buildContextIndex (concise index)", () => {
  it("links the full doc, gives contact, and lists every section heading", async () => {
    const idx = await buildContextIndex();
    expect(idx).toContain("/llms-full.txt");
    expect(idx).toContain("joachim@noobwork.no");
    for (const entry of contextFiles) {
      expect(idx).toContain(entry.heading);
    }
  });

  it("stays shorter than the full dump", async () => {
    const [idx, full] = await Promise.all([
      buildContextIndex(),
      buildContextMarkdown(),
    ]);
    expect(idx.length).toBeLessThan(full.length);
  });
});
