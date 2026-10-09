import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * "Follow the season" email list, double opt-in, with no database.
 *
 * 1. A visitor submits an email. We send a confirmation link carrying a signed,
 *    expiring token (the email plus issue time, HMAC-signed).
 * 2. The link opens /follow/confirm, where one button press verifies the token
 *    and opts the email into the configured Season segment and topic.
 *    The button step stops mail scanners that prefetch links from confirming.
 *
 * Nobody is added to the list until they confirm, and the list itself lives in
 * Resend, where it can be exported or emailed with Broadcasts.
 */

export const FOLLOW_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const followFeedback = {
  sent: "Check your inbox. Confirm with the link I just sent and you're on the list.",
  confirmed: "You're on the list. You'll get every retest as it lands.",
  unsubscribed: "You previously unsubscribed from all emails. Your preference is unchanged; contact Noobwork to update it.",
  invalid: "That email doesn't look right. Check it and try again.",
  expired: "That confirmation link has expired or is broken. Sign up again for a fresh one.",
  limited: "Too many attempts. Try again later.",
  unavailable: "Signups are not open yet. Check back soon.",
  failed: "Something went wrong. Try again in a moment.",
} as const;
export type FollowFeedbackCode = keyof typeof followFeedback;

export function getFollowFeedback(code: unknown): { code: FollowFeedbackCode; message: string } | undefined {
  return typeof code === "string" && Object.hasOwn(followFeedback, code)
    ? { code: code as FollowFeedbackCode, message: followFeedback[code as FollowFeedbackCode] }
    : undefined;
}

export function normalizeFollowEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : undefined;
}

function signingKey(): string | undefined {
  const explicit = process.env.SEASON_FOLLOW_SECRET;
  if (explicit) return explicit;
  // Fall back to a key derived from the Resend key so no extra setup is needed.
  const resend = process.env.RESEND_API_KEY;
  return resend ? `season-follow:${resend}` : undefined;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createFollowToken(email: string, now = Date.now()): string {
  const key = signingKey();
  if (!key) throw new Error("FOLLOW_NOT_CONFIGURED");
  const payload = `${Buffer.from(email).toString("base64url")}.${now.toString(36)}`;
  return `${payload}.${sign(payload, key)}`;
}

/** Returns the confirmed email, or undefined for a forged, malformed or expired token. */
export function verifyFollowToken(token: unknown, now = Date.now()): string | undefined {
  const key = signingKey();
  if (!key || typeof token !== "string" || token.length > 600) return undefined;
  const parts = token.split(".");
  if (parts.length !== 3) return undefined;
  const [encodedEmail, issued, signature] = parts;
  const expected = Buffer.from(sign(`${encodedEmail}.${issued}`, key));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return undefined;
  const issuedAt = parseInt(issued, 36);
  if (!Number.isFinite(issuedAt) || issuedAt > now + 60_000 || now - issuedAt > FOLLOW_TOKEN_TTL_MS) return undefined;
  return normalizeFollowEmail(Buffer.from(encodedEmail, "base64url").toString("utf8"));
}

function isStub(): boolean {
  return process.env.CONTACT_EMAIL_MODE === "stub";
}

function resendKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("FOLLOW_NOT_CONFIGURED");
  return key;
}

async function resend(path: string, method: string, body?: unknown, signal = AbortSignal.timeout(8_000)): Promise<Response> {
  return fetch(`https://api.resend.com${path}`, {
    method,
    signal,
    headers: { Authorization: `Bearer ${resendKey()}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function sendFollowConfirmation(email: string, siteOrigin: string): Promise<void> {
  if (isStub()) return;
  seasonAudience();
  const token = createFollowToken(email);
  const link = `${siteOrigin}/follow/confirm?t=${encodeURIComponent(token)}`;
  const from = process.env.SEASON_FROM_EMAIL?.trim() || (process.env.CONTACT_FROM_EMAIL ?? "Noobwork <onboarding@resend.dev>");
  const text = [
    "Confirm you want Season 1 updates from Noobwork:",
    "",
    link,
    "",
    "One email per retest, plus the big moments. Unsubscribe any time.",
    "If you didn't ask for this, ignore this email and nothing happens.",
    "",
    "Joachim",
  ].join("\n");
  const res = await resend("/emails", "POST", { from, to: [email], subject: "Confirm: follow Season 1", text });
  if (!res.ok) throw new Error(`RESEND_FAILED:${res.status}`);
}

function seasonAudience(): { segment: string; topic: string } {
  const segment = process.env.RESEND_SEASON_SEGMENT_ID?.trim();
  const topic = process.env.RESEND_SEASON_TOPIC_ID?.trim();
  if (!segment || !topic) throw new Error("FOLLOW_NOT_CONFIGURED");
  return { segment, topic };
}

/** Season consent never restores global eligibility or changes existing unrelated preferences. */
export async function addFollower(email: string): Promise<void> {
  if (isStub()) return;
  const { segment, topic } = seasonAudience();
  // One deadline covers the whole provider operation, within the route's limit.
  const signal = AbortSignal.timeout(8_000);
  const id = encodeURIComponent(email);
  const path = `/contacts/${id}`;

  async function existingContact(response: Response): Promise<void> {
    if (!response.ok) throw new Error(`RESEND_FAILED:${response.status}`);
    const contact = await response.json();
    if (typeof contact.unsubscribed !== "boolean") throw new Error("RESEND_INVALID_CONTACT");
    if (contact.unsubscribed) throw new Error("FOLLOW_GLOBAL_UNSUBSCRIBED");
    // Link first: a failed segment write must not enable a topic subscription.
    const linked = await resend(`${path}/segments/${encodeURIComponent(segment)}`, "POST", undefined, signal);
    if (!linked.ok && linked.status !== 409) throw new Error(`RESEND_FAILED:${linked.status}`);
    const updated = await resend(`${path}/topics`, "PATCH", [{ id: topic, subscription: "opt_in" }], signal);
    if (!updated.ok) throw new Error(`RESEND_FAILED:${updated.status}`);
  }

  const existing = await resend(path, "GET", undefined, signal);
  if (existing.status !== 404) return existingContact(existing);

  // New contacts inherit topic defaults. Require unrelated topics to default
  // to opt-out, and never submit unrelated preferences even during a create race.
  const catalogResponse = await resend("/topics", "GET", undefined, signal);
  if (!catalogResponse.ok) throw new Error(`RESEND_FAILED:${catalogResponse.status}`);
  const catalog = await catalogResponse.json();
  if (catalog.has_more !== false || !Array.isArray(catalog.data) ||
      !catalog.data.every((entry: { id?: unknown }) => entry && typeof entry.id === "string" && entry.id.length > 0) ||
      !catalog.data.some((entry: { id: string }) => entry.id === topic) ||
      !catalog.data.every((entry: { id: string; default_subscription?: unknown }) =>
        entry.id === topic || entry.default_subscription === "opt_out")) {
    throw new Error("FOLLOW_NOT_CONFIGURED");
  }
  const created = await resend("/contacts", "POST", {
    email,
    segments: [{ id: segment }],
    topics: [{ id: topic, subscription: "opt_in" }],
  }, signal);
  if (created.ok) return;
  // A concurrent confirmation can create it between GET and POST. Verify it;
  // never interpret an arbitrary validation failure as consent to resubscribe.
  if (created.status === 409) return existingContact(await resend(path, "GET", undefined, signal));
  throw new Error(`RESEND_FAILED:${created.status}`);
}
