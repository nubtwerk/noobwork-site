import { describe, it, expect } from "vitest";
import { BEACONS_URL } from "@/data/external-links";

describe("external-links", () => {
  it("exports a valid Beacons URL", () => {
    expect(BEACONS_URL).toBe("https://beacons.ai/noobwork");
  });
});
