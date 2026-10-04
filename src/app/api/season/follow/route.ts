import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite } from "@/lib/request-guards";
import {
  followFeedback,
  normalizeFollowEmail,
  sendFollowConfirmation,
  type FollowFeedbackCode,
} from "@/lib/season-follow";

export const runtime = "nodejs";
export const maxDuration = 10;
const MAX_BYTES = 4_000;

export async function POST(request: Request) {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  const nativeForm = type === "application/x-www-form-urlencoded";

  function respond(status: number, code: FollowFeedbackCode) {
    if (nativeForm) {
      // Only a known result code enters the URL, never the visitor's email.
      const url = new URL("/season", request.url);
      url.searchParams.set("follow", code);
      url.hash = "follow";
      return NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "no-store" } });
    }
    const body = code === "sent" ? { ok: true } : { error: followFeedback[code], code };
    return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
  }

  if (isCrossSite(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (type !== "application/json" && !nativeForm) return respond(415, "invalid");
  if (Number(request.headers.get("content-length")) > MAX_BYTES) return respond(413, "invalid");

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return respond(413, "invalid");
    const parsed: unknown = nativeForm ? Object.fromEntries(new URLSearchParams(text)) : JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return respond(400, "invalid");
    body = parsed as Record<string, unknown>;
  } catch {
    return respond(400, "invalid");
  }

  if (!rateLimit(`follow:${clientKey(request)}`).allowed) return respond(429, "limited");
  // Bots fill the hidden field; pretend it worked and send nothing.
  if (typeof body.website === "string" && body.website.trim()) return respond(200, "sent");
  const email = normalizeFollowEmail(body.email);
  if (!email) return respond(400, "invalid");
  // Stops the form being used to flood one inbox with confirmation emails.
  if (!rateLimit(`follow-email:${email}`, { limit: 3, windowMs: 24 * 60 * 60 * 1000 }).allowed) return respond(429, "limited");

  try {
    await sendFollowConfirmation(email, new URL(request.url).origin);
    return respond(200, "sent");
  } catch (error) {
    if (error instanceof Error && error.message === "FOLLOW_NOT_CONFIGURED") return respond(503, "unavailable");
    console.error("season follow confirmation failed", error instanceof Error ? error.message : "UnknownError");
    return respond(502, "failed");
  }
}
