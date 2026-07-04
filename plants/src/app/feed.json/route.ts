import { NextResponse } from "next/server";
import { buildFeedJson } from "@/lib/feed";
import { listPlantsWithMeta } from "@/lib/plants-service";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://plants.noobwork.no";
  const plants = await listPlantsWithMeta();
  const feed = buildFeedJson(plants, baseUrl);

  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
