/** Best-effort client key for per-instance rate limits; x-real-ip is supplied by Vercel's edge. */
export function clientKey(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 45);
  return (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").slice(0, 45);
}

/**
 * Native forms and beacons can POST across sites without a CORS preflight.
 * Reject those; ordinary API clients may omit Origin.
 */
export function isCrossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site";
}
