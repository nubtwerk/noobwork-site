"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { partnershipOffers, type PartnershipOfferId } from "@/data/partnerships";
import { getInquiryFeedback } from "@/lib/inquiry-feedback";
import { trackPartnership } from "@/lib/partnership-analytics";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForm({ initialOffer = "", feedback }: { initialOffer?: PartnershipOfferId | ""; feedback?: string } = {}) {
  const initialError = getInquiryFeedback(feedback);
  const [status, setStatus] = useState<FormStatus>(feedback === "sent" ? "success" : initialError ? "error" : "idle");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const started = useRef(false);
  const offerSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (offerSelect.current) offerSelect.current.value = initialOffer;
  }, [initialOffer]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
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
          offer: data.get("offer"),
          timing: data.get("timing"),
          budget: data.get("budget"),
        }),
      });

      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || json.ok !== true) {
        setError(json.error ?? "Could not send your message. Try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      trackPartnership("inquiry_submitted", { offer: data.get("offer") });
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
          Thanks for reaching out — Joachim will reply to the email you
          provided, usually within a few business days. Prefer email?{" "}
          <a href="mailto:joachim@noobwork.no" data-partnership-source="email">
            joachim@noobwork.no
          </a>
        </p>
        <a
          href="/media-kit#inquiry"
          className="btn btn--secondary contact-form__reset"
          onClick={(event) => { event.preventDefault(); setStatus("idle"); setError(null); started.current = false; }}
        >
          Send another message
        </a>
      </div>
    );
  }

  return (
    <form className="contact-form" method="post" action="/api/contact" onSubmit={onSubmit}
      onFocus={() => {
        if (!started.current) {
          started.current = true;
          trackPartnership("inquiry_started", { offer: offerSelect.current?.value });
        }
      }}>
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
            minLength={2}
            maxLength={120}
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
            maxLength={254}
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
          maxLength={160}
          className="contact-form__input"
        />
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-offer">Partnership format</label>
        <select ref={offerSelect} id="contact-offer" name="offer" className="contact-form__input" defaultValue={initialOffer}
          onChange={(event) => trackPartnership("partnership_offer_selected", { offer: event.target.value })}>
          <option value="">Let&apos;s find the right fit</option>
          {partnershipOffers.map((offer) => <option key={offer.id} value={offer.id}>{offer.title}</option>)}
        </select>
      </div>
      <div className="contact-form__row">
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-timing">Timing <span className="contact-form__optional">(optional)</span></label>
          <input id="contact-timing" name="timing" type="text" maxLength={120} className="contact-form__input" placeholder="Dates or campaign window" />
        </div>
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-budget">Budget range <span className="contact-form__optional">(optional)</span></label>
          <input id="contact-budget" name="budget" type="text" maxLength={120} className="contact-form__input" placeholder="Amount and currency, if known" />
        </div>
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={5}
          className="contact-form__textarea"
          placeholder="Tell me about your product, who you want to reach, and what you have in mind."
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
        {status === "submitting" ? "Sending…" : "Send partnership inquiry"}
      </button>
      <p className="contact-form__privacy">Your details are used to respond to this inquiry. You won&apos;t be added to a mailing list.</p>
      <p className="contact-form__fallback">Prefer email? <a href="mailto:joachim@noobwork.no" data-partnership-source="email">joachim@noobwork.no</a></p>
    </form>
  );
}
