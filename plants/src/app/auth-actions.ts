"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/auth-email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestLoginAction(formData: FormData, nextPath: string) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!isAdminEmail(email)) {
    return {
      message:
        "If that address is allowed, you'll receive a sign-in link shortly.",
    };
  }

  try {
    const devLink = await sendMagicLinkEmail(email, nextPath);
    const result: { message: string; devLink?: string } = {
      message: "Check your email for a sign-in link (valid 15 minutes).",
    };
    if (
      process.env.PLANTS_DEV_LOGIN === "true" &&
      process.env.NODE_ENV !== "production" &&
      !process.env.RESEND_API_KEY
    ) {
      result.devLink = devLink;
    }
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "AUTH_EMAIL_NOT_CONFIGURED") {
      return {
        error:
          "Email sign-in is not configured. Set RESEND_API_KEY or PLANTS_DEV_LOGIN=true for local dev.",
      };
    }
    return { error: "Could not send sign-in email. Try again later." };
  }
}

export async function logoutAction() {
  redirect("/api/auth/logout");
}
