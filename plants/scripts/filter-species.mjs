#!/usr/bin/env node
/**
 * Filters plantfolio-common-plants to houseplant categories for a smaller bundle.
 * Falls back to existing species-houseplants.json if download fails (offline CI).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../src/data/species-houseplants.json");
const sourceUrl =
  "https://raw.githubusercontent.com/Luminoid/plantfolio-common-plants/main/dist/common_plants.json";

const HOUSEPLANT_PREFIX = "Houseplants";

async function main() {
  let raw;
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    raw = await res.json();
  } catch (err) {
    if (fs.existsSync(outPath)) {
      console.warn("[filter-species] Offline — keeping existing species file.");
      return;
    }
    throw err;
  }

  const plants = raw.filter(
    (entry) =>
      entry.id &&
      !entry._metadata &&
      typeof entry.category === "string" &&
      entry.category.startsWith(HOUSEPLANT_PREFIX),
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(plants, null, 2));
  console.log(`[filter-species] Wrote ${plants.length} houseplant species → ${outPath}`);
}

main().catch((err) => {
  console.error("[filter-species]", err.message);
  process.exit(1);
});
