import { isCrossSite } from "@/lib/request-guards";
import { readSmallBody, redirectTo, ticked } from "@/lib/challenge/http";
import { getChallengeStore } from "@/lib/challenge/store";
import { verifyRunnerToken } from "@/lib/challenge/tokens";

export const runtime = "nodejs";

/** A runner deletes themselves and every run, from their personal page. */
export async function POST(request: Request) {
  if (isCrossSite(request)) return redirectTo(request, "/season", { challenge: "failed" }, "challenge");
  const store = getChallengeStore();
  const parsed = await readSmallBody(request);
  const token = typeof parsed?.body.t === "string" ? parsed.body.t : "";
  const participantId = verifyRunnerToken(token);
  if (!store || !participantId) return redirectTo(request, "/season", { challenge: "expired" }, "challenge");
  if (!ticked(parsed?.body.confirm)) return redirectTo(request, "/season/challenge/me", { t: token, delete: "confirm" }, "delete");
  try {
    const participant = await store.getParticipant(participantId);
    // Joachim's own row is managed from the admin page, not deleted from a link.
    if (participant && !participant.isHost) await store.deleteParticipant(participantId);
    return redirectTo(request, "/season", { challenge: "deleted" }, "challenge");
  } catch (error) {
    console.error("challenge delete failed", error instanceof Error ? error.message : "UnknownError");
    return redirectTo(request, "/season/challenge/me", { t: token, delete: "failed" }, "delete");
  }
}
