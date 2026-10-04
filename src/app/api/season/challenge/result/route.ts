import { isChallengeVisible, openChallengeWindow } from "@/data/challenge";
import { rateLimit } from "@/lib/rate-limit";
import { isCrossSite } from "@/lib/request-guards";
import { challengeNow } from "@/lib/challenge/env";
import type { ResultFeedbackCode } from "@/lib/challenge/feedback";
import { readSmallBody, redirectTo } from "@/lib/challenge/http";
import { assessSubmission } from "@/lib/challenge/leaderboard";
import { getChallengeStore } from "@/lib/challenge/store";
import { verifyRunnerToken } from "@/lib/challenge/tokens";
import { parseProofUrl, parseRunTime } from "@/lib/challenge/validate";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: Request) {
  if (isCrossSite(request)) return redirectTo(request, "/season", { challenge: "failed" }, "challenge");
  const store = getChallengeStore();
  if (!isChallengeVisible() || !store) return redirectTo(request, "/season", { challenge: "unavailable" }, "challenge");
  const parsed = await readSmallBody(request);
  const token = typeof parsed?.body.t === "string" ? parsed.body.t : "";
  const participantId = verifyRunnerToken(token);
  if (!participantId) return redirectTo(request, "/season", { challenge: "expired" }, "challenge");
  const back = (code: ResultFeedbackCode) => redirectTo(request, "/season/challenge/me", { t: token, result: code }, "log");

  try {
    const participant = await store.getParticipant(participantId);
    if (!participant) return redirectTo(request, "/season", { challenge: "expired" }, "challenge");
    if (!rateLimit(`challenge-result:${participantId}`, { limit: 10 }).allowed) return back("limited");
    const window = openChallengeWindow(challengeNow());
    if (!window) return back("closed");
    const timeSeconds = parseRunTime(parsed?.body.time);
    if (timeSeconds === undefined) return back("invalid_time");
    const proof = parseProofUrl(parsed?.body.proof);
    if (!proof) return back("invalid_proof");

    const earlier = (await store.listResults()).filter((r) => r.participantId === participantId);
    const status = assessSubmission(earlier, window.id, timeSeconds);
    await store.saveResult({ participantId, windowId: window.id, timeSeconds, proofUrl: proof.url, proofKind: proof.kind, status });
    return back(status === "flagged" ? "flagged" : "saved");
  } catch (error) {
    console.error("challenge result failed", error instanceof Error ? error.message : "UnknownError");
    return back("failed");
  }
}
