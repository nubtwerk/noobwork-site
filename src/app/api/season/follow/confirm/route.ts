import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite } from "@/lib/request-guards";
import { addFollower, verifyFollowToken, type FollowFeedbackCode } from "@/lib/season-follow";

export const runtime = "nodejs";
export const maxDuration = 10;

/** The confirm page posts here; a link scanner's GET never reaches it. */
export async function POST(request: Request) {
  function done(code: FollowFeedbackCode) {
    const url = new URL("/season", request.url);
    url.searchParams.set("follow", code);
    url.hash = "follow";
    return NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "no-store" } });
  }

  if (isCrossSite(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!rateLimit(`follow-confirm:${clientKey(request)}`, { limit: 20 }).allowed) return done("limited");

  let token: unknown;
  try {
    token = (await request.formData()).get("t");
  } catch {
    return done("expired");
  }
  const email = verifyFollowToken(token);
  if (!email) return done("expired");

  try {
    await addFollower(email);
    return done("confirmed");
  } catch (error) {
    if (error instanceof Error && error.message === "FOLLOW_GLOBAL_UNSUBSCRIBED") return done("unsubscribed");
    if (error instanceof Error && error.message === "FOLLOW_NOT_CONFIGURED") return done("unavailable");
    console.error("season follow confirm failed", error instanceof Error ? error.message : "UnknownError");
    return done("failed");
  }
}
