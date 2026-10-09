import { createHmac, timingSafeEqual } from "node:crypto";
import { isChallengeDemo } from "./env";

/**
 * Signed links for the challenge, so no passwords and nothing stored before a
 * runner confirms their email.
 *
 * - "join": the signup itself (email, name, country, newsletter tick), valid 7 days.
 *   Nothing is written to the database until the link is confirmed.
 * - "me": a runner's personal link to log results. No expiry; deleting the
 *   runner makes it useless.
 */
export const JOIN_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PREVIEW_KEY = "challenge-preview-only";

export type JoinClaims = { email: string; name: string; country: string; newsletter: boolean };

function signingKey(): string | undefined {
  const explicit = process.env.CHALLENGE_SECRET?.trim();
  if (explicit) return explicit.length >= 32 ? `challenge:${explicit}` : undefined;
  // Public preview tokens are accepted only with synthetic data outside production.
  return isChallengeDemo() ? PREVIEW_KEY : undefined;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function seal(kind: string, data: unknown): string {
  const key = signingKey();
  if (!key) throw new Error("CHALLENGE_NOT_CONFIGURED");
  const payload = `${kind}.${Buffer.from(JSON.stringify(data)).toString("base64url")}`;
  return `${payload}.${sign(payload, key)}`;
}

function open(kind: string, token: unknown): unknown {
  const key = signingKey();
  if (!key || typeof token !== "string" || token.length > 1200) return undefined;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== kind) return undefined;
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`, key));
  const given = Buffer.from(parts[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return undefined;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return undefined;
  }
}

export function createJoinToken(claims: JoinClaims, now = Date.now()): string {
  return seal("join", { ...claims, iat: now });
}

export function verifyJoinToken(token: unknown, now = Date.now()): JoinClaims | undefined {
  const data = open("join", token) as (JoinClaims & { iat?: number }) | undefined;
  if (!data || typeof data.iat !== "number" || data.iat > now + 60_000 || now - data.iat > JOIN_TOKEN_TTL_MS) return undefined;
  if (typeof data.email !== "string" || typeof data.name !== "string" || typeof data.country !== "string") return undefined;
  return { email: data.email, name: data.name, country: data.country, newsletter: data.newsletter === true };
}

export function createRunnerToken(participantId: string): string {
  return seal("me", { id: participantId });
}

export function verifyRunnerToken(token: unknown): string | undefined {
  const data = open("me", token) as { id?: unknown } | undefined;
  return data && typeof data.id === "string" ? data.id : undefined;
}

/** Admin session cookie: a keyed hash of the admin password, so changing the password logs everyone out. */
export function adminSessionValue(password: string): string | undefined {
  const key = signingKey();
  return key ? sign(`admin:${password}`, key) : undefined;
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
