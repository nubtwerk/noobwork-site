/**
 * scripts/generate-atmosphere.mjs
 *
 * Regenerate AI atmosphere images via the Higgsfield API.
 * Credentials live in .env.local (gitignored) — never commit keys.
 *
 * Usage:
 *   npm run generate:atmosphere
 *   npm run generate:atmosphere -- --variant seoul-dusk
 *
 * Requires Node 20+ (--env-file). Set one of:
 *   HF_CREDENTIALS=KEY_ID:KEY_SECRET
 *   HF_API_KEY=... + HF_API_SECRET=...
 *
 * Get keys: https://cloud.higgsfield.ai
 */

import { createWriteStream, existsSync, copyFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { pipeline } from "stream/promises";
import { createHiggsfieldClient } from "@higgsfield/client/v2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public/atmosphere");

const VARIANTS = {
  "seoul-dusk": {
    file: "atmosphere-seoul-dusk.jpg",
    aspect_ratio: "16:9",
    prompt:
      "Seoul South Korea dusk skyline panoramic view, Namsan mountain with N Seoul Tower silhouette centered, dense mid-rise city between forested hills, warm sand golden hour light on horizon fading to deep forest green shadows, brown urban midtones, subtle 35mm film grain, cinematic atmospheric haze, premium editorial mood, no people, no text, no neon, no logos",
  },
  "seoul-street": {
    file: "atmosphere-seoul-street.jpg",
    aspect_ratio: "4:5",
    prompt:
      "Quiet Seoul hanok alley at dusk, traditional curved tile roofs, warm sand lantern glow, deep forest green shadows in doorways, brown wood and stone textures, subtle film grain, no people, no text, premium lifestyle editorial atmosphere",
  },
  "gym-dawn": {
    file: "atmosphere-gym-dawn.jpg",
    aspect_ratio: "4:5",
    prompt:
      "Empty modern gym interior at dawn, soft sand light through tall windows, deep forest green rubber floor tones, brown leather equipment accents, minimal and premium, subtle film grain, no people, no text, no logos",
  },
};

const ENDPOINT = "flux-pro/kontext/max/text-to-image";

function credentialsFromEnv() {
  if (process.env.HF_CREDENTIALS?.trim()) {
    return process.env.HF_CREDENTIALS.trim();
  }
  const key = process.env.HF_API_KEY?.trim();
  const secret = process.env.HF_API_SECRET?.trim();
  if (key && secret) return `${key}:${secret}`;
  return null;
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  mkdirSync(path.dirname(destPath), { recursive: true });
  await pipeline(res.body, createWriteStream(destPath));
}

async function generateVariant(client, variantKey) {
  const variant = VARIANTS[variantKey];
  if (!variant) {
    throw new Error(
      `Unknown variant "${variantKey}". Choose: ${Object.keys(VARIANTS).join(", ")}`
    );
  }

  const destPath = path.join(OUT_DIR, variant.file);
  console.log(`Generating ${variantKey} → ${variant.file} (${variant.aspect_ratio})…`);

  const jobSet = await client.subscribe(ENDPOINT, {
    input: {
      prompt: variant.prompt,
      aspect_ratio: variant.aspect_ratio,
      safety_tolerance: 2,
    },
    withPolling: true,
  });

  if (jobSet.isNsfw) {
    throw new Error("Higgsfield flagged the result as NSFW. Try a softer prompt.");
  }
  if (!jobSet.isCompleted) {
    throw new Error(`Generation did not complete (status: ${jobSet.jobs[0]?.status ?? "unknown"})`);
  }

  const imageUrl = jobSet.jobs[0]?.results?.raw?.url;
  if (!imageUrl) {
    throw new Error("No image URL in Higgsfield response.");
  }

  if (existsSync(destPath)) {
    copyFileSync(destPath, `${destPath}.bak`);
    console.log(`Backed up existing file to ${variant.file}.bak`);
  }

  await downloadToFile(imageUrl, destPath);
  console.log(`Saved ${destPath}`);
  console.log(`Source URL: ${imageUrl}`);
}

async function main() {
  const credentials = credentialsFromEnv();
  if (!credentials) {
    console.error(
      "Missing Higgsfield credentials. Add HF_CREDENTIALS=KEY_ID:KEY_SECRET to .env.local"
    );
    console.error("Create keys at https://cloud.higgsfield.ai");
    process.exit(1);
  }

  const variantArg = process.argv.find((a) => a.startsWith("--variant="));
  const variant =
    variantArg?.slice("--variant=".length) ??
    process.argv[process.argv.indexOf("--variant") + 1] ??
    "seoul-dusk";

  const client = createHiggsfieldClient({ credentials });
  await generateVariant(client, variant);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
