import { partnershipOffers } from "@/data/partnerships";
import { INQUIRY_ATTRIBUTION_KEYS } from "@/lib/inquiry-attribution";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

/** Keep a bounded native POST draft in its response body, never a URL or cookie. */
export function nativeContactError(status: number, message: string, body: unknown): Response {
  const draft = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const value = (name: string) => escapeHtml(typeof draft[name] === "string" ? draft[name] : "");
  const input = (name: string, label: string, attributes: string) =>
    `<label for="${name}">${label}</label><input id="${name}" name="${name}" value="${value(name)}" ${attributes}>`;
  const attributionFields = INQUIRY_ATTRIBUTION_KEYS
    .filter((key) => typeof draft[key] === "string" && (draft[key] as string).trim())
    .map((key) => `<input type="hidden" name="${key}" value="${value(key)}">`)
    .join("");
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Review your inquiry — Noobwork</title>
<style>body{margin:0;background:#e8dfce;color:#2e351f;font:18px/1.5 system-ui,sans-serif}main{max-width:640px;margin:auto;padding:40px 24px}h1{font-size:32px;line-height:1.2}label{display:block;margin-top:18px}input,select,textarea,button{box-sizing:border-box;width:100%;font:inherit;padding:12px;border:1px solid #5b604a;border-radius:4px;background:#fff;color:#2e351f}textarea{min-height:160px}button{margin-top:24px;background:#2e351f;color:#fff;cursor:pointer}a{color:inherit}*:focus-visible{outline:3px solid #765035;outline-offset:3px}.trap{display:none}</style></head><body><main>
<a href="/media-kit#inquiry">Back to partnerships</a><h1>Your inquiry was not sent.</h1><p role="alert">${escapeHtml(message)}</p>
<form method="post" action="/api/contact">
${input("name", "Name", 'type="text" autocomplete="name" required minlength="2" maxlength="120"')}
${input("email", "Email", 'type="email" autocomplete="email" required maxlength="254"')}
${input("company", "Company / Brand (optional)", 'type="text" autocomplete="organization" maxlength="160"')}
<label for="offer">Partnership format</label><select id="offer" name="offer"><option value="">Let's find the right fit</option>${partnershipOffers.map((offer) => `<option value="${offer.id}"${draft.offer === offer.id ? " selected" : ""}>${escapeHtml(offer.title)}</option>`).join("")}</select>
${input("timing", "Timing (optional)", 'type="text" maxlength="120"')}
${input("budget", "Budget range (optional)", 'type="text" maxlength="120"')}
<label for="message">Message</label><textarea id="message" name="message" required minlength="20" maxlength="5000">${value("message")}</textarea>
${attributionFields}
<div class="trap" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
<button type="submit">Try sending again</button></form><p>Prefer email? <a href="mailto:joachim@noobwork.no">joachim@noobwork.no</a></p>
</main></body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}
