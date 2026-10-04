/** Every message a challenge form can show, keyed by the code the API returns or puts in the URL. */
export const joinFeedback = {
  sent: "Check your inbox. Confirm with the link I just sent and you're in.",
  invalid_email: "That email doesn't look right. Check it and try again.",
  invalid_name: "Pick a display name of 2 to 24 letters or numbers.",
  blocked_name: "Pick a different display name.",
  name_taken: "That display name is taken. Pick another one.",
  invalid_country: "Pick your country.",
  consent: "Tick both boxes to join: you're 18 or over, and you accept the rules.",
  closed: "Signups for Season 1 are closed. Follow along for Season 2.",
  limited: "Too many attempts. Try again later.",
  unavailable: "The challenge is not open yet. Check back soon.",
  failed: "Something went wrong. Try again in a moment.",
  expired: "That link has expired or is broken. Sign up again for a fresh one.",
  deleted: "Done. Your name, email and runs are deleted.",
} as const;
export type JoinFeedbackCode = keyof typeof joinFeedback;

export const resultFeedback = {
  saved: "Run logged. It shows on the board as self-reported until it's checked.",
  flagged: "Run logged. It's a big jump, so it's held for a quick review before it ranks.",
  closed: "No retest window is open right now.",
  invalid_time: "Enter your time as minutes and seconds, for example 26:45.",
  invalid_proof: "Paste a public https link to the run, ideally the Strava activity.",
  limited: "Too many attempts. Try again later.",
  failed: "Something went wrong. Try again in a moment.",
} as const;
export type ResultFeedbackCode = keyof typeof resultFeedback;

export function pickFeedback<T extends Record<string, string>>(table: T, code: unknown): { code: keyof T; message: string } | undefined {
  return typeof code === "string" && Object.hasOwn(table, code) ? { code: code as keyof T, message: table[code] } : undefined;
}
