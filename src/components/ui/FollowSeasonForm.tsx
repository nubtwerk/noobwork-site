"use client";

import { useId, useState, type FormEvent } from "react";
import { trackSeason } from "@/lib/season-analytics";

type Status = "idle" | "submitting" | "sent" | "confirmed" | "error";
const NETWORK_ERROR = "Network error. Check your connection and try again.";

export default function FollowSeasonForm({
  from,
  feedback,
  tone = "light",
}: {
  /** Which page the signup came from, for analytics only. */
  from: "season" | "home";
  /** A result code and message from the URL after a native post or confirm. */
  feedback?: { code: string; message: string };
  tone?: "light" | "dark";
}) {
  const initial: Status = feedback?.code === "sent" ? "sent" : feedback?.code === "confirmed" ? "confirmed" : feedback ? "error" : "idle";
  const [status, setStatus] = useState<Status>(initial);
  const [message, setMessage] = useState<string | undefined>(feedback?.message);
  const id = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const data = new FormData(event.currentTarget);
    setStatus("submitting");
    setMessage(undefined);
    try {
      const res = await fetch("/api/season/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), website: data.get("website") }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.ok !== true) {
        setStatus("error");
        setMessage(json.error ?? "Something went wrong. Try again in a moment.");
        return;
      }
      setStatus("sent");
      setMessage("Check your inbox. Confirm with the link I just sent and you're on the list.");
      trackSeason("season_follow_requested", { source: from });
    } catch {
      setStatus("error");
      setMessage(NETWORK_ERROR);
    }
  }

  if (status === "sent" || status === "confirmed") {
    return (
      <div className={`follow-form follow-form--${tone} follow-form--done`} role="status">
        <p className="follow-form__done-title">{status === "sent" ? "Almost there." : "You're in."}</p>
        <p className="follow-form__note">{message}</p>
      </div>
    );
  }

  return (
    <form className={`follow-form follow-form--${tone}`} method="post" action="/api/season/follow" onSubmit={onSubmit}>
      <label className="follow-form__label" htmlFor={`${id}-email`}>Email</label>
      <div className="follow-form__row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className="follow-form__input"
          aria-describedby={`${id}-note`}
          aria-invalid={status === "error" ? true : undefined}
        />
        <button type="submit" className={`btn ${tone === "dark" ? "btn--sand" : "btn--primary"} follow-form__submit`} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Follow the season"}
        </button>
      </div>
      <div className="contact-form__honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "error" && message ? <p className="follow-form__error" role="alert">{message}</p> : null}
      <p id={`${id}-note`} className="follow-form__note">You confirm by email first. Unsubscribe any time.</p>
    </form>
  );
}
