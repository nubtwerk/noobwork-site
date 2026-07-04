#!/usr/bin/env node
/** Writes demo plant data to .plants-data/store.json at build time (included in Vercel deploy). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "../src/data/seed-store.json");
const outDir = path.join(__dirname, "../.plants-data");
const outPath = path.join(outDir, "store.json");

if (process.env.PLANTS_SEED_DEMO === "false") {
  console.log("[seed-store] Skipped (PLANTS_SEED_DEMO=false).");
  process.exit(0);
}

const seed = fs.readFileSync(seedPath, "utf8");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, seed);
console.log(`[seed-store] Wrote demo store → ${outPath}`);
