import { describe, expect, it } from "vitest";
import type { Plant, PlantSpecies } from "@/types";
import {
  daysUntilWater,
  effectiveWaterIntervalDays,
  explainWaterInterval,
  waterStatus,
} from "@/lib/watering";

const species: PlantSpecies = {
  id: "test",
  typeName: "Test Plant",
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
  category: "Houseplants - Low Maintenance",
};

function plant(lastWateredDaysAgo: number): Plant {
  const d = new Date();
  d.setDate(d.getDate() - lastWateredDaysAgo);
  return {
    id: "1",
    nickname: "Test",
    speciesId: "test",
    roomId: "living-room",
    lastWateredAt: d.toISOString(),
    potMaterial: "plastic",
    potSize: "medium",
    lightLevel: "medium",
    photoPromptIntervalDays: 21,
    createdAt: d.toISOString(),
    updatedAt: d.toISOString(),
  };
}

describe("watering", () => {
  it("computes effective interval with pot modifiers", () => {
    const p = plant(0);
    expect(effectiveWaterIntervalDays(p, species)).toBeGreaterThan(0);
    const terracotta = { ...p, potMaterial: "terracotta" as const };
    expect(effectiveWaterIntervalDays(terracotta, species)).toBeLessThan(
      effectiveWaterIntervalDays(p, species),
    );
  });

  it("marks overdue when past interval", () => {
    const p = plant(30);
    expect(waterStatus(p, species)).toBe("overdue");
    expect(daysUntilWater(p, species)).toBeLessThan(0);
  });

  it("marks due today at interval boundary", () => {
    const interval = effectiveWaterIntervalDays(plant(0), species);
    const p = plant(interval);
    expect(waterStatus(p, species)).toBe("due_today");
  });

  it("explains water interval with factors", () => {
    const breakdown = explainWaterInterval(plant(0), species);
    expect(breakdown.effectiveDays).toBeGreaterThan(0);
    expect(breakdown.summary).toContain("days");
    expect(breakdown.factors.length).toBeGreaterThan(1);
  });
});
