import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const keyFacts = readFileSync(
  join(process.cwd(), "src/content/ai-context/07-key-facts.md"),
  "utf-8"
);

describe("ai-context/07-key-facts.md", () => {
  it("contains the correct total views figure (150,000,000+)", () => {
    expect(keyFacts).toContain("150,000,000+");
  });

  it("does not contain the stale 152,000,000+ figure", () => {
    expect(keyFacts).not.toContain("152,000,000");
  });

  it("contains the correct subscriber figure (195,000+ or 195K)", () => {
    expect(keyFacts).toMatch(/195,000\+|195K/);
  });
});
