import "@/styles/challenge.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { challenge, isChallengeVisible } from "@/data/challenge";
import { joinFeedback } from "@/lib/challenge/feedback";
import { verifyJoinToken } from "@/lib/challenge/tokens";

export const metadata: Metadata = {
  title: "Confirm",
  robots: { index: false, follow: false },
  referrer: "same-origin",
};

type Query = Record<string, string | string[] | undefined>;
export default async function ConfirmChallenge({ searchParams }: { searchParams?: Promise<Query> } = {}) {
  if (!isChallengeVisible()) notFound();
  const query = await searchParams ?? {};
  const token = typeof query.t === "string" ? query.t : undefined;
  const claims = verifyJoinToken(token);

  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section site-section--dark challenge-page">
          <div className="shell-inner challenge-page__inner">
            <p className="chapter-head__marker">Season 1 · {challenge.name}</p>
            <h1 className="challenge-page__title">{claims ? "One more tap." : "Link expired."}</h1>
            {claims ? (
              <>
                <p className="challenge-page__copy">
                  Confirm and you&apos;re on the climb as <strong>{claims.name}</strong>. You&apos;ll get your personal link to log each run.
                </p>
                <form method="post" action="/api/season/challenge/confirm">
                  <input type="hidden" name="t" value={token} />
                  <button type="submit" className="btn btn--sand">Confirm and join</button>
                </form>
              </>
            ) : (
              <>
                <p className="challenge-page__copy">{joinFeedback.expired}</p>
                <Link href="/season#join" className="btn btn--sand">Sign up again</Link>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
