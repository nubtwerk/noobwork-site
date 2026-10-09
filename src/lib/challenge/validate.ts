import { challenge } from "@/data/challenge";

/** ISO 3166-1 alpha-2 codes offered in the country picker. */
export const COUNTRY_CODES = (
  "AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ " +
  "DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FO FR GA GB GD GE GH GL GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT " +
  "JM JO JP KE KG KH KI KM KN KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ " +
  "NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PR PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ " +
  "TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW"
).split(" ");

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Countries sorted by English name, for the picker. */
export const COUNTRY_OPTIONS = COUNTRY_CODES.map((code) => ({ code, name: countryName(code) })).sort((a, b) =>
  a.name.localeCompare(b.name, "en"),
);

export function countryFlag(code: string): string {
  if (code === "XK") return "🇽🇰";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function normalizeCountry(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.trim().toUpperCase();
  return COUNTRY_CODES.includes(code) ? code : undefined;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : undefined;
}

// Kept short on purpose: it catches the obvious, and Joachim can hide any name from the admin page.
const BLOCKED_FRAGMENTS = ["fuck", "shit", "cunt", "nigg", "fag", "rape", "nazi", "hitler", "whore", "slut", "porn", "noobwork"];

export type DisplayNameResult = { ok: true; name: string } | { ok: false; reason: "invalid" | "blocked" };

/** Public name on the board: 2 to 24 letters, digits, spaces, dots, dashes or underscores. */
export function parseDisplayName(value: unknown): DisplayNameResult {
  if (typeof value !== "string") return { ok: false, reason: "invalid" };
  const name = value.normalize("NFC").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 24 || !/^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u.test(name)) {
    return { ok: false, reason: "invalid" };
  }
  const folded = name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s");
  if (BLOCKED_FRAGMENTS.some((word) => folded.includes(word))) return { ok: false, reason: "blocked" };
  return { ok: true, name };
}

/** Case-insensitive key that keeps two runners from sharing a name. */
export function displayNameKey(name: string): string {
  return name.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Parses "24:31", "24.31" or "1:02:10" into seconds within the accepted range. */
export function parseRunTime(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const parts = value.trim().replace(/[.,]/g, ":").split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d{1,3}$/.test(p))) return undefined;
  const nums = parts.map(Number);
  const [h, m, s] = nums.length === 3 ? nums : [0, nums[0], nums[1]];
  if (s >= 60 || (nums.length === 3 && m >= 60)) return undefined;
  const total = h * 3600 + m * 60 + s;
  return total >= 10 * 60 && total <= challenge.slowestAcceptedSeconds ? total : undefined;
}

export function formatRunTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export type ProofKind = "strava" | "other";

/** A public link to the run. Strava activities are prize-eligible; other links (a treadmill photo) are board-only. */
export function parseProofUrl(value: unknown): { url: string; kind: ProofKind } | undefined {
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  if (raw.length > 300) return undefined;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" || url.username || url.password) return undefined;
  const host = url.hostname.toLowerCase();
  if ((host === "www.strava.com" || host === "strava.com") && /^\/activities\/\d+\/?$/.test(url.pathname)) {
    return { url: `https://www.strava.com${url.pathname.replace(/\/$/, "")}`, kind: "strava" };
  }
  if (host === "strava.app.link") return { url: url.toString(), kind: "strava" };
  return { url: url.toString(), kind: "other" };
}
