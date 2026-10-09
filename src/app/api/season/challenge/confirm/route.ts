import { isChallengeVisible } from "@/data/challenge";
import { isCrossSite } from "@/lib/request-guards";
import { sendRunnerLink } from "@/lib/challenge/email";
import { readSmallBody, redirectTo } from "@/lib/challenge/http";
import { ChallengeConflict, getChallengeStore } from "@/lib/challenge/store";
import { createRunnerToken, verifyJoinToken } from "@/lib/challenge/tokens";

export const runtime = "nodejs";
export const maxDuration = 10;

/** The button on /season/challenge/confirm. A POST, so mail scanners that open links can't join anyone. */
export async function POST(request: Request) {
  if (isCrossSite(request)) return redirectTo(request, "/season", { challenge: "failed" }, "challenge");
  const store = getChallengeStore();
  if (!isChallengeVisible() || !store) return redirectTo(request, "/season", { challenge: "unavailable" }, "challenge");
  const parsed = await readSmallBody(request);
  const claims = verifyJoinToken(parsed?.body.t);
  if (!claims) return redirectTo(request, "/season", { challenge: "expired" }, "challenge");

  try {
    let participant = await store.findParticipantByEmail(claims.email);
    if (!participant) {
      try {
        participant = await store.createParticipant({ email: claims.email, displayName: claims.name, country: claims.country, newsletter: claims.newsletter });
      } catch (error) {
        if (error instanceof ChallengeConflict && error.field === "name") return redirectTo(request, "/season", { challenge: "name_taken" }, "challenge");
        if (!(error instanceof ChallengeConflict)) throw error;
        // Confirmed twice at once: the other request created the runner.
        participant = await store.findParticipantByEmail(claims.email);
        if (!participant) throw error;
      }
      const token = createRunnerToken(participant.id);
      try {
        await sendRunnerLink(participant.email, participant.displayName, `${new URL(request.url).origin}/season/challenge/me?t=${encodeURIComponent(token)}`);
      } catch (error) {
        // They land on their page with the link anyway; a lost email is not worth failing the join.
        console.error("challenge runner link email failed", error instanceof Error ? error.message : "UnknownError");
      }
      return redirectTo(request, "/season/challenge/me", { t: token, welcome: "1" });
    }
    return redirectTo(request, "/season/challenge/me", { t: createRunnerToken(participant.id) });
  } catch (error) {
    console.error("challenge confirm failed", error instanceof Error ? error.message : "UnknownError");
    return redirectTo(request, "/season", { challenge: "failed" }, "challenge");
  }
}
