import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { followFeedback, verifyFollowToken } from "@/lib/season-follow";

export const metadata: Metadata = {
  title: "Confirm",
  robots: { index: false, follow: false },
};

type Query = Record<string, string | string[] | undefined>;
export default async function ConfirmFollow({ searchParams }: { searchParams?: Promise<Query> }) {
  const query = await searchParams ?? {};
  const token = typeof query.t === "string" ? query.t : undefined;
  const valid = Boolean(verifyFollowToken(token));

  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section site-section--dark follow-confirm">
          <div className="shell-inner follow-confirm__inner">
            <p className="chapter-head__marker">Season 1</p>
            <h1 className="follow-confirm__title">{valid ? "One more tap." : "Link expired."}</h1>
            {valid ? (
              <>
                <p className="follow-confirm__copy">Confirm and you&apos;ll get every retest by email as it lands. Unsubscribe any time.</p>
                <form method="post" action="/api/season/follow/confirm">
                  <input type="hidden" name="t" value={token} />
                  <button type="submit" className="btn btn--sand">Confirm and follow</button>
                </form>
              </>
            ) : (
              <>
                <p className="follow-confirm__copy">{followFeedback.expired}</p>
                <Link href="/season#follow" className="btn btn--sand">Sign up again</Link>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
