import { describe, it, expect } from "vitest";
import { featuredVideo, recentVideos } from "@/data/videos";

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

describe("videos data", () => {
  it("featured video has a valid YouTube id, title, and date", () => {
    expect(featuredVideo.id).toMatch(YOUTUBE_ID);
    expect(featuredVideo.title.length).toBeGreaterThan(0);
    expect(featuredVideo.date.length).toBeGreaterThan(0);
  });

  it("every recent video has a valid YouTube id, title, and date", () => {
    expect(recentVideos.length).toBeGreaterThan(0);
    for (const video of recentVideos) {
      expect(video.id).toMatch(YOUTUBE_ID);
      expect(video.title.length).toBeGreaterThan(0);
      expect(video.date.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate video ids", () => {
    const ids = [featuredVideo.id, ...recentVideos.map((v) => v.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
