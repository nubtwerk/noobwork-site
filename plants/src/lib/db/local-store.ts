import fs from "fs/promises";
import path from "path";
import seedStore from "@/data/seed-store.json";
import type {
  CareLog,
  PhotoAnalysis,
  Plant,
  PlantPhoto,
  PushSubscriptionRecord,
  Room,
  StoreSnapshot,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), ".plants-data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

const DEFAULT_ROOMS: Room[] = [
  { id: "living-room", name: "Living room" },
  { id: "bedroom", name: "Bedroom" },
  { id: "kitchen", name: "Kitchen" },
  { id: "balcony", name: "Balcony" },
];

function emptyStore(): StoreSnapshot {
  return {
    rooms: DEFAULT_ROOMS,
    plants: [],
    careLogs: [],
    photos: [],
    analyses: [],
    pushSubscriptions: [],
  };
}

function shouldSeedDemo(): boolean {
  return process.env.PLANTS_SEED_DEMO !== "false";
}

function demoSnapshot(): StoreSnapshot {
  return structuredClone(seedStore) as StoreSnapshot;
}

async function ensureStore(): Promise<StoreSnapshot> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreSnapshot;
    if (!parsed.rooms?.length) parsed.rooms = DEFAULT_ROOMS;
    if (!parsed.pushSubscriptions) parsed.pushSubscriptions = [];
    if (![parsed.plants, parsed.careLogs, parsed.photos, parsed.analyses].every(Array.isArray)) {
      throw new Error("Invalid local collection. Preserve the file and restore from a verified backup.");
    }
    return parsed;
  } catch (error) {
    // A corrupt/unreadable store is not a new collection. Never replace it.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const store = shouldSeedDemo() ? demoSnapshot() : emptyStore();
    await writeStore(store);
    return store;
  }
}

async function writeStore(store: StoreSnapshot): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temporary = `${STORE_FILE}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(store, null, 2), { flag: "wx" });
    await fs.rename(temporary, STORE_FILE);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

function id(): string {
  return crypto.randomUUID();
}

// Local mode is for a single Node process. Serialize whole transactions, not
// just writeFile calls. Production/multi-process use needs a database.
let pending: Promise<unknown> = Promise.resolve();
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation);
  pending = result.catch(() => undefined);
  return result;
}

export const localStore = {
  async getSnapshot(): Promise<StoreSnapshot> {
    return serialize(async () => {
      return ensureStore();
    });
  },

  async listRooms(): Promise<Room[]> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.rooms;
    });
  },

  async listPlants(): Promise<Plant[]> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.plants;
    });
  },

  async getPlant(plantId: string): Promise<Plant | undefined> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.plants.find((p) => p.id === plantId);
    });
  },

  async createPlant(input: Omit<Plant, "id" | "createdAt" | "updatedAt">): Promise<Plant> {
    return serialize(async () => {
      const store = await ensureStore();
      const now = new Date().toISOString();
      const plant: Plant = {
        ...input,
        id: id(),
        createdAt: now,
        updatedAt: now,
      };
      store.plants.push(plant);
      await writeStore(store);
      return plant;
    });
  },

  async updatePlant(plantId: string, patch: Partial<Plant>): Promise<Plant | undefined> {
    return serialize(async () => {
      const store = await ensureStore();
      const index = store.plants.findIndex((p) => p.id === plantId);
      if (index === -1) return undefined;
      store.plants[index] = {
        ...store.plants[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      await writeStore(store);
      return store.plants[index];
    });
  },

  async deletePlant(plantId: string): Promise<boolean> {
    return serialize(async () => {
      const store = await ensureStore();
      const before = store.plants.length;
      store.plants = store.plants.filter((p) => p.id !== plantId);
      store.careLogs = store.careLogs.filter((l) => l.plantId !== plantId);
      store.photos = store.photos.filter((p) => p.plantId !== plantId);
      store.analyses = store.analyses.filter((a) => a.plantId !== plantId);
      await writeStore(store);
      return store.plants.length < before;
    });
  },

  async addCareLog(input: Omit<CareLog, "id">): Promise<CareLog> {
    return serialize(async () => {
      const store = await ensureStore();
      const log: CareLog = { ...input, id: id() };
      store.careLogs.unshift(log);
      await writeStore(store);
      return log;
    });
  },

  async listCareLogs(plantId: string, limit = 20): Promise<CareLog[]> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.careLogs.filter((l) => l.plantId === plantId).slice(0, limit);
    });
  },

  async addPhoto(input: Omit<PlantPhoto, "id">): Promise<PlantPhoto> {
    return serialize(async () => {
      const store = await ensureStore();
      const photo: PlantPhoto = { ...input, id: id() };
      store.photos.unshift(photo);
      await writeStore(store);
      return photo;
    });
  },

  async listPhotos(plantId: string): Promise<PlantPhoto[]> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.photos.filter((p) => p.plantId === plantId);
    });
  },

  async addAnalysis(input: Omit<PhotoAnalysis, "id" | "createdAt">): Promise<PhotoAnalysis> {
    return serialize(async () => {
      const store = await ensureStore();
      const analysis: PhotoAnalysis = {
        ...input,
        id: id(),
        createdAt: new Date().toISOString(),
      };
      store.analyses.unshift(analysis);
      await writeStore(store);
      return analysis;
    });
  },

  async getLatestAnalysis(plantId: string): Promise<PhotoAnalysis | undefined> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.analyses.find((a) => a.plantId === plantId);
    });
  },

  async listAnalyses(plantId: string): Promise<PhotoAnalysis[]> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.analyses.filter((a) => a.plantId === plantId);
    });
  },

  async getAnalysisByPhotoId(photoId: string): Promise<PhotoAnalysis | undefined> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.analyses.find((a) => a.photoId === photoId);
    });
  },

  async addPushSubscription(
    input: Omit<PushSubscriptionRecord, "id" | "createdAt">,
  ): Promise<PushSubscriptionRecord> {
    return serialize(async () => {
      const store = await ensureStore();
      const existing = store.pushSubscriptions?.find((s) => s.endpoint === input.endpoint);
      if (existing) return existing;

      const sub: PushSubscriptionRecord = {
        ...input,
        id: id(),
        createdAt: new Date().toISOString(),
      };
      if (!store.pushSubscriptions) store.pushSubscriptions = [];
      store.pushSubscriptions.push(sub);
      await writeStore(store);
      return sub;
    });
  },

  async removePushSubscription(endpoint: string): Promise<boolean> {
    return serialize(async () => {
      const store = await ensureStore();
      if (!store.pushSubscriptions) return false;
      const before = store.pushSubscriptions.length;
      store.pushSubscriptions = store.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
      await writeStore(store);
      return store.pushSubscriptions.length < before;
    });
  },

  async listPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
    return serialize(async () => {
      const store = await ensureStore();
      return store.pushSubscriptions ?? [];
    });
  },
};

export function getUploadsDir(): string {
  return path.join(process.cwd(), "public", "uploads");
}
