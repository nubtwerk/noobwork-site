import { localStore } from "@/lib/db/local-store";
import { storeMode, supabaseStore } from "@/lib/db/supabase-store";
import { getSpeciesById } from "@/lib/species";
import {
  daysUntilWater,
  defaultPhotoPromptInterval,
  explainWaterInterval,
  isPhotoDue,
  nextPhotoPromptDate,
  nextWaterDate,
  waterStatus,
  WATER_STATUS_ORDER,
} from "@/lib/watering";
import type {
  CareLog,
  CollectionStats,
  PhotoAnalysis,
  Plant,
  PlantPhoto,
  PlantWithMeta,
  PushSubscriptionRecord,
  Room,
  StoreSnapshot,
  TimelineEntry,
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
      waterBreakdown: explainWaterInterval(plant, species),
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

export async function getCollectionStats(): Promise<CollectionStats> {
  const plants = await listPlantsWithMeta();
  const needWater = plants.filter(
    (p) => p.waterStatus === "overdue" || p.waterStatus === "due_today",
  ).length;
  const photoDue = plants.filter((p) => p.photoDue).length;

  const allLogs = await Promise.all(plants.map((p) => db().listCareLogs(p.id, 1)));
  const latestLog = allLogs
    .flat()
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

  let lastCheckInDaysAgo: number | null = null;
  if (latestLog) {
    const diff = Date.now() - new Date(latestLog.completedAt).getTime();
    lastCheckInDaysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  return {
    totalPlants: plants.length,
    needWater,
    photoDue,
    lastCheckInDaysAgo,
  };
}

export async function getPlantTimeline(plantId: string): Promise<TimelineEntry[]> {
  const [photos, analyses] = await Promise.all([
    db().listPhotos(plantId),
    db().listAnalyses(plantId),
  ]);
  const analysisByPhoto = new Map(analyses.map((a) => [a.photoId, a]));

  return photos
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt))
    .map((photo) => ({
      photo,
      analysis: analysisByPhoto.get(photo.id),
    }));
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

export async function updatePlant(
  plantId: string,
  input: {
    nickname?: string;
    speciesId?: string;
    roomId?: string;
    potMaterial?: Plant["potMaterial"];
    potSize?: Plant["potSize"];
    lightLevel?: Plant["lightLevel"];
    customIntervalDays?: number | null;
    notes?: string;
  },
): Promise<Plant | undefined> {
  if (input.speciesId && !getSpeciesById(input.speciesId)) {
    throw new Error("Unknown species");
  }

  const patch: Partial<Plant> = {};
  if (input.nickname !== undefined) patch.nickname = input.nickname;
  if (input.speciesId !== undefined) patch.speciesId = input.speciesId;
  if (input.roomId !== undefined) patch.roomId = input.roomId;
  if (input.potMaterial !== undefined) patch.potMaterial = input.potMaterial;
  if (input.potSize !== undefined) patch.potSize = input.potSize;
  if (input.lightLevel !== undefined) patch.lightLevel = input.lightLevel;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.customIntervalDays === null) patch.customIntervalDays = undefined;
  else if (input.customIntervalDays !== undefined) patch.customIntervalDays = input.customIntervalDays;

  return db().updatePlant(plantId, patch);
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

export async function waterDueTodayBulk(): Promise<number> {
  const plants = await listPlantsWithMeta();
  const due = plants.filter((p) => p.waterStatus === "overdue" || p.waterStatus === "due_today");
  let count = 0;
  for (const plant of due) {
    const result = await waterPlant(plant.id, "Bulk water all due");
    if (result) count++;
  }
  return count;
}

export async function fertilizePlant(plantId: string, notes?: string): Promise<CareLog | undefined> {
  const plant = await db().getPlant(plantId);
  if (!plant) return undefined;

  return db().addCareLog({
    plantId,
    taskType: "fertilize",
    completedAt: new Date().toISOString(),
    notes,
  });
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

export async function scheduleFollowUpPhoto(plantId: string, days: number): Promise<Plant | undefined> {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return db().updatePlant(plantId, { nextPhotoPromptAt: next.toISOString() });
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

export async function exportSnapshot(): Promise<StoreSnapshot> {
  return db().getSnapshot();
}

export async function addPushSubscription(
  input: Omit<PushSubscriptionRecord, "id" | "createdAt">,
): Promise<PushSubscriptionRecord> {
  return db().addPushSubscription(input);
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  return db().removePushSubscription(endpoint);
}

export async function listPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
  return db().listPushSubscriptions();
}

export { storeMode };
