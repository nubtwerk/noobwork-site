import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite } from "@/lib/request-guards";
import { parseVisitRef, sendVisitAlert, visitFromRequest } from "@/lib/season-visit";

export const runtime = "nodejs";
export const maxDuration = 10;
const SIX_HOURS = 6 * 60 * 60 * 1000;

/** Always answers 204: the page never waits on or reacts to this beacon. */
export async function POST(request: Request) {
  const none = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (isCrossSite(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return none();

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 2_000) return none();
    body = JSON.parse(text);
    if (!body || typeof body !== "object") return none();
  } catch {
    return none();
  }
  const ref = parseVisitRef(body.ref);
  if (!ref) return none();

  // One alert per visitor per brand link every 6 hours, and a ceiling on
  // alerts overall so a made-up ref can't flood the inbox.
  if (!rateLimit(`visit:${clientKey(request)}:${ref}`, { limit: 1, windowMs: SIX_HOURS }).allowed) return none();
  if (!rateLimit("visit:all", { limit: 30 }).allowed) return none();

  try {
    await sendVisitAlert(visitFromRequest(request, ref, body.referrer));
  } catch (error) {
    console.error("season visit alert failed", error instanceof Error ? error.message : "UnknownError");
  }
  return none();
}
