import { describe, expect, it } from "vitest";
import { buildFeedItems } from "@/lib/feed";
import type { PlantWithMeta } from "@/types";

const basePlant: PlantWithMeta = {
  id: "p1",
  nickname: "Monstera",
  speciesId: "test",
  roomId: "living-room",
  lastWateredAt: new Date().toISOString(),
  potMaterial: "plastic",
  potSize: "medium",
  lightLevel: "medium",
  photoPromptIntervalDays: 21,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  species: {
    id: "test",
    typeName: "Monstera",
    description: "",
    commonExamples: "",
    careTips: "",
    origin: "",
    springInterval: 7,
    summerInterval: 7,
    fallInterval: 10,
    winterInterval: 14,
    lightPreference: "brightIndirect",
    humidityPreference: "medium",
    plantToxicity: "nonToxic",
    category: "Houseplants",
  },
  room: { id: "living-room", name: "Living room" },
  waterStatus: "due_today",
  daysUntilWater: 0,
  nextWaterDate: "2026-07-04",
  photoDue: true,
  waterBreakdown: {
    baseDays: 7,
    season: "summer",
    factors: [],
    rawDays: 7,
    effectiveDays: 7,
    summary: "test",
  },
};

describe("feed", () => {
  it("builds feed items for due plants and photos", () => {
    const items = buildFeedItems([basePlant], "https://plants.noobwork.no");
    expect(items.some((i) => i.type === "water_due")).toBe(true);
    expect(items.some((i) => i.type === "photo_due")).toBe(true);
    expect(items[0].url).toContain("/plants/p1");
  });
});
