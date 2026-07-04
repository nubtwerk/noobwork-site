#!/usr/bin/env node
/** Fallback placeholder JPGs when assets/raw/ has no photos yet. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/demo");

const PLANTS = [
  { slug: "bird-of-paradise", label: "Bird of paradise", accent: "#3F6F4F" },
  { slug: "china-doll", label: "China doll", accent: "#4A7C59" },
  { slug: "olive-tree", label: "Olive tree", accent: "#6B7F5E" },
];

function svg(label, accent) {
  return Buffer.from(`<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#2C3930"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <text x="400" y="380" font-family="system-ui,sans-serif" font-size="38" font-weight="600" fill="#F8F8F8" text-anchor="middle">${label}</text>
  <text x="400" y="430" font-family="system-ui,sans-serif" font-size="20" fill="#ECDBBF" text-anchor="middle">Add photo to assets/raw/</text>
</svg>`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  for (const plant of PLANTS) {
    const outPath = path.join(outDir, `${plant.slug}.jpg`);
    if (fs.existsSync(outPath)) {
      console.log(`[demo-photos] Skip ${plant.slug}.jpg (exists)`);
      continue;
    }
    await sharp(svg(plant.label, plant.accent)).jpeg({ quality: 85 }).toFile(outPath);
    console.log(`[demo-photos] Placeholder ${plant.slug}.jpg`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
