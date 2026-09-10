#!/usr/bin/env node
/** First-time demo initialization. Existing collections are never overwritten. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const directory = path.dirname(scriptPath);

export function seedLocalStore({
  seedPath = path.join(directory, "../src/data/seed-store.json"),
  outPath = path.join(directory, "../.plants-data/store.json"),
} = {}) {
  if (process.env.PLANTS_SEED_DEMO === "false") return "disabled";
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  try {
    fs.copyFileSync(seedPath, outPath, fs.constants.COPYFILE_EXCL);
    return "created";
  } catch (error) {
    if (error.code === "EEXIST") return "preserved";
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  console.log(`[seed-store] ${seedLocalStore()}`);
}
