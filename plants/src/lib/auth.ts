import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "plants_session";

const MAGIC_PURPOSE = "magic-login";

function authSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set (min 32 chars) in production");
    }
    return new TextEncoder().encode("dev-only-plants-auth-secret-32ch");
  }
  return new TextEncoder().encode(raw);
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "joachim@noobwork.no").trim().toLowerCase();
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === getAdminEmail();
}

export async function createMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), purpose: MAGIC_PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(authSecret());
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(authSecret());
}

export async function verifyMagicLinkToken(
  token: string,
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (payload.purpose !== MAGIC_PURPOSE) return null;
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!isAdminEmail(email)) return null;
    return { email: email.toLowerCase() };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ email: string } | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;

  try {
    const { payload } = await jwtVerify(value, authSecret());
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!isAdminEmail(email)) return null;
    return { email: email.toLowerCase() };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function canEdit(): Promise<boolean> {
  return (await getSession()) !== null;
}
