import fs from "fs/promises";
import path from "path";
import { getUploadsDir } from "@/lib/db/local-store";

export async function storePlantPhoto(plantId: string, optimized: Buffer): Promise<string> {
  const filename = `${plantId}-${Date.now()}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`plants/${filename}`, optimized, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadsDir = getUploadsDir();
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), optimized);
  return `/uploads/${filename}`;
}

export function photoDisplayUrl(storagePath: string): string {
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  return storagePath;
}
