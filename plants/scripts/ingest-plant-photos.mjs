#!/usr/bin/env node
/**
 * Converts HEIC/JPEG sources to optimized JPGs in public/demo/.
 * Searches: plants/download/, plants/assets/raw/, workspace/download/, ~/Downloads/
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import convert from "heic-convert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const plantsRoot = path.join(__dirname, "..");
const workspaceRoot = path.join(plantsRoot, "..");
const outDir = path.join(plantsRoot, "public/demo");
const manifestPath = path.join(plantsRoot, "assets/raw/manifest.json");

const SOURCE_DIRS = [
  path.join(workspaceRoot, "download/plant-photos"),
  path.join(workspaceRoot, "download"),
  path.join(plantsRoot, "download"),
  path.join(plantsRoot, "assets/raw"),
  path.join(workspaceRoot, "downloads"),
  path.join(os.homedir(), "Downloads"),
  path.join(os.homedir(), "Documents/code/noobwork-site/download/plant-photos"),
  path.join(os.homedir(), "Documents/code/noobwork-site/plants/download"),
  path.join(os.homedir(), "download"),
];

const PLANTS = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(heic|heif|jpe?g|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(dir, f));
}

function allSourceImages() {
  const seen = new Set();
  const files = [];
  for (const dir of SOURCE_DIRS) {
    for (const file of listImages(dir)) {
      if (!seen.has(file)) {
        seen.add(file);
        files.push(file);
      }
    }
  }
  return files;
}

function findSource(sources) {
  for (const dir of SOURCE_DIRS) {
    for (const name of sources) {
      const fp = path.join(dir, name);
      if (fs.existsSync(fp)) return fp;
    }
  }
  return null;
}

async function loadImageBuffer(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath);

  if (ext === ".heic" || ext === ".heif") {
    const converted = await convert({
      buffer: raw,
      format: "JPEG",
      quality: 0.92,
    });
    return Buffer.from(converted);
  }

  return raw;
}

async function writeJpg(inputPath, slug) {
  const buffer = await loadImageBuffer(inputPath);
  const outPath = path.join(outDir, `${slug}.jpg`);

  let pipeline = sharp(buffer).rotate();

  const meta = await sharp(buffer).rotate().metadata();
  if (meta.width && meta.height && meta.width > meta.height * 1.15) {
    pipeline = pipeline.rotate(90);
  }

  await pipeline
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath);

  console.log(`[ingest-photos] ${inputPath} → demo/${slug}.jpg`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const discovered = allSourceImages();
  if (discovered.length) {
    console.log(`[ingest-photos] Found ${discovered.length} image(s) in:`);
    for (const dir of SOURCE_DIRS) {
      const count = listImages(dir).length;
      if (count) console.log(`  ${dir} (${count})`);
    }
  }

  let converted = 0;

  for (let i = 0; i < PLANTS.length; i++) {
    const plant = PLANTS[i];
    const source = findSource(plant.sources) ?? discovered[i];

    if (!source) {
      console.log(`[ingest-photos] Skip ${plant.slug} — no source file`);
      continue;
    }

    await writeJpg(source, plant.slug);
    converted++;
  }

  if (converted === 0) {
    console.log("[ingest-photos] No photos found. Drop JPGs in download/plant-photos/ (repo root)");
    process.exit(0);
  }

  console.log(`[ingest-photos] Converted ${converted} photo(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
