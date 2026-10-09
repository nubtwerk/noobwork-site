import { isChallengeDemo } from "./env";
import { adminSessionValue, safeEqual } from "./tokens";

export const ADMIN_COOKIE = "challenge_admin";
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;
/** Demo previews only, where everything is made-up data. */
export const DEMO_ADMIN_PASSWORD = "preview";

export function adminPassword(): string | undefined {
  const configured = process.env.SEASON_ADMIN_PASSWORD;
  if (configured && configured.length >= 12) return configured;
  return isChallengeDemo() ? DEMO_ADMIN_PASSWORD : undefined;
}

export function checkAdminPassword(given: unknown): boolean {
  const password = adminPassword();
  return Boolean(password && typeof given === "string" && safeEqual(given, password));
}

export function adminCookieValue(): string | undefined {
  const password = adminPassword();
  return password ? adminSessionValue(password) : undefined;
}

export function isAdminSession(cookieValue: string | undefined): boolean {
  const expected = adminCookieValue();
  return Boolean(expected && cookieValue && safeEqual(cookieValue, expected));
}

/** Reads the admin cookie from a request's Cookie header. */
export function isAdminRequest(request: Request): boolean {
  const header = request.headers.get("cookie") ?? "";
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  return isAdminSession(match ? decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1)) : undefined);
}
