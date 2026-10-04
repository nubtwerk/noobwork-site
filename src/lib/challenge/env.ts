/** True when a real database is configured; otherwise non-production builds use the demo store. */
export function hasChallengeDatabase(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Demo mode: no database, outside production. Seeded data, no emails, a fixed clock. */
export function isChallengeDemo(): boolean {
  return !hasChallengeDatabase() && process.env.VERCEL_ENV !== "production";
}

/** The demo clock sits inside the first retest window so every flow can be tried on a preview. */
export const DEMO_NOW = Date.parse("2027-04-05T12:00:00+09:00");

export function challengeNow(): number {
  return isChallengeDemo() ? DEMO_NOW : Date.now();
}
