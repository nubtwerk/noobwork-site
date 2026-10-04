"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { findSeasonSpot, formatUsd, isBiddable, season, seasonBidding, type SeasonSpot } from "@/data/season";
import type { PublicSpotBids } from "@/lib/season-bids/types";

const POLL_MS = 20_000;

interface BidsContext {
  /** null when bidding is off or the bid store is unreachable: fall back to inquiries. */
  spots: Record<string, PublicSpotBids> | null;
  openBid: (spotId: string) => void;
}

const Context = createContext<BidsContext>({ spots: null, openBid: () => {} });

export function useSeasonBids(spotId: string): PublicSpotBids | undefined {
  return useContext(Context).spots?.[spotId];
}

const byId = (list: PublicSpotBids[] | null) => (list ? Object.fromEntries(list.map((s) => [s.spotId, s])) : null);

/**
 * Holds the live board for every auctioned spot, refreshed every 20 seconds
 * while the tab is visible, and the one bid dialog the page shares.
 */
export function SeasonBidsProvider({ initial, children }: { initial: PublicSpotBids[] | null; children: ReactNode }) {
  const [spots, setSpots] = useState(() => byId(initial));
  const [bidSpotId, setBidSpotId] = useState<string | null>(null);
  const enabled = initial !== null;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/season/bids", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { spots?: PublicSpotBids[] };
      if (json.spots) setSpots(byId(json.spots));
    } catch {
      // Keep the last board; the next tick tries again.
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, refresh]);

  return (
    <Context.Provider value={{ spots, openBid: setBidSpotId }}>
      {children}
      {enabled ? <BidDialog spotId={bidSpotId} onClose={() => setBidSpotId(null)} onPlaced={refresh} /> : null}
    </Context.Provider>
  );
}

const closeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul",
});

export function formatClose(iso: string): string {
  return `${closeFormat.format(new Date(iso))} Seoul time`;
}

function timeLeft(iso: string, now: number): string | null {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 60) return `${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} h ${minutes % 60} min left`;
  return `${Math.floor(hours / 24)} days left`;
}

/** Time left is rendered after mount only, so server and client markup match. */
function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);
  return now;
}

/**
 * The auction for one spot: top bid, the public bid list and the bid button.
 * Without live data it falls back to the inquiry link the page had before.
 */
export function SeasonBidPanel({ spot, tone = "light", showClaimFallback = true }: { spot: SeasonSpot; tone?: "light" | "dark"; showClaimFallback?: boolean }) {
  const { openBid } = useContext(Context);
  const state = useSeasonBids(spot.id);
  const now = useNow();

  if (!isBiddable(spot) || !state) {
    if (!showClaimFallback || spot.status !== "open") return null;
    return (
      <Link className={`btn ${tone === "dark" ? "btn--sand" : "btn--secondary"}`} href={`/season?spot=${spot.id}#inquiry`} data-partnership-source="season" data-partnership-offer="season">
        {tone === "dark" ? `Claim ${spot.title}` : <>Claim this spot <span className="sr-only">: {spot.title}</span></>}
      </Link>
    );
  }

  const top = state.bids[0];
  const left = now === null ? null : timeLeft(state.closesAt, now);
  const closed = !state.isOpen || (now !== null && left === null);

  return (
    <div className={`season-bids season-bids--${tone}`}>
      <div className="season-bids__head">
        <p className="season-bids__amount">
          <span className="season-bids__kicker">{top ? "Top bid" : "Opening bid"}</span>
          <span className="season-bids__figure"><span className="season-bids__currency">$</span>{(top ? top.amount : state.openingBid).toLocaleString("en-US")}</span>
          {spot.bidUnit ? <span className="season-bids__unit">{spot.bidUnit}</span> : null}
        </p>
        <p className="season-bids__meta">
          {state.hasWinner ? "Bidding closed. Winner picked." : closed ? "Bidding closed." : (
            <>
              {top ? `${state.bids.length} ${state.bids.length === 1 ? "bid" : "bids"} · ` : "Bidding open · "}
              Closes <time dateTime={state.closesAt}>{formatClose(state.closesAt)}</time>
              {left ? <span className="season-bids__left"> · {left}</span> : null}
            </>
          )}
        </p>
      </div>
      {state.bids.length > 0 ? (
        <ol className="season-bids__list" aria-label={`Bids on ${spot.title}`}>
          {state.bids.slice(0, 5).map((bid, index) => (
            <li key={`${bid.at}-${bid.amount}-${index}`} className={index === 0 ? "is-top" : undefined}>
              <span className="season-bids__who">{bid.label}</span>
              <span className="season-bids__bid">{formatUsd(bid.amount)}</span>
            </li>
          ))}
          {state.bids.length > 5 ? <li className="season-bids__more">and {state.bids.length - 5} more</li> : null}
        </ol>
      ) : null}
      {!closed ? (
        <button type="button" className={`btn ${tone === "dark" ? "btn--sand" : "btn--primary"} season-bids__cta`} onClick={() => openBid(spot.id)}>
          {top ? "Raise the bid" : "Place a bid"} <span className="sr-only">on {spot.title}</span>
        </button>
      ) : null}
    </div>
  );
}

type FormStatus = "idle" | "submitting" | "sent" | "error";

function BidDialog({ spotId, onClose, onPlaced }: { spotId: string | null; onClose: () => void; onPlaced: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const spot = spotId ? findSeasonSpot(spotId) : undefined;
  const state = useSeasonBids(spotId ?? "");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (spot && !el.open) {
      el.showModal();
    } else if (!spot && el.open) {
      el.close();
    }
  }, [spot]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!spot || status === "submitting") return;
    setStatus("submitting");
    setError(null);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/season/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, spotId: spot.id, showName: data.showName === "on" }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Your bid did not go through. Try again.");
        setStatus("error");
        if (res.status === 409) onPlaced();
        return;
      }
      setStatus("sent");
    } catch {
      setError("Network error. Check your connection, or email joachim@noobwork.no.");
      setStatus("error");
    }
  }

  const minimum = state?.minNextBid ?? spot?.openingBid ?? 0;

  return (
    <dialog ref={dialog} className="season-bid-dialog" aria-labelledby="bid-dialog-title" onClose={() => {
      setStatus("idle");
      setError(null);
      onClose();
    }}>
      {spot ? (
        <div className="season-bid-dialog__inner">
          <div className="season-bid-dialog__head">
            <p className="chapter-head__marker">{season.name} · {spot.term}</p>
            <h2 id="bid-dialog-title" className="season-bid-dialog__title">Bid on {spot.title}</h2>
            <button type="button" className="season-bid-dialog__close" onClick={() => dialog.current?.close()}>
              <span aria-hidden="true">×</span><span className="sr-only">Close</span>
            </button>
          </div>
          {status === "sent" ? (
            <div className="contact-form__success" role="status">
              <p className="contact-form__success-title">Check your inbox.</p>
              <p className="contact-form__success-copy">
                I sent a confirmation link to your work email. Your bid goes to review once you confirm it,
                and shows on the board after I approve it.
              </p>
              <button type="button" className="btn btn--secondary contact-form__reset" onClick={() => dialog.current?.close()}>Done</button>
            </div>
          ) : (
            <form className="contact-form season-bid-form" onSubmit={onSubmit} noValidate={false}>
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="bid-amount">Your bid in US dollars {spot.bidUnit ? <span className="contact-form__optional">({spot.bidUnit})</span> : null}</label>
                <div className="season-bid-form__amount">
                  <span aria-hidden="true">$</span>
                  <input id="bid-amount" name="amount" className="contact-form__input" inputMode="numeric" pattern="[0-9,]*" required
                    defaultValue={minimum} key={spot.id} aria-describedby="bid-amount-hint" autoComplete="off" />
                </div>
                <p id="bid-amount-hint" className="season-bid-form__hint">Minimum {formatUsd(minimum)}. Raises go up by at least {formatUsd(seasonBidding.minRaise)}. {seasonBidding.setupNote}</p>
              </div>
              <div className="contact-form__row">
                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="bid-brand">Brand</label>
                  <input id="bid-brand" name="brand" className="contact-form__input" required minLength={2} maxLength={80} autoComplete="organization" />
                </div>
                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="bid-category">Category</label>
                  <select id="bid-category" name="category" className="contact-form__input" required defaultValue="">
                    <option value="" disabled>Pick one</option>
                    {seasonBidding.categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
              </div>
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="bid-website">Brand website</label>
                <input id="bid-website" name="website" className="contact-form__input" required maxLength={200} placeholder="brand.com" autoComplete="url" />
              </div>
              <div className="contact-form__row">
                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="bid-name">Your name</label>
                  <input id="bid-name" name="contactName" className="contact-form__input" required minLength={2} maxLength={120} autoComplete="name" />
                </div>
                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="bid-email">Work email</label>
                  <input id="bid-email" name="email" type="email" className="contact-form__input" required maxLength={254} autoComplete="email" aria-describedby="bid-email-hint" />
                </div>
              </div>
              <p id="bid-email-hint" className="season-bid-form__hint">On your brand&apos;s domain. Personal addresses are not accepted.</p>
              <label className="season-bid-form__check">
                <input type="checkbox" name="showName" />
                <span>Show our brand name on the board. Otherwise only the category and amount are shown.</span>
              </label>
              <div className="contact-form__honeypot" aria-hidden="true">
                <label htmlFor="bid-company-url">Leave this empty</label>
                <input id="bid-company-url" name="company_url" tabIndex={-1} autoComplete="off" />
              </div>
              {error ? <p className="contact-form__error" role="alert">{error}</p> : null}
              <button type="submit" className="btn btn--primary contact-form__submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "Place bid"}
              </button>
              <p className="contact-form__privacy">
                Bids are non-binding offers. If yours wins, I&apos;ll send a contract and an invoice. No payment is taken on this site.
                Your contact details stay private and are only used for this season. One brand per category. Supplement brands are excluded this season.
              </p>
            </form>
          )}
        </div>
      ) : null}
    </dialog>
  );
}

/** The status word for a spot, switching to Reserved once a winner is picked. */
export function SeasonSpotStatusLabel({ spot, labels }: { spot: SeasonSpot; labels: Record<SeasonSpot["status"], string> }) {
  const live = useSeasonBids(spot.id);
  const status = spot.status === "open" && live?.hasWinner ? "reserved" : spot.status;
  return <span className={`season-status season-status--${status}`}>{labels[status]}</span>;
}
