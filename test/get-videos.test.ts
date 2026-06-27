import { describe, it, expect } from "vitest";
import { VIDEO_REVALIDATE_SECONDS } from "@/lib/get-videos";
import { featuredVideo, recentVideos } from "@/data/videos";

describe("getLatestVideos module", () => {
  it("revalidates hourly in production", () => {
    expect(VIDEO_REVALIDATE_SECONDS).toBe(3600);
  });

  it("build snapshot exports valid fallback data", () => {
    expect(featuredVideo.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
    expect(recentVideos.length).toBeGreaterThanOrEqual(2);
    expect(recentVideos.some((v) => v.id === featuredVideo.id)).toBe(false);
  });
});
