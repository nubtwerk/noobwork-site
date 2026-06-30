import { NextResponse } from "next/server";
import { parseContactPayload, sendContactEmail } from "@/lib/contact";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 10;

/** Best-effort client identifier for rate limiting. */
function clientKey(request: Request): string {
  // On Vercel x-real-ip is set by the edge to the true client IP and cannot be
  // overridden by the caller, so prefer it. x-forwarded-for can be prepended by
  // the client (its first hop is spoofable), so it is only a fallback. This is
  // best-effort either way — see src/lib/rate-limit.ts for the caveats.
  // Cap key length (max IPv6 textual length is 45) so a malicious oversized
  // header value can't bloat per-key memory in the limiter store.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 45);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return (forwarded.split(",")[0]?.trim() || "unknown").slice(0, 45);
  return "unknown";
}

export async function POST(request: Request) {
  // Reject oversized bodies before parsing so a flood of huge payloads can't
  // burn CPU/memory ahead of the rate-limit check. A real inquiry is well under
  // this (the message itself is capped at 5,000 chars downstream).
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 64_000) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseContactPayload(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Honeypot trip — pretend success so bots do not retry variants.
  if ("honeypot" in parsed) {
    return NextResponse.json({ ok: true });
  }

  // Throttle the expensive path per client: an unauthenticated endpoint that
  // sends real email must not be floodable into inbox spam or runaway cost.
  const { allowed } = rateLimit(`contact:${clientKey(request)}`);
  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "Too many requests. Please try again later or email joachim@noobwork.no directly.",
      },
      { status: 429 }
    );
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "CONTACT_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "The contact form is not configured yet. Email joachim@noobwork.no directly.",
        },
        { status: 503 }
      );
    }
    console.error("contact form send failed:", message);
    return NextResponse.json(
      { error: "Could not send your message. Try email directly." },
      { status: 502 }
    );
  }
}
