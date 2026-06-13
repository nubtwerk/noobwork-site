import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs/promises — load-context.ts imports fs from "fs/promises"
vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
  },
}));

// Import after mocks are established
import fs from "fs/promises";
import { loadContextSections, buildContextMarkdown } from "@/lib/load-context";

beforeEach(() => {
  vi.mocked(fs.readFile).mockReset();
});

describe("loadContextSections / loadFile error path", () => {
  it("returns 'Content unavailable' and calls console.error when readFile rejects", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT: file not found"));

    const sections = await loadContextSections();

    // Every section should contain the fallback text
    expect(sections.length).toBeGreaterThan(0);
    for (const section of sections) {
      expect(section.markdown).toMatch(/Content unavailable/);
      expect(section.markdown).toContain(section.heading);
    }
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it("returns the file content and 'Last updated' header when readFile resolves", async () => {
    vi.mocked(fs.readFile).mockResolvedValue("# Hello World\n\nSome content here." as never);

    const markdown = await buildContextMarkdown();

    expect(markdown).toContain("# Hello World");
    expect(markdown).toContain("Last updated:");
  });
});
