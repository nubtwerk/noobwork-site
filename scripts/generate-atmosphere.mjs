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
    resolution: "1080p",
    prompt:
      "Seoul South Korea dusk skyline panoramic view, Namsan mountain with N Seoul Tower silhouette centered, dense mid-rise city between forested hills, warm sand golden hour light on horizon fading to deep forest green shadows, brown urban midtones, subtle 35mm film grain, cinematic atmospheric haze, premium editorial mood, no people, no text, no neon, no logos",
  },
  "seoul-street": {
    file: "atmosphere-seoul-street.jpg",
    aspect_ratio: "4:5",
    resolution: "720p",
    prompt:
      "Bukchon Hanok Village Seoul South Korea, narrow cobblestone alley between restored traditional hanok houses, curved dark giwa tile roofs with layered eaves, warm sand golden hour light on plaster walls, deep forest green shadows in doorways and under rooflines, brown wood lattice doors and stone steps, distant hazy mountain ridge, premium lifestyle editorial atmosphere, subtle 35mm film grain, cinematic depth, empty streetscape only, no people, no text, no neon, no logos, no signage",
  },
  "gym-dawn": {
    file: "atmosphere-gym-dawn.jpg",
    aspect_ratio: "4:5",
    resolution: "720p",
    prompt:
      "Empty modern gym interior at dawn, soft sand light through tall windows, deep forest green rubber floor tones, brown leather equipment accents, minimal and premium, subtle film grain, no people, no text, no logos",
  },
};

const ENDPOINT = "higgsfield-ai/soul/standard";

function imageUrlFromResult(result) {
  return (
    result?.images?.[0]?.url ??
    result?.jobs?.[0]?.results?.raw?.url ??
    null
  );
}

function formatApiError(err) {
  if (err?.response?.data) {
    return JSON.stringify(err.response.data);
  }
  if (err?.statusCode && err?.message) {
    return `${err.statusCode} ${err.message}`;
  }
  return err instanceof Error ? err.message : String(err);
}

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
  console.log(`Generating ${variantKey} → ${variant.file} (${variant.aspect_ratio}, ${variant.resolution})…`);

  let result;
  try {
    result = await client.subscribe(ENDPOINT, {
      input: {
        prompt: variant.prompt,
        aspect_ratio: variant.aspect_ratio,
        resolution: variant.resolution,
      },
      withPolling: true,
    });
  } catch (err) {
    throw new Error(`Higgsfield request failed: ${formatApiError(err)}`);
  }

  if (result?.status === "nsfw") {
    throw new Error("Higgsfield flagged the result as NSFW. Try a softer prompt.");
  }
  if (result?.status !== "completed") {
    throw new Error(
      `Generation did not complete (status: ${result?.status ?? "unknown"}).`
    );
  }

  const imageUrl = imageUrlFromResult(result);
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

function parseVariant(argv) {
  const eq = argv.find((a) => a.startsWith("--variant="));
  if (eq) return eq.slice("--variant=".length);
  const idx = argv.indexOf("--variant");
  if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith("-")) {
    return argv[idx + 1];
  }
  return "seoul-dusk";
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

  const variant = parseVariant(process.argv.slice(2));

  const client = createHiggsfieldClient({ credentials });
  await generateVariant(client, variant);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
