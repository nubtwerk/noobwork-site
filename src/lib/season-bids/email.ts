import { findSeasonSpot, formatUsd, season } from "@/data/season";
import type { Bid } from "./types";

interface Mail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

/** Resend, like the inquiry form. CONTACT_EMAIL_MODE=stub skips sending (tests, E2E). */
export async function sendMail(mail: Mail): Promise<void> {
  if (process.env.CONTACT_EMAIL_MODE === "stub") return;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("EMAIL_NOT_CONFIGURED");
  const from = process.env.CONTACT_FROM_EMAIL ?? "Noobwork Media Kit <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text, ...(mail.replyTo ? { reply_to: mail.replyTo } : {}) }),
  });
  if (!res.ok) throw new Error(`RESEND_FAILED:${res.status}`);
}

const spotTitle = (bid: Bid) => findSeasonSpot(bid.spotId)?.title ?? bid.spotId;
const NOT_BINDING = "Bids are non-binding offers. If yours wins, I'll send a contract and an invoice. No payment is taken on the site.";

export function confirmMail(bid: Bid, confirmUrl: string): Mail {
  return {
    to: bid.email,
    subject: `Confirm your ${season.name} bid: ${spotTitle(bid)}`,
    text: [
      `Hi ${bid.contactName},`,
      "",
      `You bid ${formatUsd(bid.amount)} for ${spotTitle(bid)} in ${season.name} on behalf of ${bid.brand}.`,
      "Confirm it here, and I'll review it before it shows on the board:",
      confirmUrl,
      "",
      "The link works for 48 hours. If you didn't place this bid, ignore this email.",
      "",
      NOT_BINDING,
      "",
      "Joachim (Noobwork)",
    ].join("\n"),
  };
}

export function reviewMail(bid: Bid, adminUrl: string): Mail {
  return {
    to: process.env.CONTACT_TO_EMAIL ?? "joachim@noobwork.no",
    replyTo: bid.email,
    subject: `New bid: ${bid.brand}, ${formatUsd(bid.amount)} for ${spotTitle(bid)}`,
    text: [
      `${bid.brand} (${bid.category}) bid ${formatUsd(bid.amount)} for ${spotTitle(bid)}.`,
      `Contact: ${bid.contactName} <${bid.email}>`,
      `Website: ${bid.website}`,
      `Show name publicly: ${bid.showName ? "yes" : "no, category only"}`,
      "",
      `Approve or reject it: ${adminUrl}`,
    ].join("\n"),
  };
}

export function outbidMail(bid: Bid, newTop: number, seasonUrl: string): Mail {
  return {
    to: bid.email,
    subject: `You've been outbid on ${spotTitle(bid)}`,
    text: [
      `Hi ${bid.contactName},`,
      "",
      `Another brand bid ${formatUsd(newTop)} for ${spotTitle(bid)}, above your ${formatUsd(bid.amount)}.`,
      `You can raise your bid here: ${seasonUrl}`,
      "",
      NOT_BINDING,
      "",
      "Joachim (Noobwork)",
    ].join("\n"),
  };
}
