"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { joinFeedback, pickFeedback } from "@/lib/challenge/feedback";

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * Join the challenge. Works without JavaScript (native POST, the API redirects
 * back with a result code); with JavaScript it posts JSON and stays in place.
 */
export default function ChallengeJoinForm({
  countries,
  feedback,
}: {
  countries: readonly { code: string; name: string }[];
  feedback?: string;
}) {
  const initial = pickFeedback(joinFeedback, feedback);
  const [status, setStatus] = useState<Status>(initial?.code === "sent" ? "sent" : initial && initial.code !== "deleted" ? "error" : "idle");
  const [error, setError] = useState<string | null>(initial && initial.code !== "sent" && initial.code !== "deleted" ? initial.message : null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/season/challenge/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          name: data.get("name"),
          country: data.get("country"),
          adult: data.get("adult") === "on",
          rules: data.get("rules") === "on",
          newsletter: data.get("newsletter") === "on",
          website: data.get("website"),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; previewLink?: string };
      if (!res.ok || json.ok !== true) {
        setError(json.error ?? joinFeedback.failed);
        setStatus("error");
        return;
      }
      setPreviewLink(json.previewLink ?? null);
      setStatus("sent");
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="contact-form__success challenge-join__done" role="status">
        <p className="contact-form__success-title">Almost in.</p>
        <p className="contact-form__success-copy">{joinFeedback.sent}</p>
        {previewLink ? (
          <p className="contact-form__success-copy challenge-join__preview">
            Preview mode, so no email was sent. <a href={previewLink}>Open your link</a>.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className="contact-form challenge-join" method="post" action="/api/season/challenge/join" onSubmit={onSubmit} noValidate={false}>
      <div className="contact-form__row">
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="challenge-name">Display name</label>
          <input id="challenge-name" name="name" className="contact-form__input" required minLength={2} maxLength={24} autoComplete="nickname" aria-describedby="challenge-name-hint" />
          <p id="challenge-name-hint" className="contact-form__privacy">Shown on the board. Not your email.</p>
        </div>
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="challenge-country">Country</label>
          <select id="challenge-country" name="country" className="contact-form__input" required defaultValue="">
            <option value="" disabled>Pick one</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="challenge-email">Email</label>
        <input id="challenge-email" name="email" type="email" className="contact-form__input" required maxLength={254} autoComplete="email" />
      </div>
      <div className="contact-form__honeypot" aria-hidden="true">
        <label htmlFor="challenge-website">Website</label>
        <input id="challenge-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <fieldset className="challenge-join__ticks">
        <legend className="sr-only">Agreements</legend>
        <label className="challenge-join__tick">
          <input type="checkbox" name="adult" required /> <span>I&apos;m 18 or over.</span>
        </label>
        <label className="challenge-join__tick">
          <input type="checkbox" name="rules" required />{" "}
          <span>I accept the <Link href="/season/challenge/rules">challenge rules</Link>, and I take part at my own risk.</span>
        </label>
        <label className="challenge-join__tick">
          <input type="checkbox" name="newsletter" />{" "}
          <span>Also email me Season 1 updates. <span className="contact-form__optional">(optional)</span></span>
        </label>
      </fieldset>
      {error ? <p className="contact-form__error" role="alert">{error}</p> : null}
      <p className="contact-form__privacy">
        Your email is only used for the challenge. It is never shown or shared with sponsors, and everything is deleted six months after the finale.
        You can delete it yourself any time from your personal link.
      </p>
      <button type="submit" className="btn btn--primary contact-form__submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Joining..." : "Join the challenge"}
      </button>
    </form>
  );
}
