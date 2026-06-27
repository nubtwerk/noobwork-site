export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseContactPayload(body: unknown):
  | { data: ContactPayload }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request." };
  }

  const raw = body as Record<string, unknown>;

  // Honeypot — bots fill hidden fields; humans never see this input.
  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return { data: { name: "spam", email: "spam@example.com", message: "spam" } };
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const company =
    typeof raw.company === "string" ? raw.company.trim() : undefined;
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  if (name.length < 2) return { error: "Please enter your name." };
  if (!EMAIL_PATTERN.test(email)) return { error: "Please enter a valid email." };
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
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
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
    const detail = await res.text().catch(() => "");
    throw new Error(`RESEND_FAILED:${res.status}:${detail}`);
  }
}
