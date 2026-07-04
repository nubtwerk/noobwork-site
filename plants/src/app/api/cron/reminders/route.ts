import { NextResponse } from "next/server";
import { listPlantsWithMeta } from "@/lib/plants-service";

/** Vercel Cron: daily reminder digest (extend with Web Push). */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plants = await listPlantsWithMeta();
  const due = plants.filter((p) => p.waterStatus === "overdue" || p.waterStatus === "due_today");
  const photos = plants.filter((p) => p.photoDue);

  return NextResponse.json({
    date: new Date().toISOString().slice(0, 10),
    waterDue: due.map((p) => ({ id: p.id, nickname: p.nickname, status: p.waterStatus })),
    photoDue: photos.map((p) => ({ id: p.id, nickname: p.nickname })),
  });
}
