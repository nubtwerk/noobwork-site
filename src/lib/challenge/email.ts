import { challenge } from "@/data/challenge";
import { isChallengeDemo } from "./env";

/** Emails are skipped in demo mode (the page shows the link instead) and in stub mode for tests. */
export function challengeEmailsEnabled(): boolean {
  return !isChallengeDemo() && process.env.CONTACT_EMAIL_MODE !== "stub";
}

async function send(to: string, subject: string, text: string): Promise<void> {
  if (!challengeEmailsEnabled()) return;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("CHALLENGE_NOT_CONFIGURED");
  const from = process.env.SEASON_FROM_EMAIL ?? process.env.CONTACT_FROM_EMAIL ?? "Noobwork <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) throw new Error(`RESEND_FAILED:${res.status}`);
}

export function sendJoinConfirmation(email: string, confirmLink: string): Promise<void> {
  return send(
    email,
    `Confirm: join ${challenge.name}`,
    [
      `Confirm you want to join ${challenge.name}, the Season 1 ${challenge.test} challenge:`,
      "",
      confirmLink,
      "",
      "If you didn't ask for this, ignore this email and nothing happens.",
      "",
      "Joachim",
    ].join("\n"),
  );
}

export function sendRunnerLink(email: string, displayName: string, runnerLink: string): Promise<void> {
  return send(
    email,
    `Your ${challenge.name} link`,
    [
      `You're in, ${displayName}.`,
      "",
      "This is your personal link. Use it to log each run. Keep it to yourself, it works like a password:",
      "",
      runnerLink,
      "",
      "Baseline run: 1 to 14 January 2027. Then again in April, July, October and January 2028.",
      "Run 5 km, upload it to Strava as a public activity, and paste the link.",
      "",
      "Joachim",
    ].join("\n"),
  );
}
