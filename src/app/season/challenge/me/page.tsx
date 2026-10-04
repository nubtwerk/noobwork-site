import "@/styles/challenge.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { challenge, formatWindowDates, isChallengeVisible, nextChallengeWindow, openChallengeWindow } from "@/data/challenge";
import { challengeNow, isChallengeDemo } from "@/lib/challenge/env";
import { joinFeedback, pickFeedback, resultFeedback } from "@/lib/challenge/feedback";
import { computeStandings, formatImprovement, improvementPct } from "@/lib/challenge/leaderboard";
import { getChallengeStore, type ResultStatus } from "@/lib/challenge/store";
import { verifyRunnerToken } from "@/lib/challenge/tokens";
import { countryFlag, countryName, formatRunTime } from "@/lib/challenge/validate";

export const metadata: Metadata = {
  title: "Your climb",
  robots: { index: false, follow: false },
  // The URL carries the runner's personal link: never send it to other sites. "same-origin", not
  // "no-referrer", because no-referrer makes browsers post forms with Origin: null.
  referrer: "same-origin",
};

const STATUS_LABEL: Record<ResultStatus, string> = {
  self_reported: "Self-reported",
  verified: "Verified",
  flagged: "In review",
  rejected: "Not accepted",
};

type Query = Record<string, string | string[] | undefined>;
export default async function RunnerPage({ searchParams }: { searchParams?: Promise<Query> } = {}) {
  if (!isChallengeVisible()) notFound();
  const query = await searchParams ?? {};
  const token = typeof query.t === "string" ? query.t : "";
  const store = getChallengeStore();
  const id = verifyRunnerToken(token);
  const participant = store && id ? await store.getParticipant(id) : undefined;

  if (!store || !participant) {
    return (
      <Shell>
        <p className="chapter-head__marker">Season 1 · {challenge.name}</p>
        <h1 className="challenge-page__title">Link not found.</h1>
        <p className="challenge-page__copy">This link is broken, or the runner was deleted. Enter your email on the season page and I&apos;ll send your link again.</p>
        <Link href="/season#join" className="btn btn--sand">Back to the challenge</Link>
      </Shell>
    );
  }

  const [participants, results] = await Promise.all([store.listParticipants(), store.listResults()]);
  const mine = results.filter((r) => r.participantId === participant.id);
  const baseline = mine.find((r) => r.windowId === "baseline" && r.status !== "rejected" && r.status !== "flagged");
  const standing = computeStandings(participants, results).find((s) => s.participant.id === participant.id);
  const now = challengeNow();
  const open = openChallengeWindow(now);
  const next = nextChallengeWindow(now);
  const openRun = open ? mine.find((r) => r.windowId === open.id) : undefined;
  const result = pickFeedback(resultFeedback, query.result);
  const welcome = query.welcome === "1";

  return (
    <Shell>
      <p className="chapter-head__marker">Season 1 · {challenge.name}</p>
      <h1 className="challenge-page__title">
        <span className="challenge-page__flag" role="img" aria-label={countryName(participant.country)}>{countryFlag(participant.country)}</span> {participant.displayName}
      </h1>
      <p className="challenge-page__copy">
        {standing?.rank
          ? `#${standing.rank} on the board, ${formatImprovement(standing.improvementPct!)} on your baseline.`
          : baseline
            ? "Baseline logged. Your rank shows after the first retest."
            : `Log your baseline between ${formatWindowDates(challenge.windows[0])}.`}
      </p>
      {welcome ? (
        <p className="challenge-page__note" role="status">
          You&apos;re in. Bookmark this page: it&apos;s your personal link to log runs, so keep it to yourself.
          {isChallengeDemo() ? " Preview mode, so no email was sent." : " It's in your inbox too."}
        </p>
      ) : null}

      <div className="challenge-page__panel">
        <h2 className="challenge-page__subtitle">Your runs</h2>
        <div className="challenge-board">
          <table className="challenge-board__table challenge-runs">
            <caption className="sr-only">Your runs by window</caption>
            <thead>
              <tr><th scope="col">Window</th><th scope="col">Time</th><th scope="col">Change</th><th scope="col">Status</th></tr>
            </thead>
            <tbody>
              {challenge.windows.map((w) => {
                const run = mine.find((r) => r.windowId === w.id);
                const change = run && baseline && w.id !== "baseline" ? improvementPct(baseline.timeSeconds, run.timeSeconds) : undefined;
                return (
                  <tr key={w.id}>
                    <th scope="row">{w.label}<span className="challenge-runs__dates">{formatWindowDates(w)}</span></th>
                    <td className="challenge-board__time">{run ? formatRunTime(run.timeSeconds) : "–"}</td>
                    <td className="challenge-board__time">{change === undefined ? "–" : formatImprovement(change)}</td>
                    <td>{run ? STATUS_LABEL[run.status] : open?.id === w.id ? "Open now" : "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div id="log" className="challenge-page__panel mk-anchor">
        <h2 className="challenge-page__subtitle">{open ? `Log your ${open.id === "baseline" ? "baseline" : open.label.toLowerCase()}` : "Log a run"}</h2>
        {result ? <p className={result.code === "saved" || result.code === "flagged" ? "challenge-page__note" : "contact-form__error"} role={result.code === "saved" || result.code === "flagged" ? "status" : "alert"}>{result.message}</p> : null}
        {open ? (
          <form className="contact-form challenge-log" method="post" action="/api/season/challenge/result">
            <input type="hidden" name="t" value={token} />
            <p className="contact-form__privacy">
              Open until {formatWindowDates(open).split(" to ")[1]}, 23:59 Korea time.
              {openRun ? " Logging again replaces the run you already sent for this window." : ""}
            </p>
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="run-time">5 km time</label>
                <input id="run-time" name="time" className="contact-form__input" required inputMode="numeric" placeholder="26:45" pattern="\d{1,2}[:.]\d{2}([:.]\d{2})?" aria-describedby="run-time-hint" />
                <p id="run-time-hint" className="contact-form__privacy">Minutes and seconds.</p>
              </div>
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="run-proof">Strava link</label>
                <input id="run-proof" name="proof" type="url" className="contact-form__input" required placeholder="https://www.strava.com/activities/..." aria-describedby="run-proof-hint" />
                <p id="run-proof-hint" className="contact-form__privacy">Set the activity to public. A treadmill photo link counts for the board, but only Strava runs can win prizes.</p>
              </div>
            </div>
            <button type="submit" className="btn btn--primary contact-form__submit">Log this run</button>
          </form>
        ) : (
          <p className="challenge-page__copy">{next ? `Next window: ${next.label}, ${formatWindowDates(next)}.` : "Season 1 is complete. Thanks for climbing."}</p>
        )}
      </div>

      <div id="delete" className="challenge-page__panel mk-anchor">
        <h2 className="challenge-page__subtitle">Leave the challenge</h2>
        {query.delete === "confirm" ? <p className="contact-form__error" role="alert">Tick the box to confirm.</p> : null}
        {query.delete === "failed" ? <p className="contact-form__error" role="alert">{joinFeedback.failed}</p> : null}
        <form className="challenge-delete" method="post" action="/api/season/challenge/delete">
          <input type="hidden" name="t" value={token} />
          <label className="challenge-join__tick">
            <input type="checkbox" name="confirm" /> <span>Delete my name, email and every run. This can&apos;t be undone.</span>
          </label>
          <button type="submit" className="btn btn--secondary">Delete me</button>
        </form>
      </div>
      <p className="challenge-page__copy"><Link href="/season#leaderboard" className="back-link">&larr; The board</Link></p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section challenge-page challenge-page--light">
          <div className="shell-inner challenge-page__inner">{children}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
