import { localStore } from "@/lib/db/local-store";
import { storeMode, supabaseStore } from "@/lib/db/supabase-store";
import { getSpeciesById } from "@/lib/species";
import {
  daysUntilWater,
  defaultPhotoPromptInterval,
  isPhotoDue,
  nextPhotoPromptDate,
  nextWaterDate,
  waterStatus,
  WATER_STATUS_ORDER,
} from "@/lib/watering";
import type {
  CareLog,
  PhotoAnalysis,
  Plant,
  PlantPhoto,
  PlantWithMeta,
  Room,
} from "@/types";

function db() {
  return storeMode() === "supabase" ? supabaseStore : localStore;
}

export async function listRooms(): Promise<Room[]> {
  return db().listRooms();
}

export async function listPlantsWithMeta(): Promise<PlantWithMeta[]> {
  const [plants, rooms] = await Promise.all([db().listPlants(), db().listRooms()]);
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const enriched: PlantWithMeta[] = [];

  for (const plant of plants) {
    const species = getSpeciesById(plant.speciesId);
    if (!species) continue;
    const room = roomMap.get(plant.roomId) ?? { id: plant.roomId, name: "Unknown" };
    const latestAnalysis = await db().getLatestAnalysis(plant.id);
    const next = nextWaterDate(plant, species);
    enriched.push({
      ...plant,
      species,
      room,
      waterStatus: waterStatus(plant, species),
      daysUntilWater: daysUntilWater(plant, species),
      nextWaterDate: next.toISOString().slice(0, 10),
      photoDue: isPhotoDue(plant),
      latestAnalysis,
    });
  }

  return enriched.sort((a, b) => {
      const statusDiff = WATER_STATUS_ORDER[a.waterStatus] - WATER_STATUS_ORDER[b.waterStatus];
      if (statusDiff !== 0) return statusDiff;
      return a.daysUntilWater - b.daysUntilWater;
    });
}

export async function getPlantWithMeta(id: string): Promise<PlantWithMeta | null> {
  const plants = await listPlantsWithMeta();
  return plants.find((p) => p.id === id) ?? null;
}

export async function createPlant(input: {
  nickname: string;
  speciesId: string;
  roomId: string;
  potMaterial: Plant["potMaterial"];
  potSize: Plant["potSize"];
  lightLevel: Plant["lightLevel"];
  notes?: string;
}): Promise<Plant> {
  const species = getSpeciesById(input.speciesId);
  if (!species) throw new Error("Unknown species");

  const now = new Date().toISOString();
  const photoInterval = defaultPhotoPromptInterval(species);
  const nextPhoto = new Date();
  nextPhoto.setDate(nextPhoto.getDate() + photoInterval);

  return db().createPlant({
    nickname: input.nickname,
    speciesId: input.speciesId,
    roomId: input.roomId,
    lastWateredAt: now,
    potMaterial: input.potMaterial,
    potSize: input.potSize,
    lightLevel: input.lightLevel,
    photoPromptIntervalDays: photoInterval,
    nextPhotoPromptAt: nextPhoto.toISOString(),
    notes: input.notes,
  });
}

export async function waterPlant(plantId: string, notes?: string): Promise<Plant | undefined> {
  const now = new Date().toISOString();
  const plant = await db().updatePlant(plantId, { lastWateredAt: now });
  if (plant) {
    await db().addCareLog({
      plantId,
      taskType: "water",
      completedAt: now,
      notes,
    });
  }
  return plant;
}

export async function snoozePlant(plantId: string, days = 1): Promise<Plant | undefined> {
  const plant = await db().getPlant(plantId);
  if (!plant) return undefined;
  const species = getSpeciesById(plant.speciesId);
  if (!species) return undefined;

  const shifted = new Date(plant.lastWateredAt);
  shifted.setDate(shifted.getDate() + days);
  const updated = await db().updatePlant(plantId, { lastWateredAt: shifted.toISOString() });
  if (updated) {
    await db().addCareLog({
      plantId,
      taskType: "snooze",
      completedAt: new Date().toISOString(),
      notes: `Snoozed ${days} day(s)`,
    });
  }
  return updated;
}

export async function deletePlant(plantId: string): Promise<boolean> {
  return db().deletePlant(plantId);
}

export async function listCareLogs(plantId: string): Promise<CareLog[]> {
  return db().listCareLogs(plantId);
}

export async function listPhotos(plantId: string): Promise<PlantPhoto[]> {
  return db().listPhotos(plantId);
}

export async function recordPhoto(
  plantId: string,
  storagePath: string,
  promptType: PlantPhoto["promptType"],
): Promise<{ photo: PlantPhoto; analysis: PhotoAnalysis | null }> {
  const now = new Date().toISOString();
  const photo = await db().addPhoto({
    plantId,
    storagePath,
    takenAt: now,
    promptType,
  });

  const plant = await db().getPlant(plantId);
  if (plant) {
    const next = nextPhotoPromptDate({ ...plant, lastPhotoAt: now });
    await db().updatePlant(plantId, {
      lastPhotoAt: now,
      nextPhotoPromptAt: next.toISOString(),
    });
    await db().addCareLog({
      plantId,
      taskType: "photo",
      completedAt: now,
      notes: promptType,
    });
  }

  return { photo, analysis: null };
}

export async function saveAnalysis(
  analysis: Omit<PhotoAnalysis, "id" | "createdAt">,
): Promise<PhotoAnalysis> {
  return db().addAnalysis(analysis);
}

export { storeMode };
