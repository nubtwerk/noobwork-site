"use client";

import { useState, type FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });

      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Could not send your message. Try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setError("Network error. Check your connection or email joachim@noobwork.no.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-form__success" role="status">
        <p className="contact-form__success-title">Message sent.</p>
        <p className="contact-form__success-copy">
          Thanks for reaching out — Joachim will get back to you at the email
          you provided.
        </p>
        <button
          type="button"
          className="btn btn--secondary contact-form__reset"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-form__row">
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-name">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="contact-form__input"
          />
        </div>
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="contact-form__input"
          />
        </div>
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-company">
          Company / Brand <span className="contact-form__optional">(optional)</span>
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          className="contact-form__input"
        />
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="contact-form__textarea"
          placeholder="Tell me about the brand, campaign goals, and timeline."
        />
      </div>

      {/* Honeypot — hidden from humans */}
      <div className="contact-form__honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? (
        <p className="contact-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn--primary contact-form__submit"
        disabled={status === "submitting"}
        data-magnetic
      >
        {status === "submitting" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
