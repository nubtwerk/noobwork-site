import { describe, expect, it } from "vitest";
import { hasMultipleRooms } from "@/lib/rooms";

describe("rooms", () => {
  it("detects single vs multiple rooms", () => {
    expect(hasMultipleRooms([{ roomId: "living-room" }, { roomId: "living-room" }])).toBe(false);
    expect(hasMultipleRooms([{ roomId: "living-room" }, { roomId: "bedroom" }])).toBe(true);
  });
});
