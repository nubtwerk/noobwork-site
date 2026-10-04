import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite, seeOther, readPayload } from "@/lib/season-bids/http";
import { confirmBid } from "@/lib/season-bids/service";
import { getBidStore } from "@/lib/season-bids/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A POST from the confirm page's button, never a GET: mail scanners open
 * links, and opening the link alone must not confirm a bid.
 */
export async function POST(request: Request) {
  if (isCrossSite(request)) return seeOther(request, "/season/confirm?result=invalid");
  const store = getBidStore();
  if (!store) return seeOther(request, "/season/confirm?result=unavailable");
  if (!rateLimit(`season-confirm:${clientKey(request)}`, { limit: 20 }).allowed) return seeOther(request, "/season/confirm?result=limited");
  const body = await readPayload(request);
  const token = typeof body?.token === "string" ? body.token : "";
  try {
    const result = await confirmBid(store, token, new URL(request.url).origin);
    if (result.ok) return seeOther(request, `/season/confirm?result=confirmed&spot=${encodeURIComponent(result.value.spotId)}`);
    const code = result.status === 410 ? "expired" : result.status === 409 ? "closed" : "invalid";
    return seeOther(request, `/season/confirm?result=${code}`);
  } catch (error) {
    console.error("season bid confirm failed", error instanceof Error ? error.message : "UnknownError");
    return seeOther(request, "/season/confirm?result=unavailable");
  }
}
