import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/season-bids/admin-auth";
import { isCrossSite, readPayload, seeOther } from "@/lib/season-bids/http";
import { decideBid, type AdminAction } from "@/lib/season-bids/service";
import { getBidStore } from "@/lib/season-bids/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS: readonly AdminAction[] = ["approve", "reject", "winner"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (isCrossSite(request) || !verifySession((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return seeOther(request, "/season/admin");
  }
  const store = getBidStore();
  if (!store) return seeOther(request, "/season/admin?notice=unavailable");
  const { id } = await params;
  const body = await readPayload(request);
  const action = ACTIONS.find((a) => a === body?.action);
  if (!action) return seeOther(request, "/season/admin");
  try {
    const result = await decideBid(store, id, action, new URL(request.url).origin);
    const notice = result.ok ? `done-${action}` : result.error;
    return seeOther(request, `/season/admin?notice=${notice}#bid-${id}`);
  } catch (error) {
    console.error("season admin action failed", error instanceof Error ? error.message : "UnknownError");
    return seeOther(request, "/season/admin?notice=unavailable");
  }
}
