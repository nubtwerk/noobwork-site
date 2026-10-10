import { createHmac, timingSafeEqual } from "node:crypto";

/** Soft unlock cookie for the private Season viewer pages (not admin). */
export const PAGE_COOKIE = "season_page";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

function key(): string | null {
  const password = process.env.SEASON_PAGE_PASSWORD;
  // Unset or blank fails closed: the gate stays up and no password can open it.
  return password && password.length > 0 ? `season-page:${password}` : null;
}

const sign = (secret: string, value: string) => createHmac("sha256", secret).update(value).digest("hex");

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function pagePasswordConfigured(): boolean {
  return key() !== null;
}

export function checkPagePassword(candidate: unknown): boolean {
  const secret = key();
  if (!secret || typeof candidate !== "string") return false;
  return safeEqual(sign(secret, candidate), sign(secret, process.env.SEASON_PAGE_PASSWORD as string));
}

export function createPageSession(now = Date.now()): { value: string; maxAge: number } {
  const secret = key();
  if (!secret) throw new Error("PAGE_PASSWORD_NOT_CONFIGURED");
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return { value: `${expires}.${sign(secret, `page:${expires}`)}`, maxAge: SESSION_SECONDS };
}

export function verifyPageSession(value: string | undefined, now = Date.now()): boolean {
  const secret = key();
  if (!secret || !value) return false;
  const [expires, mac] = value.split(".");
  if (!expires || !mac || !/^\d+$/.test(expires) || Number(expires) * 1000 < now) return false;
  return safeEqual(mac, sign(secret, `page:${expires}`));
}

/** Only same-site Season viewer paths (never admin). */
export function safeSeasonReturnPath(candidate: unknown): string {
  if (typeof candidate !== "string") return "/season";
  if (!candidate.startsWith("/season")) return "/season";
  if (candidate.startsWith("/season/admin")) return "/season";
  if (candidate.includes("//") || candidate.includes("\\") || candidate.includes("\n") || candidate.includes("\r")) {
    return "/season";
  }
  return candidate;
}
