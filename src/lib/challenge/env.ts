import { isProductionRuntime } from "@/lib/runtime-env";

/**
 * The challenge shares the dedicated Season database with sponsor bidding and uses the
 * same settings (see docs/season-database-separation.md on the bidding branch).
 */
const SEASON_DB_VARS = ["SEASON_SUPABASE_URL", "SEASON_SUPABASE_KEY", "SEASON_SUPABASE_PROJECT_REF", "SEASON_DB_SECRET"] as const;

/** The fitness project being retired: never send Season data there. */
const RETIRED_PROJECT_REF = "mudmzagbhjriswjdzzcq";

export type SeasonDatabaseConfig = { url: string; key: string; secret: string };

/** True when any Season database setting is present. Demo mode is then off, even if the settings are wrong. */
export function hasChallengeDatabase(): boolean {
  return SEASON_DB_VARS.some((name) => Boolean(process.env[name]?.trim()));
}

/**
 * The complete, valid Season database settings, or null. Same rules as bidding: a
 * 20-letter project ref that matches the URL, a publishable key, a 32+ character secret.
 */
export function seasonDatabaseConfig(): SeasonDatabaseConfig | null {
  const url = process.env.SEASON_SUPABASE_URL?.trim();
  const key = process.env.SEASON_SUPABASE_KEY?.trim();
  const ref = process.env.SEASON_SUPABASE_PROJECT_REF?.trim();
  const secret = process.env.SEASON_DB_SECRET?.trim();
  if (!url || !key || !ref || !secret || secret.length < 32) return null;
  if (!/^[a-z]{20}$/.test(ref) || ref === RETIRED_PROJECT_REF || !key.startsWith("sb_publishable_")) return null;
  try {
    const parsed = new URL(url);
    if (parsed.origin !== `https://${ref}.supabase.co` || parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.username || parsed.password) {
      return null;
    }
  } catch {
    return null;
  }
  return { url: `https://${ref}.supabase.co`, key, secret };
}

/** Demo mode: no database, outside production. Seeded data, no emails, a fixed clock. */
export function isChallengeDemo(): boolean {
  return !hasChallengeDatabase() && !isProductionRuntime();
}

/** The demo clock sits inside the first retest window so every flow can be tried on a preview. */
export const DEMO_NOW = Date.parse("2027-04-05T12:00:00+09:00");

export function challengeNow(): number {
  return isChallengeDemo() ? DEMO_NOW : Date.now();
}
