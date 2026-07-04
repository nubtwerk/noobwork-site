import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CareLog,
  PhotoAnalysis,
  Plant,
  PlantPhoto,
  PushSubscriptionRecord,
  Room,
  StoreSnapshot,
} from "@/types";

function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function storeMode(): "local" | "supabase" {
  if (process.env.PLANTS_STORE === "supabase" && supabaseAdmin()) return "supabase";
  return "local";
}

/** Supabase row mappers — tables match supabase/schema.sql */
export const supabaseStore = {
  client: supabaseAdmin,

  async listRooms(): Promise<Room[]> {
    const sb = supabaseAdmin();
    if (!sb) return [];
    const { data, error } = await sb.from("rooms").select("*").order("name");
    if (error) throw error;
    return data as Room[];
  },

  async listPlants(): Promise<Plant[]> {
    const sb = supabaseAdmin();
    if (!sb) return [];
    const { data, error } = await sb.from("plants").select("*").order("nickname");
    if (error) throw error;
    return (data ?? []).map(mapPlantRow);
  },

  async getPlant(id: string): Promise<Plant | undefined> {
    const sb = supabaseAdmin();
    if (!sb) return undefined;
    const { data, error } = await sb.from("plants").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapPlantRow(data) : undefined;
  },

  async createPlant(input: Omit<Plant, "id" | "createdAt" | "updatedAt">): Promise<Plant> {
    const sb = supabaseAdmin();
    if (!sb) throw new Error("Supabase not configured");
    const row = plantToRow(input);
    const { data, error } = await sb.from("plants").insert(row).select().single();
    if (error) throw error;
    return mapPlantRow(data);
  },

  async updatePlant(id: string, patch: Partial<Plant>): Promise<Plant | undefined> {
    const sb = supabaseAdmin();
    if (!sb) return undefined;
    const { data, error } = await sb
      .from("plants")
      .update({ ...plantPatchToRow(patch), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapPlantRow(data) : undefined;
  },

  async deletePlant(id: string): Promise<boolean> {
    const sb = supabaseAdmin();
    if (!sb) return false;
    const { error } = await sb.from("plants").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async addCareLog(input: Omit<CareLog, "id">): Promise<CareLog> {
    const sb = supabaseAdmin();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("care_logs")
      .insert({
        plant_id: input.plantId,
        task_type: input.taskType,
        completed_at: input.completedAt,
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapCareLogRow(data);
  },

  async listCareLogs(plantId: string, limit = 20): Promise<CareLog[]> {
    const sb = supabaseAdmin();
    if (!sb) return [];
    const { data, error } = await sb
      .from("care_logs")
      .select("*")
      .eq("plant_id", plantId)
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapCareLogRow);
  },

  async addPhoto(input: Omit<PlantPhoto, "id">): Promise<PlantPhoto> {
    const sb = supabaseAdmin();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("plant_photos")
      .insert({
        plant_id: input.plantId,
        storage_path: input.storagePath,
        taken_at: input.takenAt,
        prompt_type: input.promptType,
      })
      .select()
      .single();
    if (error) throw error;
    return mapPhotoRow(data);
  },

  async listPhotos(plantId: string): Promise<PlantPhoto[]> {
    const sb = supabaseAdmin();
    if (!sb) return [];
    const { data, error } = await sb
      .from("plant_photos")
      .select("*")
      .eq("plant_id", plantId)
      .order("taken_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapPhotoRow);
  },

  async addAnalysis(input: Omit<PhotoAnalysis, "id" | "createdAt">): Promise<PhotoAnalysis> {
    const sb = supabaseAdmin();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("photo_analyses")
      .insert({
        photo_id: input.photoId,
        plant_id: input.plantId,
        model: input.model,
        overall_health: input.overallHealth,
        confidence: input.confidence,
        findings: input.findings,
        watering_assessment: input.wateringAssessment,
        light_assessment: input.lightAssessment,
        pests_detected: input.pestsDetected,
        follow_up_days: input.followUpDays,
        summary: input.summary,
      })
      .select()
      .single();
    if (error) throw error;
    return mapAnalysisRow(data);
  },

  async getLatestAnalysis(plantId: string): Promise<PhotoAnalysis | undefined> {
    const sb = supabaseAdmin();
    if (!sb) return undefined;
    const { data, error } = await sb
      .from("photo_analyses")
      .select("*")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapAnalysisRow(data) : undefined;
  },

  async listAnalyses(plantId: string): Promise<PhotoAnalysis[]> {
    const sb = supabaseAdmin();
    if (!sb) return [];
    const { data, error } = await sb
      .from("photo_analyses")
      .select("*")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAnalysisRow);
  },

  async getAnalysisByPhotoId(photoId: string): Promise<PhotoAnalysis | undefined> {
    const sb = supabaseAdmin();
    if (!sb) return undefined;
    const { data, error } = await sb
      .from("photo_analyses")
      .select("*")
      .eq("photo_id", photoId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapAnalysisRow(data) : undefined;
  },

  async getSnapshot(): Promise<StoreSnapshot> {
    const sb = supabaseAdmin();
    if (!sb) {
      return { rooms: [], plants: [], careLogs: [], photos: [], analyses: [], pushSubscriptions: [] };
    }
    const [rooms, plants, careLogs, photos, analyses, pushSubscriptions] = await Promise.all([
      sb.from("rooms").select("*").order("name"),
      sb.from("plants").select("*"),
      sb.from("care_logs").select("*").order("completed_at", { ascending: false }),
      sb.from("plant_photos").select("*").order("taken_at", { ascending: false }),
      sb.from("photo_analyses").select("*").order("created_at", { ascending: false }),
      sb.from("push_subscriptions").select("*"),
    ]);
    return {
      rooms: (rooms.data ?? []) as Room[],
      plants: (plants.data ?? []).map(mapPlantRow),
      careLogs: (careLogs.data ?? []).map(mapCareLogRow),
      photos: (photos.data ?? []).map(mapPhotoRow),
      analyses: (analyses.data ?? []).map(mapAnalysisRow),
      pushSubscriptions: (pushSubscriptions.data ?? []).map(mapPushSubRow),
    };
  },

  async addPushSubscription(
    input: Omit<PushSubscriptionRecord, "id" | "createdAt">,
  ): Promise<PushSubscriptionRecord> {
    const sb = supabaseAdmin();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("push_subscriptions")
      .upsert(
        { endpoint: input.endpoint, p256dh: input.p256dh, auth: input.auth },
        { onConflict: "endpoint" },
      )
      .select()
      .single();
    if (error) throw error;
    return mapPushSubRow(data);
  },

  async removePushSubscription(endpoint: string): Promise<boolean> {
    const sb = supabaseAdmin();
    if (!sb) return false;
    const { error } = await sb.from("push_subscriptions").delete().eq("endpoint", endpoint);
    if (error) throw error;
    return true;
  },

  async listPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
    const sb = supabaseAdmin();
    if (!sb) return [];
    const { data, error } = await sb.from("push_subscriptions").select("*");
    if (error) throw error;
    return (data ?? []).map(mapPushSubRow);
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlantRow(row: any): Plant {
  return {
    id: row.id,
    nickname: row.nickname,
    speciesId: row.species_id,
    roomId: row.room_id,
    acquiredAt: row.acquired_at ?? undefined,
    lastWateredAt: row.last_watered_at,
    customIntervalDays: row.custom_interval_days ?? undefined,
    potMaterial: row.pot_material,
    potSize: row.pot_size,
    lightLevel: row.light_level,
    photoPromptIntervalDays: row.photo_prompt_interval_days,
    lastPhotoAt: row.last_photo_at ?? undefined,
    nextPhotoPromptAt: row.next_photo_prompt_at ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function plantToRow(input: Omit<Plant, "id" | "createdAt" | "updatedAt">) {
  return {
    nickname: input.nickname,
    species_id: input.speciesId,
    room_id: input.roomId,
    acquired_at: input.acquiredAt ?? null,
    last_watered_at: input.lastWateredAt,
    custom_interval_days: input.customIntervalDays ?? null,
    pot_material: input.potMaterial,
    pot_size: input.potSize,
    light_level: input.lightLevel,
    photo_prompt_interval_days: input.photoPromptIntervalDays,
    last_photo_at: input.lastPhotoAt ?? null,
    next_photo_prompt_at: input.nextPhotoPromptAt ?? null,
    notes: input.notes ?? null,
  };
}

function plantPatchToRow(patch: Partial<Plant>) {
  const row: Record<string, unknown> = {};
  if (patch.nickname !== undefined) row.nickname = patch.nickname;
  if (patch.speciesId !== undefined) row.species_id = patch.speciesId;
  if (patch.roomId !== undefined) row.room_id = patch.roomId;
  if (patch.lastWateredAt !== undefined) row.last_watered_at = patch.lastWateredAt;
  if (patch.customIntervalDays !== undefined) row.custom_interval_days = patch.customIntervalDays;
  if (patch.potMaterial !== undefined) row.pot_material = patch.potMaterial;
  if (patch.potSize !== undefined) row.pot_size = patch.potSize;
  if (patch.lightLevel !== undefined) row.light_level = patch.lightLevel;
  if (patch.photoPromptIntervalDays !== undefined)
    row.photo_prompt_interval_days = patch.photoPromptIntervalDays;
  if (patch.lastPhotoAt !== undefined) row.last_photo_at = patch.lastPhotoAt;
  if (patch.nextPhotoPromptAt !== undefined) row.next_photo_prompt_at = patch.nextPhotoPromptAt;
  if (patch.notes !== undefined) row.notes = patch.notes;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCareLogRow(row: any): CareLog {
  return {
    id: row.id,
    plantId: row.plant_id,
    taskType: row.task_type,
    completedAt: row.completed_at,
    notes: row.notes ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPhotoRow(row: any): PlantPhoto {
  return {
    id: row.id,
    plantId: row.plant_id,
    storagePath: row.storage_path,
    takenAt: row.taken_at,
    promptType: row.prompt_type,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAnalysisRow(row: any): PhotoAnalysis {
  return {
    id: row.id,
    photoId: row.photo_id,
    plantId: row.plant_id,
    model: row.model,
    overallHealth: row.overall_health,
    confidence: row.confidence,
    findings: row.findings,
    wateringAssessment: row.watering_assessment,
    lightAssessment: row.light_assessment,
    pestsDetected: row.pests_detected,
    followUpDays: row.follow_up_days,
    summary: row.summary,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPushSubRow(row: any): PushSubscriptionRecord {
  return {
    id: row.id,
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
    createdAt: row.created_at,
  };
}

export type { StoreSnapshot };
