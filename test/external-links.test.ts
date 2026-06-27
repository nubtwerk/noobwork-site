import { describe, it, expect } from "vitest";
import { YOUTUBE_CHANNEL_URL } from "@/data/external-links";

describe("external-links", () => {
  it("exports a valid YouTube channel URL", () => {
    expect(YOUTUBE_CHANNEL_URL).toBe("https://www.youtube.com/@Noobworkify");
  });
});
