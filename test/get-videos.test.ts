import { describe, it, expect } from "vitest";
import {
  VIDEO_REVALIDATE_SECONDS,
  formatAsOfLabel,
  resolveAsOfLabel,
} from "@/lib/get-videos";
import { featuredVideo, recentVideos, videosGeneratedAt } from "@/data/videos";

describe("getLatestVideos module", () => {
  it("revalidates hourly in production", () => {
    expect(VIDEO_REVALIDATE_SECONDS).toBe(3600);
  });

  it("build snapshot exports valid fallback data", () => {
    expect(featuredVideo.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
    expect(recentVideos.length).toBeGreaterThanOrEqual(2);
    expect(recentVideos.some((v) => v.id === featuredVideo.id)).toBe(false);
  });

  it("exposes a snapshot generatedAt when present", () => {
    expect(videosGeneratedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("formats As of labels in UTC day-month-year", () => {
    expect(formatAsOfLabel("2026-07-19T09:32:50+00:00")).toBe("Jul 19, 2026");
  });

  it("prefers the newest publishedIso over generatedAt", () => {
    const label = resolveAsOfLabel(
      {
        id: "AAAAAAAAAAA",
        title: "A",
        date: "Jul 2026",
        publishedIso: "2026-07-19T09:32:50+00:00",
      },
      [
        {
          id: "BBBBBBBBBBB",
          title: "B",
          date: "Jul 2026",
          publishedIso: "2026-07-12T08:33:36+00:00",
        },
      ],
      "2020-01-01T00:00:00.000Z"
    );
    expect(label).toBe("Jul 19, 2026");
  });

  it("falls back to generatedAt when publish dates are missing", () => {
    const label = resolveAsOfLabel(
      { id: "AAAAAAAAAAA", title: "A", date: "Jul 2026" },
      [{ id: "BBBBBBBBBBB", title: "B", date: "Jul 2026" }],
      "2026-09-10T10:37:44.344Z"
    );
    expect(label).toBe("Sep 10, 2026");
  });
});
