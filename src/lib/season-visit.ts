/**
 * Brand link alerts for /season.
 *
 * Joachim sends each brand its own link, e.g. noobwork.no/season?ref=aker.
 * When that link is opened in a real browser, he gets an email saying which
 * brand opened it, roughly where from, and on what kind of device. Link
 * previews (Slack, iMessage, mail scanners) don't run JavaScript, so they
 * don't trigger an alert.
 */

const REF_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** A brand label: lowercase letters, digits and dashes, up to 40 characters. */
export function parseVisitRef(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const ref = value.trim().toLowerCase();
  return REF_PATTERN.test(ref) ? ref : undefined;
}

const HOST_PATTERN = /^[a-z0-9.-]{1,253}$/;
export function parseReferrerHost(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return HOST_PATTERN.test(host) ? host : undefined;
  } catch {
    return undefined;
  }
}

export interface VisitAlert {
  ref: string;
  country?: string;
  city?: string;
  device: "phone or tablet" | "desktop";
  referrerHost?: string;
  at: Date;
}

export function visitFromRequest(request: Request, ref: string, referrer: unknown, at = new Date()): VisitAlert {
  const country = request.headers.get("x-vercel-ip-country") ?? undefined;
  let city: string | undefined;
  try {
    city = decodeURIComponent(request.headers.get("x-vercel-ip-city") ?? "") || undefined;
  } catch {
    city = undefined;
  }
  const ua = request.headers.get("user-agent") ?? "";
  return {
    ref,
    country: country && /^[A-Z]{2}$/.test(country) ? country : undefined,
    city: city && city.length <= 80 && !/[\r\n]/.test(city) ? city : undefined,
    device: /Mobi|Android|iPhone|iPad/i.test(ua) ? "phone or tablet" : "desktop",
    referrerHost: parseReferrerHost(referrer),
    at,
  };
}

export function formatVisitAlert(visit: VisitAlert): { subject: string; text: string } {
  const where = [visit.city, visit.country].filter(Boolean).join(", ") || "unknown location";
  const seoul = visit.at.toLocaleString("en-GB", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" });
  return {
    subject: `Season link opened: ${visit.ref}`,
    text: [
      `Someone opened your Season 1 link for "${visit.ref}".`,
      "",
      `When: ${seoul} (Seoul)`,
      `Where: ${where}`,
      `Device: ${visit.device}`,
      `Came from: ${visit.referrerHost ?? "direct or email app"}`,
      "",
      "Location is approximate, based on the visitor's network.",
      "You get at most one alert per brand link per visitor every 6 hours.",
    ].join("\n"),
  };
}

export async function sendVisitAlert(visit: VisitAlert): Promise<void> {
  if (process.env.CONTACT_EMAIL_MODE === "stub") return;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("VISIT_ALERTS_NOT_CONFIGURED");
  const to = process.env.CONTACT_TO_EMAIL ?? "joachim@noobwork.no";
  const from = process.env.CONTACT_FROM_EMAIL ?? "Noobwork Site <onboarding@resend.dev>";
  const { subject, text } = formatVisitAlert(visit);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) throw new Error(`RESEND_FAILED:${res.status}`);
}
