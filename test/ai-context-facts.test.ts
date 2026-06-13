import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { substituteTokens } from "@/lib/load-context";
import { profileFacts } from "@/data/profile-facts";

const keyFacts = readFileSync(
  join(process.cwd(), "src/content/ai-context/07-key-facts.md"),
  "utf-8",
);

describe("ai-context/07-key-facts.md", () => {
  it("uses tokens for the volatile figures, not hardcoded numbers", () => {
    expect(keyFacts).toContain("{{subscribers}}");
    expect(keyFacts).toContain("{{totalViews}}");
    expect(keyFacts).toContain("{{videosPublished}}");
  });

  it("does not contain the stale 152,000,000+ figure", () => {
    expect(keyFacts).not.toContain("152,000,000");
  });

  it("renders the canonical figures after token substitution", () => {
    const rendered = substituteTokens(keyFacts);
    expect(rendered).toContain(profileFacts.totalViews.long);
    expect(rendered).toContain(profileFacts.subscribers.long);
    expect(rendered).toContain(profileFacts.videosPublished.long);
  });
});
