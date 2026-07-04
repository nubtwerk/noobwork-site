export type LightPreference =
  | "lowIndirect"
  | "brightIndirect"
  | "mediumIndirect"
  | "highLight"
  | "directSun";

export type PlantToxicity = "nonToxic" | "toxic" | "mildlyToxic";

export type WaterStatus = "overdue" | "due_today" | "upcoming" | "on_track";

export interface PlantSpecies {
  id: string;
  typeName: string;
  description: string;
  commonExamples: string;
  careTips: string;
  origin: string;
  springInterval: number;
  summerInterval: number;
  fallInterval: number;
  winterInterval: number;
  lightPreference: LightPreference;
  humidityPreference: string;
  plantToxicity: PlantToxicity;
  category: string;
}

export interface Room {
  id: string;
  name: string;
  notes?: string;
}

export interface Plant {
  id: string;
  nickname: string;
  speciesId: string;
  roomId: string;
  acquiredAt?: string;
  lastWateredAt: string;
  customIntervalDays?: number;
  potMaterial: "plastic" | "terracotta" | "ceramic";
  potSize: "small" | "medium" | "large";
  lightLevel: "low" | "medium" | "bright";
  photoPromptIntervalDays: number;
  lastPhotoAt?: string;
  nextPhotoPromptAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareLog {
  id: string;
  plantId: string;
  taskType: "water" | "fertilize" | "photo" | "snooze";
  completedAt: string;
  notes?: string;
}

export interface PlantPhoto {
  id: string;
  plantId: string;
  storagePath: string;
  takenAt: string;
  promptType: "scheduled" | "manual" | "health_concern";
}

export interface PhotoAnalysisFinding {
  type: string;
  severity: "low" | "moderate" | "high";
  description: string;
  action: string;
}

export interface PhotoAnalysis {
  id: string;
  photoId: string;
  plantId: string;
  model: string;
  overallHealth: "healthy" | "stressed" | "concerning";
  confidence: number;
  findings: PhotoAnalysisFinding[];
  wateringAssessment: "ok" | "likely_under" | "likely_over";
  lightAssessment: string;
  pestsDetected: boolean;
  followUpDays: number;
  summary: string;
  createdAt: string;
}

export interface PlantWithMeta extends Plant {
  species: PlantSpecies;
  room: Room;
  waterStatus: WaterStatus;
  daysUntilWater: number;
  nextWaterDate: string;
  photoDue: boolean;
  latestAnalysis?: PhotoAnalysis;
  waterBreakdown: WaterIntervalBreakdown;
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
}

export interface WaterIntervalBreakdown {
  baseDays: number;
  season: string;
  factors: { label: string; multiplier: number }[];
  rawDays: number;
  effectiveDays: number;
  summary: string;
}

export interface SeoulWeatherNudge {
  humidity: number;
  temperature: number;
  message: string;
  intervalAdjustDays: number;
}

export interface CollectionStats {
  totalPlants: number;
  needWater: number;
  photoDue: number;
  lastCheckInDaysAgo: number | null;
}

export interface TimelineEntry {
  photo: PlantPhoto;
  analysis?: PhotoAnalysis;
}

export interface StoreSnapshot {
  rooms: Room[];
  plants: Plant[];
  careLogs: CareLog[];
  photos: PlantPhoto[];
  analyses: PhotoAnalysis[];
  pushSubscriptions?: PushSubscriptionRecord[];
}
