import type { Plant, PlantSpecies, WaterIntervalBreakdown, WaterStatus } from "@/types";

const MONTH_TO_SEASON: Record<number, "spring" | "summer" | "fall" | "winter"> = {
  0: "winter",
  1: "winter",
  2: "spring",
  3: "spring",
  4: "spring",
  5: "summer",
  6: "summer",
  7: "summer",
  8: "fall",
  9: "fall",
  10: "fall",
  11: "winter",
};

const POT_MATERIAL_FACTOR: Record<Plant["potMaterial"], number> = {
  terracotta: 0.85,
  plastic: 1.1,
  ceramic: 1.15,
};

const POT_SIZE_FACTOR: Record<Plant["potSize"], number> = {
  small: 0.85,
  medium: 1,
  large: 1.35,
};

const LIGHT_FACTOR: Record<Plant["lightLevel"], number> = {
  low: 1.15,
  medium: 1,
  bright: 0.85,
};

export function seasonForDate(date = new Date()): "spring" | "summer" | "fall" | "winter" {
  return MONTH_TO_SEASON[date.getMonth()];
}

export function baseIntervalForSpecies(
  species: PlantSpecies,
  season = seasonForDate(),
): number {
  switch (season) {
    case "spring":
      return species.springInterval;
    case "summer":
      return species.summerInterval;
    case "fall":
      return species.fallInterval;
    case "winter":
      return species.winterInterval;
  }
}

export function effectiveWaterIntervalDays(plant: Plant, species: PlantSpecies): number {
  if (plant.customIntervalDays) return plant.customIntervalDays;

  const base = baseIntervalForSpecies(species);
  const interval =
    base *
    POT_MATERIAL_FACTOR[plant.potMaterial] *
    POT_SIZE_FACTOR[plant.potSize] *
    LIGHT_FACTOR[plant.lightLevel];

  return Math.max(1, Math.round(interval));
}

export function nextWaterDate(plant: Plant, species: PlantSpecies): Date {
  const interval = effectiveWaterIntervalDays(plant, species);
  const last = new Date(plant.lastWateredAt);
  const next = new Date(last);
  next.setDate(next.getDate() + interval);
  return next;
}

export function daysUntilWater(plant: Plant, species: PlantSpecies, from = new Date()): number {
  const next = nextWaterDate(plant, species);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(next);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function waterStatus(plant: Plant, species: PlantSpecies, from = new Date()): WaterStatus {
  const days = daysUntilWater(plant, species, from);
  if (days < 0) return "overdue";
  if (days === 0) return "due_today";
  if (days <= 3) return "upcoming";
  return "on_track";
}

export function defaultPhotoPromptInterval(species: PlantSpecies): number {
  const avg =
    (species.springInterval +
      species.summerInterval +
      species.fallInterval +
      species.winterInterval) /
    4;
  if (avg <= 7) return 14;
  if (avg <= 14) return 21;
  return 30;
}

export function isPhotoDue(plant: Plant, from = new Date()): boolean {
  if (!plant.nextPhotoPromptAt) return false;
  const due = new Date(plant.nextPhotoPromptAt);
  due.setHours(0, 0, 0, 0);
  const now = new Date(from);
  now.setHours(0, 0, 0, 0);
  return due.getTime() <= now.getTime();
}

export function nextPhotoPromptDate(plant: Plant): Date {
  const base = plant.lastPhotoAt ? new Date(plant.lastPhotoAt) : new Date(plant.createdAt);
  const next = new Date(base);
  next.setDate(next.getDate() + plant.photoPromptIntervalDays);
  return next;
}

export function explainWaterInterval(
  plant: Plant,
  species: PlantSpecies,
  date = new Date(),
): WaterIntervalBreakdown {
  const season = seasonForDate(date);
  const baseDays = baseIntervalForSpecies(species, season);
  const factors = [
    { label: `${season} baseline`, multiplier: 1 },
    { label: `${plant.potMaterial} pot`, multiplier: POT_MATERIAL_FACTOR[plant.potMaterial] },
    { label: `${plant.potSize} size`, multiplier: POT_SIZE_FACTOR[plant.potSize] },
    { label: `${plant.lightLevel} light`, multiplier: LIGHT_FACTOR[plant.lightLevel] },
  ];
  const rawDays = baseDays * factors.slice(1).reduce((acc, f) => acc * f.multiplier, 1);
  const effectiveDays = plant.customIntervalDays ?? Math.max(1, Math.round(rawDays));

  const factorText = factors
    .slice(1)
    .map((f) => `${f.label} ×${f.multiplier.toFixed(2)}`)
    .join(" · ");

  return {
    baseDays,
    season,
    factors,
    rawDays: Math.round(rawDays * 10) / 10,
    effectiveDays,
    summary: `Water every ~${effectiveDays} days (${species.typeName} ${baseDays}d in ${season}${plant.customIntervalDays ? ", custom override" : ` · ${factorText}`}).`,
  };
}

export function formatRelativeDays(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `In ${days} days`;
}

export const WATER_STATUS_ORDER: Record<WaterStatus, number> = {
  overdue: 0,
  due_today: 1,
  upcoming: 2,
  on_track: 3,
};

export const WATER_STATUS_LABEL: Record<WaterStatus, string> = {
  overdue: "Overdue",
  due_today: "Due today",
  upcoming: "Soon",
  on_track: "On track",
};
