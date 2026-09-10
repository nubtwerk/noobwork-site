import { nativeContactError } from "@/lib/native-contact-error";
import { NextResponse } from "next/server";
import { parseContactPayload, sendContactEmail } from "@/lib/contact";
import { rateLimit } from "@/lib/rate-limit";
import { inquiryFeedback, type InquiryFeedbackCode } from "@/lib/inquiry-feedback";

export const runtime = "nodejs";
export const maxDuration = 10;
const MAX_BYTES = 64_000;

/** Best-effort per-instance limiting; x-real-ip is supplied by Vercel's edge. */
function clientKey(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 45);
  return (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").slice(0, 45);
}

async function readBody(request: Request): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("INVALID_BODY");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  const nativeForm = type === "application/x-www-form-urlencoded";
  // Native forms can POST across sites without CORS preflight. Reject those
  // before parsing or sending; ordinary API clients may omit Origin.
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: unknown;
  function respond(status: number, code: InquiryFeedbackCode | "sent", message?: string) {
    if (nativeForm && code !== "sent") {
      return nativeContactError(status, message ?? inquiryFeedback[code], body);
    }
    if (nativeForm) {
      // Only a known result code enters the URL, never the visitor's draft.
      const url = new URL("/media-kit", request.url);
      url.searchParams.set("inquiry", code);
      url.hash = "inquiry";
      return NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json(code === "sent" ? { ok: true } : { error: message ?? inquiryFeedback[code] }, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const { allowed } = rateLimit(`contact:${clientKey(request)}`);
  if (!allowed && !nativeForm) return respond(429, "limited");
  if (Number(request.headers.get("content-length")) > MAX_BYTES) return respond(413, "large", "Request too large.");
  if (type !== "application/json" && !nativeForm) return respond(415, "invalid", "Unsupported request format.");

  try {
    const text = await readBody(request);
    body = nativeForm ? Object.fromEntries(new URLSearchParams(text)) : JSON.parse(text);
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return respond(413, "large", "Request too large.");
    return respond(400, "invalid", "Invalid request.");
  }

  if (!allowed) return respond(429, "limited");
  const parsed = parseContactPayload(body);
  if ("error" in parsed) return respond(400, "invalid", parsed.error);
  if ("honeypot" in parsed) return respond(200, "sent");

  try {
    await sendContactEmail(parsed.data);
    return respond(200, "sent");
  } catch (error) {
    if (error instanceof Error && error.message === "CONTACT_NOT_CONFIGURED") return respond(503, "unavailable");
    // Provider response bodies may contain private data.
    console.error("contact form send failed", error instanceof Error ? error.name : "UnknownError");
    return respond(502, "failed");
  }
}
