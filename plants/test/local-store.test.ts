import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const projectRoot = process.cwd();
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "noobwork-store-test-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.stubEnv("PLANTS_SEED_DEMO", "false");
  vi.resetModules();
});
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await fs.rm(directory, { recursive: true, force: true });
});

describe("local collection integrity", () => {
  it("preserves an existing collection when the actual build seed script runs", async () => {
    const script = path.join(directory, "scripts", "seed-store.mjs");
    const store = path.join(directory, ".plants-data", "store.json");
    await fs.mkdir(path.dirname(script), { recursive: true });
    await fs.mkdir(path.dirname(store), { recursive: true });
    await fs.mkdir(path.join(directory, "src", "data"), { recursive: true });
    await fs.copyFile(path.join(projectRoot, "scripts", "seed-store.mjs"), script);
    await fs.writeFile(path.join(directory, "src", "data", "seed-store.json"), '{"plants":["demo"]}');
    await fs.writeFile(store, '{"plants":["real collection"]}');
    execFileSync(process.execPath, [script], { env: { ...process.env, PLANTS_SEED_DEMO: "true" } });
    expect(await fs.readFile(store, "utf8")).toBe('{"plants":["real collection"]}');
  });

  it("retains both overlapping writes", async () => {
    const { localStore } = await import("@/lib/db/local-store");
    await localStore.getSnapshot();
    const create = (name: string) => localStore.addPushSubscription({ endpoint: name, p256dh: "test", auth: "test" });
    await Promise.all(Array.from({ length: 12 }, (_, i) => create(`https://push.example/${i}`)));
    expect(await localStore.listPushSubscriptions()).toHaveLength(12);
  });

  it("preserves a corrupt file and reports the error", async () => {
    const location = path.join(directory, ".plants-data", "store.json");
    await fs.mkdir(path.dirname(location));
    await fs.writeFile(location, '{"plants":[');
    const { localStore } = await import("@/lib/db/local-store");
    await expect(localStore.getSnapshot()).rejects.toThrow();
    expect(await fs.readFile(location, "utf8")).toBe('{"plants":[');
    // A rejected transaction must not permanently block later operations.
    await fs.writeFile(location, JSON.stringify({ rooms: [], plants: [], careLogs: [], photos: [], analyses: [], pushSubscriptions: [] }));
    expect(await localStore.listPlants()).toHaveLength(0);
  });

  it.each(["writeFile", "rename"] as const)("preserves the existing store when %s fails, then recovers", async (operation) => {
    const { localStore } = await import("@/lib/db/local-store");
    await localStore.getSnapshot();
    const location = path.join(directory, ".plants-data", "store.json");
    const original = await fs.readFile(location, "utf8");
    vi.spyOn(fs, operation).mockRejectedValueOnce(new Error("Simulated disk failure"));
    const entry = { endpoint: "https://push.example/recovery", p256dh: "test", auth: "test" };
    await expect(localStore.addPushSubscription(entry)).rejects.toThrow("Simulated disk failure");
    expect(await fs.readFile(location, "utf8")).toBe(original);
    expect((await fs.readdir(path.dirname(location))).filter((name) => name.endsWith(".tmp"))).toHaveLength(0);
    await localStore.addPushSubscription(entry);
    expect(await localStore.listPushSubscriptions()).toHaveLength(1);
  });

  it("keeps an intentionally empty collection empty when demo seeding is enabled", async () => {
    const { localStore } = await import("@/lib/db/local-store");
    await localStore.getSnapshot();
    vi.stubEnv("PLANTS_SEED_DEMO", "true");
    expect(await localStore.listPlants()).toHaveLength(0);
  });
});
