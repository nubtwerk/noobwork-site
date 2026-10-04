import { challenge, isChallengeVisible } from "@/data/challenge";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isCrossSite } from "@/lib/request-guards";
import { sendJoinConfirmation, sendRunnerLink } from "@/lib/challenge/email";
import { challengeNow, isChallengeDemo } from "@/lib/challenge/env";
import { joinFeedback, type JoinFeedbackCode } from "@/lib/challenge/feedback";
import { isNativeForm, json, readSmallBody, redirectTo, ticked } from "@/lib/challenge/http";
import { getChallengeStore } from "@/lib/challenge/store";
import { createJoinToken, createRunnerToken } from "@/lib/challenge/tokens";
import { normalizeCountry, normalizeEmail, parseDisplayName } from "@/lib/challenge/validate";

export const runtime = "nodejs";
export const maxDuration = 10;

const STATUS: Record<JoinFeedbackCode, number> = {
  sent: 200, invalid_email: 400, invalid_name: 400, blocked_name: 400, name_taken: 409, invalid_country: 400,
  consent: 400, closed: 410, limited: 429, unavailable: 503, failed: 502, expired: 400, deleted: 200,
};

export async function POST(request: Request) {
  const nativeForm = isNativeForm(request);
  function respond(code: JoinFeedbackCode, previewLink?: string) {
    if (nativeForm) return redirectTo(request, "/season", { challenge: code }, "challenge");
    return json(STATUS[code], code === "sent" ? { ok: true, ...(previewLink ? { previewLink } : {}) } : { error: joinFeedback[code], code });
  }

  if (isCrossSite(request)) return json(403, { error: "Invalid request origin." });
  const store = getChallengeStore();
  if (!isChallengeVisible() || !store) return respond("unavailable");
  const parsed = await readSmallBody(request);
  if (!parsed) return respond("failed");
  const { body } = parsed;

  if (!rateLimit(`challenge-join:${clientKey(request)}`).allowed) return respond("limited");
  // Bots fill the hidden field; pretend it worked and send nothing.
  if (typeof body.website === "string" && body.website.trim()) return respond("sent");
  // Late joiners have no baseline to improve on, so signups close with the baseline window.
  if (!isChallengeDemo() && challengeNow() > Date.parse(challenge.windows[0].closesAt)) return respond("closed");

  const email = normalizeEmail(body.email);
  if (!email) return respond("invalid_email");
  const name = parseDisplayName(body.name);
  if (!name.ok) return respond(name.reason === "blocked" ? "blocked_name" : "invalid_name");
  const country = normalizeCountry(body.country);
  if (!country) return respond("invalid_country");
  if (!ticked(body.adult) || !ticked(body.rules)) return respond("consent");
  // Stops the form being used to flood one inbox.
  if (!rateLimit(`challenge-join-email:${email}`, { limit: 3, windowMs: 24 * 60 * 60 * 1000 }).allowed) return respond("limited");

  const origin = new URL(request.url).origin;
  try {
    const existing = await store.findParticipantByEmail(email);
    if (existing) {
      // Already in: resend their personal link. The response is the same either way,
      // so the form never reveals whether an email has joined.
      const link = `${origin}/season/challenge/me?t=${encodeURIComponent(createRunnerToken(existing.id))}`;
      await sendRunnerLink(email, existing.displayName, link);
      return respond("sent", isChallengeDemo() ? link : undefined);
    }
    if (await store.isNameTaken(name.name)) return respond("name_taken");
    const token = createJoinToken({ email, name: name.name, country, newsletter: ticked(body.newsletter) });
    const link = `${origin}/season/challenge/confirm?t=${encodeURIComponent(token)}`;
    await sendJoinConfirmation(email, link);
    return respond("sent", isChallengeDemo() ? link : undefined);
  } catch (error) {
    if (error instanceof Error && error.message === "CHALLENGE_NOT_CONFIGURED") return respond("unavailable");
    console.error("challenge join failed", error instanceof Error ? error.message : "UnknownError");
    return respond("failed");
  }
}
