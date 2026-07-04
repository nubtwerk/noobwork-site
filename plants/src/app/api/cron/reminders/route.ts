import { NextResponse } from "next/server";
import { listPlantsWithMeta, listPushSubscriptions } from "@/lib/plants-service";
import { sendPushToAll } from "@/lib/push";

/** Vercel Cron: daily reminder digest + Web Push. */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plants = await listPlantsWithMeta();
  const due = plants.filter((p) => p.waterStatus === "overdue" || p.waterStatus === "due_today");
  const photos = plants.filter((p) => p.photoDue);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://plants.noobwork.no";

  const lines: string[] = [];
  if (due.length) {
    lines.push(`${due.length} plant${due.length > 1 ? "s" : ""} need water`);
  }
  if (photos.length) {
    lines.push(`${photos.length} photo check-in${photos.length > 1 ? "s" : ""} due`);
  }
  const body = lines.length ? lines.join(" · ") : "All plants on track today.";

  let pushResult = { sent: 0, failed: 0 };
  const subscriptions = await listPushSubscriptions();
  if (subscriptions.length > 0 && lines.length > 0) {
    pushResult = await sendPushToAll(subscriptions, {
      title: "Plants · Today",
      body,
      url: baseUrl,
    });
  }

  return NextResponse.json({
    date: new Date().toISOString().slice(0, 10),
    waterDue: due.map((p) => ({ id: p.id, nickname: p.nickname, status: p.waterStatus })),
    photoDue: photos.map((p) => ({ id: p.id, nickname: p.nickname })),
    push: pushResult,
  });
}
