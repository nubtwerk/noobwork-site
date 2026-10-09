import { ADMIN_COOKIE } from "@/lib/season-bids/admin-auth";
import { isCrossSite, seeOther } from "@/lib/season-bids/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = seeOther(request, "/season/admin");
  if (!isCrossSite(request)) response.cookies.delete(ADMIN_COOKIE);
  return response;
}
