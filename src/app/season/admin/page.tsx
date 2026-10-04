import type { Metadata } from "next";
import { cookies } from "next/headers";
import { formatUsd, seasonSpots } from "@/data/season";
import { ADMIN_COOKIE, adminConfigured, verifySession } from "@/lib/season-bids/admin-auth";
import { closesAt, publicLabel } from "@/lib/season-bids/rules";
import { adminNotices } from "@/lib/season-bids/service";
import { getBidStore } from "@/lib/season-bids/store";
import type { Bid } from "@/lib/season-bids/types";

export const metadata: Metadata = {
  title: "Season bids",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<Bid["status"], string> = {
  unconfirmed: "Email not confirmed",
  pending: "Waiting for you",
  approved: "On the board",
  winner: "Winner",
  rejected: "Rejected",
};

const ORDER: Record<Bid["status"], number> = { pending: 0, winner: 1, approved: 2, unconfirmed: 3, rejected: 4 };

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" });

type Query = Record<string, string | string[] | undefined>;

function Login({ error }: { error?: string }) {
  return (
    <form className="contact-form season-admin__login" method="post" action="/api/season/admin/login">
      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" className="contact-form__input" required autoComplete="current-password" />
      </div>
      {error ? <p className="contact-form__error" role="alert">{error === "limited" ? "Too many tries. Wait an hour." : "Wrong password."}</p> : null}
      <button type="submit" className="btn btn--primary contact-form__submit">Sign in</button>
    </form>
  );
}

function Action({ bid, action, label }: { bid: Bid; action: string; label: string }) {
  return (
    <form method="post" action={`/api/season/admin/bids/${bid.id}`}>
      <input type="hidden" name="action" value={action} />
      <button type="submit" className={`btn ${action === "reject" ? "btn--secondary" : "btn--primary"} season-admin__btn`}>
        {label} <span className="sr-only">{bid.brand}, {formatUsd(bid.amount)}</span>
      </button>
    </form>
  );
}

export default async function SeasonAdmin({ searchParams }: { searchParams?: Promise<Query> } = {}) {
  const query = (await searchParams) ?? {};
  const signedIn = verifySession((await cookies()).get(ADMIN_COOKIE)?.value);
  const notice = typeof query.notice === "string" ? adminNotices[query.notice] : undefined;
  const store = getBidStore();
  let bids: Bid[] | null = null;
  if (signedIn && store) {
    try {
      bids = await store.list();
    } catch {
      bids = null;
    }
  }

  return (
    <main id="main-content" className="season-admin">
      <div className="season-admin__head">
        <p className="chapter-head__marker">Season 1 · Private</p>
        <h1 className="chapter-head__title">Bids</h1>
        {signedIn ? (
          <form method="post" action="/api/season/admin/logout"><button type="submit" className="btn btn--secondary season-admin__btn">Sign out</button></form>
        ) : null}
      </div>
      {!adminConfigured() ? (
        <p>The admin is not set up. Add SEASON_ADMIN_PASSWORD (12 characters or more) in Vercel.</p>
      ) : !signedIn ? (
        <Login error={typeof query.error === "string" ? query.error : undefined} />
      ) : !bids ? (
        <p role="alert">{adminNotices.unavailable}</p>
      ) : (
        <>
          {notice ? <p className="season-admin__notice" role="status">{notice}</p> : null}
          {seasonSpots.filter((spot) => spot.openingBid).map((spot) => {
            const list = bids.filter((bid) => bid.spotId === spot.id).sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.amount - a.amount);
            return (
              <section key={spot.id} className="season-admin__spot" aria-labelledby={`spot-${spot.id}`}>
                <h2 id={`spot-${spot.id}`} className="season-admin__spot-title">{spot.title}</h2>
                <p className="season-admin__meta">Opening {formatUsd(spot.openingBid as number)} · closes {when.format(closesAt(bids, spot.id))} Seoul time</p>
                {list.length === 0 ? <p className="season-admin__meta">No bids yet.</p> : (
                  <ul className="season-admin__bids">
                    {list.map((bid) => (
                      <li key={bid.id} id={`bid-${bid.id}`} className={`season-admin__bid season-admin__bid--${bid.status}`}>
                        <div className="season-admin__bid-main">
                          <p className="season-admin__amount">{formatUsd(bid.amount)}</p>
                          <p><strong>{bid.brand}</strong> · {bid.category}</p>
                          <p className="season-admin__meta">
                            {bid.contactName} · <a href={`mailto:${bid.email}`}>{bid.email}</a> · {bid.website}
                          </p>
                          <p className="season-admin__meta">
                            {STATUS_LABEL[bid.status]} · shown as &ldquo;{publicLabel(bid)}&rdquo; · placed {when.format(new Date(bid.createdAt))}
                          </p>
                        </div>
                        <div className="season-admin__actions">
                          {bid.status === "pending" ? <Action bid={bid} action="approve" label="Approve" /> : null}
                          {bid.status === "approved" ? <Action bid={bid} action="winner" label="Mark winner" /> : null}
                          {bid.status === "pending" || bid.status === "approved" || bid.status === "unconfirmed" ? <Action bid={bid} action="reject" label="Reject" /> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
          <p className="season-admin__meta">Marking a winner shows the spot as Reserved. Mark it Sold in src/data/season.ts once the contract is signed.</p>
        </>
      )}
    </main>
  );
}
