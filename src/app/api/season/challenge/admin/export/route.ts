import { NextResponse } from "next/server";
import { challenge, isChallengeWindowId } from "@/data/challenge";
import { isAdminRequest } from "@/lib/challenge/admin";
import { formatImprovement, windowWinners } from "@/lib/challenge/leaderboard";
import { getChallengeStore } from "@/lib/challenge/store";
import { countryName, formatRunTime } from "@/lib/challenge/validate";

export const runtime = "nodejs";

const cell = (value: string) => `"${value.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;

/** CSV of a window's prize winners, with emails, for passing to the prize sponsor. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) return new NextResponse("Not found", { status: 404 });
  const store = getChallengeStore();
  const windowId = new URL(request.url).searchParams.get("window");
  if (!store || !isChallengeWindowId(windowId) || windowId === "baseline") return new NextResponse("Pick a retest window.", { status: 400 });
  const winners = windowWinners(await store.listParticipants(), await store.listResults(), windowId);
  const lines = [
    ["place", "display_name", "email", "country", "baseline", "time", "improvement", "proof"].map(cell).join(","),
    ...winners.map((s, i) =>
      [String(i + 1), s.participant.displayName, s.participant.email, countryName(s.participant.country), formatRunTime(s.baseline.timeSeconds), formatRunTime(s.latest!.timeSeconds), formatImprovement(s.improvementPct!), s.latest!.proofUrl].map(cell).join(","),
    ),
  ];
  const slug = challenge.name.toLowerCase().replace(/\W+/g, "-");
  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-${windowId}-winners.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
