import "@/styles/challenge.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { challenge, formatWindowDates, isChallengeVisible } from "@/data/challenge";
import { countryName } from "@/lib/challenge/validate";

export const metadata: Metadata = {
  title: `${challenge.name}: rules`,
  description: `Rules for ${challenge.name}, the Season 1 community ${challenge.test} challenge.`,
  robots: { index: false, follow: false },
};

export default function ChallengeRules() {
  if (!isChallengeVisible()) notFound();
  const excluded = challenge.prizeExcludedCountries.map(countryName).join(" and ");

  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section challenge-page challenge-page--light">
          <article className="shell-inner challenge-page__inner challenge-rules">
            <p className="chapter-head__marker">Season 1 · {challenge.name}</p>
            <h1 className="challenge-page__title">The rules.</h1>
            {challenge.rulesReviewed ? null : (
              <p className="challenge-page__note" role="note">Draft. These rules are waiting for a legal review and are not in force yet.</p>
            )}

            <h2>Who runs it</h2>
            <p>The challenge is run by Joachim Haraldsen (Noobwork). Questions: <a href="mailto:joachim@noobwork.no">joachim@noobwork.no</a>.</p>

            <h2>Who can enter</h2>
            <p>Anyone aged 18 or over, anywhere. Entry is free and needs no purchase. One entry per person.</p>

            <h2>Dates</h2>
            <ul>
              {challenge.windows.map((w) => <li key={w.id}>{w.label}: {formatWindowDates(w)}, closing 23:59 Korea time on the last day.</li>)}
            </ul>
            <p>Signups close when the baseline window closes. A run counts only if it was done inside the window it is logged for.</p>

            <h2>The test</h2>
            <p>A continuous {challenge.test} of at least {challenge.distanceKm}.0 km, outdoors or on a treadmill, logged with your time and a public link to the run.</p>

            <h2>How the board ranks</h2>
            <p>The board ranks your percentage improvement on your own baseline: (baseline time minus latest time) divided by baseline time. Faster runners have no advantage over beginners. Ties go to whoever logged first.</p>
            <p>A run that improves more than {challenge.flagAbovePct}% on your previous run, or is faster than {Math.floor(challenge.fastestPlausibleSeconds / 60)} minutes, is held for review and does not rank until checked.</p>

            <h2>Proof and fair play</h2>
            <ul>
              <li>Runs on the board are self-reported until checked. The top 20 of each window and every held run are checked by hand.</li>
              <li>To win a prize, both your baseline and the winning run must be public Strava activities with GPS, and your Strava account must show running before the baseline. Treadmill runs count for the board but not for prizes.</li>
              <li>Running a deliberately slow baseline, using someone else&apos;s run, or any other trick means disqualification.</li>
              <li>Joachim decides on eligibility and disqualification, and that decision is final. He can remove any display name from the board.</li>
            </ul>

            <h2>Prizes</h2>
            <ul>{challenge.prizes.map((p) => <li key={p}>{p}</li>)}</ul>
            <p>Prizes are products, gear or vouchers provided by the season&apos;s sponsors and sent by them. Each prize is worth up to about US${challenge.maxPrizeValueUsd}, and the prizes for each quarter are listed on the season page before its window opens. Prizes can&apos;t be swapped for cash.</p>
            <p>Winners are contacted by email within 14 days of a window closing and have 14 days to reply, or the prize goes to the next runner. Winners are named by display name in the retest episode. Winners pay any taxes due where they live.</p>
            <p>Residents of {excluded} can take part on the board but can&apos;t win prizes, because of local rules on prize promotions. The finisher draw is free to enter, with no purchase necessary.</p>

            <h2>Health</h2>
            <p>You take part at your own risk. If you are unsure whether running 5 km is safe for you, check with a doctor first. Stop if it hurts.</p>

            <h2>Your data</h2>
            <p>I store your email, display name, country, run times and run links, and whether you asked for Season 1 updates. The board shows only your display name, country, times and change. Your email and run links are never shown publicly or shared with sponsors; sponsors get only totals (runners, countries, km run), plus a prize winner&apos;s name and delivery details when they send a prize. No body measurements or health data are collected.</p>
            <p>The data is stored with the site&apos;s database provider and email service. You can delete everything yourself from your personal link at any time, or email me. Everything is deleted six months after the finale.</p>

            <h2>Sponsors</h2>
            <p>The challenge is not run by any sponsor. Sponsor prizes and the &quot;presented by&quot; line are paid partnerships and labelled as such.</p>

            <p><Link href="/season#challenge" className="back-link">&larr; Back to the challenge</Link></p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
