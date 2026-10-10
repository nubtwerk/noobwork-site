import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite, readPayload, seeOther } from "@/lib/season-bids/http";
import {
  PAGE_COOKIE,
  checkPagePassword,
  createPageSession,
  pagePasswordConfigured,
  safeSeasonReturnPath,
} from "@/lib/season-page-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const next = safeSeasonReturnPath(new URL(request.url).searchParams.get("next"));
  const fail = (code: string) => seeOther(request, `/season?unlock=${code}${next === "/season" ? "" : `&next=${encodeURIComponent(next)}`}`);

  if (isCrossSite(request)) return fail("1");
  if (!pagePasswordConfigured()) return fail("1");
  if (!rateLimit(`season-page:${clientKey(request)}`, { limit: 12 }).allowed) return fail("limited");

  const body = await readPayload(request);
  const returnTo = safeSeasonReturnPath(body?.next ?? next);
  if (!checkPagePassword(body?.password)) {
    return seeOther(
      request,
      `/season?unlock=1${returnTo === "/season" ? "" : `&next=${encodeURIComponent(returnTo)}`}`,
    );
  }

  const session = createPageSession();
  const response = seeOther(request, returnTo);
  response.cookies.set(PAGE_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
