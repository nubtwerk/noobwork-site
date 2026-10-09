import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite } from "@/lib/request-guards";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminCookieValue, checkAdminPassword } from "@/lib/challenge/admin";
import { readSmallBody, redirectTo } from "@/lib/challenge/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isCrossSite(request)) return redirectTo(request, "/season/admin/challenge", { login: "failed" });
  if (!rateLimit(`challenge-admin:${clientKey(request)}`, { limit: 8, windowMs: 15 * 60 * 1000 }).allowed) {
    return redirectTo(request, "/season/admin/challenge", { login: "limited" });
  }
  const parsed = await readSmallBody(request);
  const value = adminCookieValue();
  if (!value || !checkAdminPassword(parsed?.body.password)) return redirectTo(request, "/season/admin/challenge", { login: "failed" });
  const response = redirectTo(request, "/season/admin/challenge");
  response.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}
