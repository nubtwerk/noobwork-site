import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite, json, readPayload } from "@/lib/season-bids/http";
import { parseBidInput } from "@/lib/season-bids/rules";
import { placeBid, publicBoard } from "@/lib/season-bids/service";
import { getBidStore } from "@/lib/season-bids/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const UNAVAILABLE = "Bidding is not available right now. Email joachim@noobwork.no instead.";

/** The public board: amounts and labels only, never contact details. */
export async function GET() {
  const store = getBidStore();
  if (!store) return json({ error: UNAVAILABLE }, 503);
  try {
    return json({ spots: await publicBoard(store) });
  } catch (error) {
    console.error("season bids read failed", error instanceof Error ? error.message : "UnknownError");
    return json({ error: UNAVAILABLE }, 503);
  }
}

export async function POST(request: Request) {
  if (isCrossSite(request)) return json({ error: "Invalid request origin." }, 403);
  const store = getBidStore();
  if (!store) return json({ error: UNAVAILABLE }, 503);
  if (!rateLimit(`season-bid:${clientKey(request)}`, { limit: 10 }).allowed) {
    return json({ error: "Too many bids from this connection. Try again in an hour." }, 429);
  }
  const body = await readPayload(request);
  const parsed = parseBidInput(body);
  if ("honeypot" in parsed) return json({ ok: true });
  if ("error" in parsed) return json({ error: parsed.error }, 400);

  try {
    const result = await placeBid(store, parsed.data, new URL(request.url).origin);
    return result.ok ? json({ ok: true }) : json({ error: result.error }, result.status);
  } catch (error) {
    console.error("season bid failed", error instanceof Error ? error.message : "UnknownError");
    return json({ error: UNAVAILABLE }, 503);
  }
}
