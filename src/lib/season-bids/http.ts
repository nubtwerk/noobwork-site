import { NextResponse } from "next/server";

/** Best-effort per-instance key; x-real-ip is supplied by Vercel's edge. */
export function clientKey(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 45);
  return (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").slice(0, 45);
}

/** Forms can POST across sites without preflight; refuse anything not from this site. */
export function isCrossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site";
}

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const seeOther = (request: Request, path: string) =>
  NextResponse.redirect(new URL(path, request.url), { status: 303, headers: { "Cache-Control": "no-store" } });

const MAX_BYTES = 8_000;

/** JSON or a native form post, capped at a few KB. */
export async function readPayload(request: Request): Promise<Record<string, unknown> | null> {
  if (Number(request.headers.get("content-length")) > MAX_BYTES) return null;
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return null;
    if (type === "application/json") {
      const parsed: unknown = JSON.parse(text);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    }
    if (type === "application/x-www-form-urlencoded") return Object.fromEntries(new URLSearchParams(text));
  } catch {
    return null;
  }
  return null;
}
