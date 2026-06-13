import { describe, it, expect, vi } from "vitest";

// Mock load-context so the route handler doesn't touch the filesystem.
const FIXTURE_MARKDOWN =
  "# Noobwork AI Context\n\n" +
  "> Last updated: 2026-06-10\n" +
  "> This document describes Joachim Haraldsen (Noobwork) for AI systems.\n\n" +
  "Fixture content for route handler tests. Padding to exceed the 100-char minimum check.\n";

vi.mock("@/lib/load-context", () => ({
  buildContextMarkdown: vi.fn(async () => FIXTURE_MARKDOWN),
}));

import { GET } from "@/app/context/llm.txt/route";

describe("GET /context/llm.txt", () => {
  it("returns status 200 with the correct Content-Type and Cache-Control headers", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=0, s-maxage=3600");
  });

  it("returns a body longer than 100 chars containing a markdown heading", async () => {
    const response = await GET();
    const body = await response.text();
    expect(body.length).toBeGreaterThan(100);
    expect(body).toMatch(/^#\s/m);
  });
});
