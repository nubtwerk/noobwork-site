import "@/styles/challenge.css";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ChallengeJoinForm from "@/components/ui/ChallengeJoinForm";
import ChallengeLeaderboard from "@/components/ui/ChallengeLeaderboard";
import { challenge, formatWindowDates, nextChallengeWindow, openChallengeWindow } from "@/data/challenge";
import { findSeasonSpot } from "@/data/season";
import { challengeNow, isChallengeDemo } from "@/lib/challenge/env";
import { joinFeedback, pickFeedback } from "@/lib/challenge/feedback";
import { challengeStats, computeStandings, publicBoard } from "@/lib/challenge/leaderboard";
import { getChallengeStore } from "@/lib/challenge/store";
import { COUNTRY_OPTIONS, displayNameKey } from "@/lib/challenge/validate";

const numberFormat = new Intl.NumberFormat("en-GB");

export type ChallengeView = {
  available: boolean;
  data?: Awaited<ReturnType<typeof load>>;
};

/** Loads the board for /season. A database outage hides the board but keeps the page up. */
export async function loadChallengeView(): Promise<ChallengeView> {
  const store = getChallengeStore();
  if (!store) return { available: false };
  try {
    return { available: true, data: await load(store) };
  } catch (error) {
    console.error("challenge board failed to load", error instanceof Error ? error.message : "UnknownError");
    return { available: true };
  }
}

/** Season 1 community challenge on /season: how it works, the board, and the join form. */
export default function ChallengeSection({ view, feedback, runner }: { view: ChallengeView; feedback?: string; runner?: string }) {
  const { data } = view;
  const now = challengeNow();
  const open = openChallengeWindow(now);
  const next = nextChallengeWindow(now);
  const boardOpen = Boolean(data && data.stats.participants >= challenge.minParticipantsToShow);
  const presenter = findSeasonSpot("challenge-partner");
  const presentedBy = presenter?.status === "sold" ? presenter.sponsor : undefined;
  const notice = pickFeedback(joinFeedback, feedback);
  const runnerKey = runner ? displayNameKey(runner.slice(0, 40)) : undefined;
  const you = runnerKey ? data?.standings.find((s) => !s.participant.hidden && displayNameKey(s.participant.displayName) === runnerKey) : undefined;

  return (
    <section id="challenge" className="challenge mk-anchor" aria-labelledby="challenge-title">
      <AnimatedSection>
        <div className="chapter-head">
          <p className="chapter-head__marker">04 / The challenge</p>
          <h2 id="challenge-title" className="chapter-head__title">{challenge.name}.</h2>
        </div>
        <p className="challenge__lede">
          Run the season with me. Log a {challenge.test} at the start, then again every quarter when I retest.
          The board ranks how much you improve against yourself, not who is fastest. A 35-minute beginner can beat a 20-minute runner.
        </p>
        {presentedBy ? <p className="challenge__presented">Leaderboard presented by {presentedBy.url ? <a href={presentedBy.url}>{presentedBy.name}</a> : presentedBy.name}</p> : null}
      </AnimatedSection>

      <ol className="challenge__steps">
        <li><span className="challenge__step-num" aria-hidden="true">01</span><h3>Join</h3><p>Pick a display name. You get a personal link by email, no password.</p></li>
        <li><span className="challenge__step-num" aria-hidden="true">02</span><h3>Run 5 km</h3><p>Baseline from {formatWindowDates(challenge.windows[0])}. Then the same weeks in April, July, October and January.</p></li>
        <li><span className="challenge__step-num" aria-hidden="true">03</span><h3>Prove it</h3><p>Paste the public Strava link. The top of the board gets checked by hand before anyone wins.</p></li>
      </ol>

      {boardOpen && data ? (
        <div className="challenge__live" id="leaderboard">
          <dl className="challenge__stats">
            <div><dt>Runners</dt><dd>{numberFormat.format(data.stats.participants)}</dd></div>
            <div><dt>Countries</dt><dd>{numberFormat.format(data.stats.countries)}</dd></div>
            <div><dt>Km run</dt><dd>{numberFormat.format(data.stats.totalKm)}</dd></div>
          </dl>
          <p className="mk-evidence-note">
            {data.board.hasRetests
              ? `Ranked by improvement on the baseline. ${open ? `${open.label} window open until ${formatWindowDates(open).split(" to ")[1]}.` : next ? `Next window: ${formatWindowDates(next)}.` : "Season complete."}`
              : "Baselines are in. Ranks appear after the first retest in April."}
            {isChallengeDemo() ? " Preview: made-up runners." : ""}
          </p>
          <ChallengeLeaderboard host={data.board.host} rows={data.board.rows} you={you} caption={`${challenge.name} leaderboard`} />
          <form className="challenge__find" method="get" action="/season#leaderboard">
            <label className="contact-form__label" htmlFor="challenge-find">Find a runner</label>
            <div className="challenge__find-row">
              <input id="challenge-find" name="runner" className="contact-form__input" maxLength={24} defaultValue={runner} />
              <button type="submit" className="btn btn--secondary">Find</button>
            </div>
            {runner ? <p className="contact-form__privacy" role="status">{you ? `${you.participant.displayName}: ${you.rank ? `#${you.rank}` : "baseline logged, ranked after the first retest"}.` : "No runner on the board with that name."}</p> : null}
          </form>
          {data.board.more > 0 ? <p className="contact-form__privacy">Top {data.board.rows.length} shown, {numberFormat.format(data.board.more)} more on the climb.</p> : null}
        </div>
      ) : (
        <p className="challenge__soon">The board opens once {challenge.minParticipantsToShow} runners have joined. Join before {formatWindowDates(challenge.windows[0]).split(" to ")[1]} to be on it.</p>
      )}

      <div className="challenge__join">
        <div className="challenge__prizes">
          <h3 className="challenge__subhead">Prizes</h3>
          <ul className="mk-deliverables">{challenge.prizes.map((p) => <li key={p}>{p}</li>)}</ul>
          <p className="contact-form__privacy">
            Prizes come from the season&apos;s sponsors. Free to enter, 18 and over. Body scans are mine only, never on this board.{" "}
            <Link href="/season/challenge/rules">Read the rules</Link>.
          </p>
          {notice?.code === "deleted" ? <p className="contact-form__privacy" role="status">{notice.message}</p> : null}
        </div>
        <div id="join" className="mk-anchor">
          {view.available ? (
            <ChallengeJoinForm countries={COUNTRY_OPTIONS} feedback={feedback} />
          ) : (
            <p className="challenge__soon">{joinFeedback.unavailable}</p>
          )}
        </div>
      </div>
    </section>
  );
}

async function load(store: NonNullable<ReturnType<typeof getChallengeStore>>) {
  const [participants, results] = await Promise.all([store.listParticipants(), store.listResults()]);
  const standings = computeStandings(participants, results);
  return { standings, board: publicBoard(standings), stats: challengeStats(participants, results) };
}
