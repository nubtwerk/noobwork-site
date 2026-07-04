"use server";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { analyzePlantPhoto, stubAnalysis, VISION_MODEL } from "@/lib/analyze-photo";
import { requireAdmin } from "@/lib/auth";
import { getUploadsDir } from "@/lib/db/local-store";
import {
  createPlant,
  deletePlant,
  getPlantWithMeta,
  listRooms,
  recordPhoto,
  saveAnalysis,
  snoozePlant,
  waterPlant,
} from "@/lib/plants-service";
import { searchSpecies } from "@/lib/species";
import type { Plant } from "@/types";
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

export async function waterPlantAction(plantId: string) {
  if (!(await guardAdmin())) return unauthorized();
  await waterPlant(plantId);
  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
}

export async function snoozePlantAction(plantId: string) {
  if (!(await guardAdmin())) return unauthorized();
  await snoozePlant(plantId, 1);
  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
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

  const uploadsDir = getUploadsDir();
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `${plantId}-${Date.now()}.webp`;
  const filepath = path.join(uploadsDir, filename);
  const optimized = await sharp(bytes)
    .rotate()
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(filepath, optimized);
  const storagePath = `/uploads/${filename}`;

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

  return { photoId: photo.id, analysis };
}
