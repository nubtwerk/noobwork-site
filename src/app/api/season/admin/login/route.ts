import { rateLimit } from "@/lib/rate-limit";
import { ADMIN_COOKIE, checkPassword, createSession } from "@/lib/season-bids/admin-auth";
import { clientKey, isCrossSite, readPayload, seeOther } from "@/lib/season-bids/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (isCrossSite(request)) return seeOther(request, "/season/admin?error=1");
  if (!rateLimit(`season-admin:${clientKey(request)}`, { limit: 8 }).allowed) return seeOther(request, "/season/admin?error=limited");
  const body = await readPayload(request);
  if (!checkPassword(body?.password)) return seeOther(request, "/season/admin?error=1");
  const session = createSession();
  const response = seeOther(request, "/season/admin");
  response.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
