import { describe, it, expect } from "vitest";
import { featuredVideo, recentVideos } from "@/data/videos";
import generated from "@/data/videos.generated.json";

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

describe("generated json selection logic", () => {
  const isValidItem = (v: unknown): boolean => {
    if (!v || typeof v !== "object") return false;
    const item = v as Record<string, unknown>;
    return (
      typeof item.id === "string" &&
      YOUTUBE_ID.test(item.id) &&
      typeof item.title === "string" &&
      item.title.length > 0 &&
      typeof item.date === "string" &&
      item.date.length > 0
    );
  };

  it("when generated.recent has >= 2 valid items, recentVideos equals generated.recent", () => {
    const gen = generated as {
      recent: unknown[];
      featured: unknown;
    };
    const generatedIsValid =
      Array.isArray(gen.recent) &&
      gen.recent.length >= 2 &&
      gen.recent.every(isValidItem);

    if (generatedIsValid) {
      // Selection picks generated.recent, then drops any id that collides
      // with the featured video (cross-source dedup guard in videos.ts).
      expect(recentVideos).toEqual(
        (gen.recent as typeof recentVideos).filter((v) => v.id !== featuredVideo.id)
      );
    } else {
      // Generated file is not usable; just ensure recentVideos is non-empty.
      expect(recentVideos.length).toBeGreaterThan(0);
    }
  });

  it("when generated.featured is valid, featuredVideo equals generated.featured", () => {
    const gen = generated as { featured: unknown };
    if (isValidItem(gen.featured)) {
      expect(featuredVideo).toEqual(gen.featured);
    } else {
      // Fallback was used; still a valid item.
      expect(featuredVideo.id).toMatch(YOUTUBE_ID);
    }
  });
});
