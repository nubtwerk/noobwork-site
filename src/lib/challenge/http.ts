import { NextResponse } from "next/server";

const MAX_BYTES = 4_000;

export type ParsedBody = { body: Record<string, unknown>; nativeForm: boolean };

/** Reads a small JSON or native form body. Returns undefined for anything else. */
export async function readSmallBody(request: Request): Promise<ParsedBody | undefined> {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  const nativeForm = type === "application/x-www-form-urlencoded";
  if (type !== "application/json" && !nativeForm) return undefined;
  if (Number(request.headers.get("content-length")) > MAX_BYTES) return undefined;
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return undefined;
    const parsed: unknown = nativeForm ? Object.fromEntries(new URLSearchParams(text)) : JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    return { body: parsed as Record<string, unknown>, nativeForm };
  } catch {
    return undefined;
  }
}

export function isNativeForm(request: Request): boolean {
  return request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/x-www-form-urlencoded";
}

/** 303 back to a page. Only fixed result codes and our own tokens go into the URL, never what the visitor typed. */
export function redirectTo(request: Request, path: string, params: Record<string, string> = {}, hash?: string) {
  const url = new URL(path, request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (hash) url.hash = hash;
  return NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "no-store" } });
}

export function json(status: number, body: unknown) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Checkbox values from a native form ("on") or JSON (true). */
export function ticked(value: unknown): boolean {
  return value === true || value === "on" || value === "true" || value === "1";
}
