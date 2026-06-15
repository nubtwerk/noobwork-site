/**
 * Regression test for the cross-source duplicate guard in src/data/videos.ts.
 *
 * featuredVideo and recentVideos are selected independently, so the fallback
 * path can pair a generated featured with a recent list that still contains
 * that same id. The module must drop the collision so the same video never
 * renders twice. We mock the generated json to force the collision, which the
 * real committed data never has.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/data/videos.generated.json");
});

describe("recentVideos dedup against featuredVideo", () => {
  it("drops a recent entry whose id matches the featured id", async () => {
    vi.resetModules();
    vi.doMock("@/data/videos.generated.json", () => ({
      default: {
        generatedAt: "2026-06-13T00:00:00Z",
        featured: { id: "DUPEvideo01", title: "Featured", date: "Jun 2026" },
        recent: [
          { id: "DUPEvideo01", title: "Featured again", date: "Jun 2026" },
          { id: "uniqueVid02", title: "Unique", date: "Jun 2026" },
        ],
      },
    }));

    const { featuredVideo, recentVideos } = await import("@/data/videos");

    expect(featuredVideo.id).toBe("DUPEvideo01");
    const recentIds = recentVideos.map((v) => v.id);
    expect(recentIds).not.toContain("DUPEvideo01");
    expect(recentIds).toContain("uniqueVid02");

    // No id appears twice across featured + recent.
    const allIds = [featuredVideo.id, ...recentIds];
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});
