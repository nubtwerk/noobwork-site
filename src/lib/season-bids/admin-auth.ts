import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "season_admin";
const SESSION_SECONDS = 12 * 60 * 60;

function key(): string | null {
  const password = process.env.SEASON_ADMIN_PASSWORD;
  // A short password is treated as unset, so a placeholder never opens the admin.
  return password && password.length >= 12 ? `season-admin:${password}` : null;
}

const sign = (secret: string, value: string) => createHmac("sha256", secret).update(value).digest("hex");

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function adminConfigured(): boolean {
  return key() !== null;
}

export function checkPassword(candidate: unknown): boolean {
  const secret = key();
  if (!secret || typeof candidate !== "string") return false;
  // Compare HMACs so length differences leak nothing.
  return safeEqual(sign(secret, candidate), sign(secret, process.env.SEASON_ADMIN_PASSWORD as string));
}

export function createSession(now = Date.now()): { value: string; maxAge: number } {
  const secret = key();
  if (!secret) throw new Error("ADMIN_NOT_CONFIGURED");
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return { value: `${expires}.${sign(secret, `session:${expires}`)}`, maxAge: SESSION_SECONDS };
}

export function verifySession(value: string | undefined, now = Date.now()): boolean {
  const secret = key();
  if (!secret || !value) return false;
  const [expires, mac] = value.split(".");
  if (!expires || !mac || !/^\d+$/.test(expires) || Number(expires) * 1000 < now) return false;
  return safeEqual(mac, sign(secret, `session:${expires}`));
}
