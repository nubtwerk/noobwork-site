import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import {
  substituteTokens,
  buildContextMarkdown,
  buildContextIndex,
} from "@/lib/load-context";
import { GET as getIndex } from "@/app/context/llm-index.txt/route";
import { profileFacts, contextTokens, volatileFigures } from "@/data/profile-facts";
import { mediaKitStats } from "@/data/stats";
import { contextFiles } from "@/content/ai-context/manifest";

const SRC_DIR = join(process.cwd(), "src");
const CANONICAL = join(SRC_DIR, "data/profile-facts.ts");

/** Recursively collect every .ts/.tsx/.md file under src/. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (/\.(ts|tsx|md)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe("profile facts single-sourcing", () => {
  it("media kit subscriber/views/videos values derive from profileFacts", () => {
    const byLabel = Object.fromEntries(mediaKitStats.map((s) => [s.label, s.value]));
    expect(byLabel["YouTube Subscribers"]).toBe(profileFacts.subscribers.short);
    expect(byLabel["Total Video Views"]).toBe(profileFacts.totalViews.short);
    expect(byLabel["Videos Published"]).toBe(profileFacts.videosPublished.short);
  });

  it("contextTokens keys off the object key (no separate token field to drift)", () => {
    expect(contextTokens.subscribers).toBe(profileFacts.subscribers.long);
    expect(contextTokens.totalViews).toBe(profileFacts.totalViews.long);
    expect(contextTokens.videosPublished).toBe(profileFacts.videosPublished.long);
    expect(Object.keys(contextTokens).sort()).toEqual(Object.keys(profileFacts).sort());
  });
});

describe("substituteTokens", () => {
  it("replaces a known token with its long form", () => {
    expect(substituteTokens("views: {{totalViews}}")).toBe("views: 150,000,000+");
  });

  it("replaces adjacent tokens without dropping either (global-regex state)", () => {
    expect(substituteTokens("{{subscribers}}{{totalViews}}")).toBe("195,000+150,000,000+");
  });

  it("replaces tokens at the string boundaries", () => {
    expect(substituteTokens("{{videosPublished}}")).toBe("1,800+");
  });

  it("leaves unknown, malformed, empty, and spaced braces intact", () => {
    expect(substituteTokens("{{nope}}")).toBe("{{nope}}");
    expect(substituteTokens("{{notclosed")).toBe("{{notclosed");
    expect(substituteTokens("{{}}")).toBe("{{}}");
    expect(substituteTokens("{{ subscribers }}")).toBe("{{ subscribers }}");
  });
});

describe("no markdown or source file hardcodes a volatile figure", () => {
  const files = sourceFiles(SRC_DIR).filter((f) => f !== CANONICAL);
  for (const file of files) {
    const rel = relative(process.cwd(), file);
    it(`${rel} derives volatile figures instead of hardcoding them`, () => {
      const raw = readFileSync(file, "utf-8");
      for (const fig of volatileFigures) {
        expect(
          raw.includes(fig),
          `${rel} hardcodes "${fig}" — derive it from src/data/profile-facts.ts instead`,
        ).toBe(false);
      }
    });
  }
});

describe("buildContextMarkdown (full dump)", () => {
  it("injects the canonical figures and leaves no tokens behind", async () => {
    const md = await buildContextMarkdown();
    expect(md).toContain(profileFacts.totalViews.long);
    expect(md).not.toContain("{{");
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

  it("leaves no tokens behind", async () => {
    expect(await buildContextIndex()).not.toContain("{{");
  });

  it("is a map, not a copy: it omits the section body text", async () => {
    // A sentence that only appears inside a section body, never in the index.
    const bodyMarker = "founded and sold Heroic Group";
    const [idx, full] = await Promise.all([
      buildContextIndex(),
      buildContextMarkdown(),
    ]);
    expect(full).toContain(bodyMarker);
    expect(idx).not.toContain(bodyMarker);
  });
});

describe("GET /context/llm-index.txt", () => {
  it("returns the index as markdown with caching headers", async () => {
    const res = await getIndex();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/markdown");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
    const body = await res.text();
    expect(body).toContain("# Noobwork");
    expect(body).toContain("/llms-full.txt");
  });
});
