import { isPartnershipOffer, partnershipOffers, type PartnershipOfferId } from "@/data/partnerships";

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
  offer?: PartnershipOfferId;
  timing?: string;
  budget?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ParseContactResult =
  | { data: ContactPayload }
  | { honeypot: true }
  | { error: string };

export function parseContactPayload(body: unknown): ParseContactResult {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request." };
  }

  const raw = body as Record<string, unknown>;

  // Honeypot — bots fill hidden fields; humans never see this input. Signalled
  // out-of-band so a real visitor's field values (e.g. someone named "spam")
  // can never be mistaken for a bot.
  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return { honeypot: true };
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const company =
    typeof raw.company === "string" ? raw.company.trim() : undefined;
  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  const offer = typeof raw.offer === "string" ? raw.offer.trim() : "";
  const timing = typeof raw.timing === "string" ? raw.timing.trim() : "";
  const budget = typeof raw.budget === "string" ? raw.budget.trim() : "";

  if (name.length < 2) return { error: "Please enter your name." };
  if (name.length > 120 || /[\r\n]/.test(name)) return { error: "Please keep your name to one line and under 120 characters." };
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return { error: "Please enter a valid email." };
  if (company && (company.length > 160 || /[\r\n]/.test(company))) return { error: "Please keep the brand name to one line and under 160 characters." };
  if (offer && !isPartnershipOffer(offer)) return { error: "Please choose one of the partnership formats." };
  if (timing.length > 120 || budget.length > 120) return { error: "Please keep timing and budget details under 120 characters each." };
  if (message.length < 20) {
    return { error: "Please share a bit more detail about the partnership." };
  }
  if (message.length > 5000) {
    return { error: "Message is too long. Keep it under 5,000 characters." };
  }

  return {
    data: {
      name,
      email,
      company: company || undefined,
      message,
      offer: isPartnershipOffer(offer) ? offer : undefined,
      timing: timing || undefined,
      budget: budget || undefined,
    },
  };
}

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("CONTACT_NOT_CONFIGURED");
  }

  const to = process.env.CONTACT_TO_EMAIL ?? "joachim@noobwork.no";
  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Noobwork Media Kit <onboarding@resend.dev>";

  const subject = payload.company
    ? `Partnership inquiry — ${payload.company} (${payload.name})`
    : `Partnership inquiry from ${payload.name}`;

  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.company ? `Company: ${payload.company}` : null,
    payload.offer ? `Format: ${partnershipOffers.find((offer) => offer.id === payload.offer)?.title}` : null,
    payload.timing ? `Timing: ${payload.timing}` : null,
    payload.budget ? `Budget: ${payload.budget}` : null,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error(`RESEND_FAILED:${res.status}`);
  }
}
