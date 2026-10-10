import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { findSeasonSpot } from "@/data/season";

export const metadata: Metadata = {
  title: "Confirm your bid",
  robots: { index: false, follow: false },
  // Keep token URLs off other sites while preserving Origin on the native POST.
  referrer: "same-origin",
};

const RESULTS: Record<string, { title: string; copy: string }> = {
  confirmed: { title: "Bid confirmed.", copy: "Thanks. I review every bid before it shows on the board, and I'll email you if someone outbids you." },
  expired: { title: "Link expired.", copy: "Confirmation links work for 48 hours. Place the bid again from the season page." },
  closed: { title: "Bidding closed.", copy: "Bidding on this spot closed before the bid was confirmed." },
  invalid: { title: "Link not valid.", copy: "This link has already been used or is not valid. Place the bid again if you need to." },
  limited: { title: "Too many tries.", copy: "Wait a while and try again." },
  unavailable: { title: "Something went wrong.", copy: "The bid could not be confirmed right now. Try again, or email joachim@noobwork.no." },
};

type Query = Record<string, string | string[] | undefined>;

export default async function ConfirmBid({ searchParams }: { searchParams?: Promise<Query> }) {
  const query = (await searchParams) ?? {};
  const token = typeof query.token === "string" ? query.token : "";
  const result = typeof query.result === "string" ? RESULTS[query.result] : undefined;
  const spot = typeof query.spot === "string" ? findSeasonSpot(query.spot) : undefined;

  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main media-kit season-confirm">
        <div className="shell-inner season-confirm__inner">
          <p className="chapter-head__marker">Season 1 · Bid</p>
          {result ? (
            <>
              <h1 className="chapter-head__title">{result.title}</h1>
              <p>{result.copy}</p>
              <Link className="btn btn--primary" href={spot ? `/season?spot=${spot.id}#board` : "/season#board"}>Back to the board</Link>
            </>
          ) : token ? (
            <>
              <h1 className="chapter-head__title">Confirm your bid.</h1>
              <p>Confirm that you placed this bid. It goes to review next, and shows on the board once approved.</p>
              <form method="post" action="/api/season/bids/confirm">
                <input type="hidden" name="token" value={token} />
                <button type="submit" className="btn btn--primary">Confirm my bid</button>
              </form>
              <p className="season-confirm__note">Bids are non-binding offers. No payment is taken on this site.</p>
            </>
          ) : (
            <>
              <h1 className="chapter-head__title">{RESULTS.invalid.title}</h1>
              <p>{RESULTS.invalid.copy}</p>
              <Link className="btn btn--primary" href="/season#board">Back to the board</Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
