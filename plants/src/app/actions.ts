"use server";

import sharp from "sharp";
import { analyzePlantPhoto, stubAnalysis, VISION_MODEL } from "@/lib/analyze-photo";
import { requireAdmin } from "@/lib/auth";
import { photoDisplayUrl, storePlantPhoto } from "@/lib/photo-storage";
import {
  addPushSubscription,
  createPlant,
  deletePlant,
  exportSnapshot,
  fertilizePlant,
  getCollectionStats,
  getPlantTimeline,
  getPlantWithMeta,
  listRooms,
  recordPhoto,
  removePushSubscription,
  saveAnalysis,
  scheduleFollowUpPhoto,
  snoozePlant,
  updatePlant,
  waterDueTodayBulk,
  waterPlant,
} from "@/lib/plants-service";
import { searchSpecies } from "@/lib/species";
import { getSeoulWeatherNudge } from "@/lib/weather-seoul";
import type { Plant, TimelineEntry } from "@/types";
import { revalidatePath } from "next/cache";

function unauthorized() {
  return { error: "Sign in required to make changes." };
}

async function guardAdmin() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

export async function fetchEditorStatus() {
  return { canEdit: (await guardAdmin()) !== null };
}

export async function fetchTodayPlants() {
  const { listPlantsWithMeta } = await import("@/lib/plants-service");
  return listPlantsWithMeta();
}

export async function fetchPlant(id: string) {
  return getPlantWithMeta(id);
}

export async function fetchRooms() {
  return listRooms();
}

export async function fetchCollectionStats() {
  return getCollectionStats();
}

export async function fetchWeatherNudge() {
  return getSeoulWeatherNudge();
}

export async function fetchPlantTimeline(plantId: string): Promise<TimelineEntry[]> {
  return getPlantTimeline(plantId);
}

export async function searchSpeciesAction(query: string) {
  return searchSpecies(query);
}

export async function addPlantAction(formData: FormData) {
  if (!(await guardAdmin())) return unauthorized();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const speciesId = String(formData.get("speciesId") ?? "");
  const roomId = String(formData.get("roomId") ?? "");
  const potMaterial = String(formData.get("potMaterial") ?? "plastic") as Plant["potMaterial"];
  const potSize = String(formData.get("potSize") ?? "medium") as Plant["potSize"];
  const lightLevel = String(formData.get("lightLevel") ?? "medium") as Plant["lightLevel"];
  const notes = String(formData.get("notes") ?? "").trim() || undefined;

  if (!nickname || !speciesId || !roomId) {
    return { error: "Missing required fields" };
  }

  const plant = await createPlant({
    nickname,
    speciesId,
    roomId,
    potMaterial,
    potSize,
    lightLevel,
    notes,
  });

  revalidatePath("/");
  revalidatePath("/plants");
  return { plantId: plant.id };
}

export async function updatePlantAction(formData: FormData) {
  if (!(await guardAdmin())) return unauthorized();
  const plantId = String(formData.get("plantId") ?? "");
  if (!plantId) return { error: "Missing plant" };

  const customRaw = formData.get("customIntervalDays");
  const clearCustom = formData.get("clearCustomInterval") === "on";
  let customIntervalDays: number | null | undefined;
  if (clearCustom) {
    customIntervalDays = null;
  } else if (customRaw && String(customRaw).trim()) {
    customIntervalDays = Number(customRaw);
  }

  await updatePlant(plantId, {
    nickname: String(formData.get("nickname") ?? "").trim() || undefined,
    speciesId: String(formData.get("speciesId") ?? "") || undefined,
    roomId: String(formData.get("roomId") ?? "") || undefined,
    potMaterial: (formData.get("potMaterial") as Plant["potMaterial"]) || undefined,
    potSize: (formData.get("potSize") as Plant["potSize"]) || undefined,
    lightLevel: (formData.get("lightLevel") as Plant["lightLevel"]) || undefined,
    customIntervalDays,
    notes: String(formData.get("notes") ?? "").trim() || undefined,
  });

  revalidatePath("/");
  revalidatePath("/plants");
  revalidatePath(`/plants/${plantId}`);
  revalidatePath(`/plants/${plantId}/edit`);
  return { ok: true };
}

export async function waterPlantAction(plantId: string) {
  if (!(await guardAdmin())) return unauthorized();
  await waterPlant(plantId);
  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
}

export async function waterAllDueAction() {
  if (!(await guardAdmin())) return unauthorized();
  const count = await waterDueTodayBulk();
  revalidatePath("/");
  revalidatePath("/plants");
  return { count };
}

export async function fertilizePlantAction(plantId: string) {
  if (!(await guardAdmin())) return unauthorized();
  await fertilizePlant(plantId);
  revalidatePath(`/plants/${plantId}`);
}

export async function snoozePlantAction(plantId: string) {
  if (!(await guardAdmin())) return unauthorized();
  await snoozePlant(plantId, 1);
  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
}

export async function scheduleFollowUpAction(plantId: string, days: number) {
  if (!(await guardAdmin())) return unauthorized();
  await scheduleFollowUpPhoto(plantId, days);
  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
  return { ok: true };
}

export async function deletePlantAction(plantId: string) {
  if (!(await guardAdmin())) return unauthorized();
  await deletePlant(plantId);
  revalidatePath("/");
  revalidatePath("/plants");
}

export async function listCareLogs(plantId: string) {
  const { listCareLogs: list } = await import("@/lib/plants-service");
  return list(plantId);
}

export async function exportDataAction() {
  if (!(await guardAdmin())) return unauthorized();
  return exportSnapshot();
}

export async function uploadPhotoAction(formData: FormData) {
  if (!(await guardAdmin())) return unauthorized();
  const plantId = String(formData.get("plantId") ?? "");
  const promptType = String(formData.get("promptType") ?? "manual") as
    | "scheduled"
    | "manual"
    | "health_concern";
  const file = formData.get("photo");

  if (!plantId || !(file instanceof File)) {
    return { error: "Missing plant or photo" };
  }

  const plant = await getPlantWithMeta(plantId);
  if (!plant) return { error: "Plant not found" };

  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(mime)) {
    return { error: "Use JPEG, PNG, or WebP" };
  }

  const optimized = await sharp(bytes)
    .rotate()
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const storagePath = await storePlantPhoto(plantId, optimized);
  const { photo } = await recordPhoto(plantId, storagePath, promptType);

  let analysisResult = await analyzePlantPhoto(optimized, "image/webp", plant);
  if (!analysisResult) analysisResult = stubAnalysis();

  const analysis = await saveAnalysis({
    photoId: photo.id,
    plantId,
    model: process.env.OPENAI_API_KEY ? VISION_MODEL : "stub",
    overallHealth: analysisResult.overallHealth,
    confidence: analysisResult.confidence,
    findings: analysisResult.findings,
    wateringAssessment: analysisResult.wateringAssessment,
    lightAssessment: analysisResult.lightAssessment,
    pestsDetected: analysisResult.pestsDetected,
    followUpDays: analysisResult.followUpDays,
    summary: analysisResult.summary,
  });

  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);

  return { photoId: photo.id, analysis, photoUrl: photoDisplayUrl(storagePath) };
}

export async function subscribePushAction(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  if (!(await guardAdmin())) return unauthorized();
  await addPushSubscription({
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });
  return { ok: true };
}

export async function unsubscribePushAction(endpoint: string) {
  if (!(await guardAdmin())) return unauthorized();
  await removePushSubscription(endpoint);
  return { ok: true };
}
