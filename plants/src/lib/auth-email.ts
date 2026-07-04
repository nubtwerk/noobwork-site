import { createMagicLinkToken, getAdminEmail, getAppUrl } from "@/lib/auth";

export async function sendMagicLinkEmail(email: string, nextPath = "/"): Promise<string> {
  const token = await createMagicLinkToken(email);
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  const loginUrl = `${getAppUrl()}/api/auth/callback?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext)}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.PLANTS_DEV_LOGIN === "true" && process.env.NODE_ENV !== "production") {
      console.info("[plants auth] Dev login link:", loginUrl);
      return loginUrl;
    }
    throw new Error("AUTH_EMAIL_NOT_CONFIGURED");
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Plants · Noobwork <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [getAdminEmail()],
      subject: "Sign in to Plants · noobwork",
      text: [
        "Use this link to sign in to your plant dashboard.",
        "It expires in 15 minutes.",
        "",
        loginUrl,
        "",
        "If you did not request this, you can ignore this email.",
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`RESEND_FAILED:${res.status}:${detail}`);
  }

  return loginUrl;
}
