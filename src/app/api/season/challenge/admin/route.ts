import { isCrossSite } from "@/lib/request-guards";
import { isAdminRequest } from "@/lib/challenge/admin";
import { readSmallBody, redirectTo } from "@/lib/challenge/http";
import { getChallengeStore, type ResultStatus } from "@/lib/challenge/store";

export const runtime = "nodejs";

const RESULT_ACTIONS: Record<string, ResultStatus> = {
  verify: "verified",
  reject: "rejected",
  unverify: "self_reported",
};

/** One review action from the admin page. SameSite=Strict cookie plus the origin check stop cross-site posts. */
export async function POST(request: Request) {
  if (isCrossSite(request) || !isAdminRequest(request)) return redirectTo(request, "/season/admin/challenge", { login: "required" });
  const store = getChallengeStore();
  const parsed = await readSmallBody(request);
  const action = typeof parsed?.body.action === "string" ? parsed.body.action : "";
  const id = typeof parsed?.body.id === "string" ? parsed.body.id.slice(0, 64) : "";
  const view = typeof parsed?.body.view === "string" && /^[a-z0-9]{1,12}$/.test(parsed.body.view) ? parsed.body.view : "review";
  if (!store || !id) return redirectTo(request, "/season/admin/challenge", { view, done: "failed" });

  try {
    if (action in RESULT_ACTIONS) await store.setResultStatus(id, RESULT_ACTIONS[action]);
    else if (action === "hide" || action === "show") await store.updateParticipant(id, { hidden: action === "hide" });
    else if (action === "eligible" || action === "ineligible") await store.updateParticipant(id, { prizeEligible: action === "eligible" });
    else return redirectTo(request, "/season/admin/challenge", { view, done: "failed" });
    return redirectTo(request, "/season/admin/challenge", { view, done: action }, `row-${id}`);
  } catch (error) {
    console.error("challenge admin action failed", error instanceof Error ? error.message : "UnknownError");
    return redirectTo(request, "/season/admin/challenge", { view, done: "failed" });
  }
}
