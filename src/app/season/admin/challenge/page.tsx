import "@/styles/challenge.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { challenge, findChallengeWindow, isChallengeVisible, windowIndex, type ChallengeWindowId } from "@/data/challenge";
import { ADMIN_COOKIE, adminPassword, isAdminSession } from "@/lib/challenge/admin";
import { isChallengeDemo } from "@/lib/challenge/env";
import { computeStandings, formatImprovement, improvementPct, windowWinners } from "@/lib/challenge/leaderboard";
import { getChallengeStore, type Participant, type RunResult } from "@/lib/challenge/store";
import { countryFlag, formatRunTime } from "@/lib/challenge/validate";

export const metadata: Metadata = {
  title: "Challenge admin",
  robots: { index: false, follow: false },
  referrer: "same-origin",
};

const REVIEW_TOP = 20;
const RETESTS = challenge.windows.filter((w) => w.id !== "baseline");

type Query = Record<string, string | string[] | undefined>;
export default async function ChallengeAdmin({ searchParams }: { searchParams?: Promise<Query> }) {
  if (!isChallengeVisible()) notFound();
  const query = await searchParams ?? {};
  const jar = await cookies();
  const store = getChallengeStore();

  if (!isAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    return (
      <AdminShell>
        <h1 className="challenge-admin__title">Challenge admin</h1>
        {!adminPassword() ? <p className="contact-form__error">Set SEASON_ADMIN_PASSWORD (12 characters or more) in Vercel to use this page.</p> : null}
        {query.login === "failed" ? <p className="contact-form__error" role="alert">Wrong password.</p> : null}
        {query.login === "limited" ? <p className="contact-form__error" role="alert">Too many attempts. Wait 15 minutes.</p> : null}
        {isChallengeDemo() ? <p className="contact-form__privacy">Preview with demo data. The password is &quot;preview&quot;.</p> : null}
        <form className="contact-form challenge-admin__login" method="post" action="/api/season/challenge/admin/login">
          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="admin-password">Password</label>
            <input id="admin-password" name="password" type="password" className="contact-form__input" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn--primary contact-form__submit">Sign in</button>
        </form>
      </AdminShell>
    );
  }

  if (!store) {
    return (
      <AdminShell>
        <h1 className="challenge-admin__title">Challenge admin</h1>
        <p>No database is configured yet.</p>
      </AdminShell>
    );
  }

  const [participants, results] = await Promise.all([store.listParticipants(), store.listResults()]);
  const byId = new Map(participants.map((p) => [p.id, p]));
  const baselineOf = new Map(results.filter((r) => r.windowId === "baseline").map((r) => [r.participantId, r]));
  const standings = computeStandings(participants, results);
  const topIds = new Set(standings.filter((s) => s.rank !== undefined && !s.participant.isHost).slice(0, REVIEW_TOP).map((s) => s.participant.id));
  // Held runs, plus anything unchecked from the current top 20.
  const toReview = results
    .filter((r) => r.status === "flagged" || (r.status === "self_reported" && topIds.has(r.participantId)))
    .sort((a, b) => Number(b.status === "flagged") - Number(a.status === "flagged") || windowIndex(b.windowId) - windowIndex(a.windowId));
  const done = typeof query.done === "string" ? query.done : undefined;

  return (
    <AdminShell>
      <div className="challenge-admin__head">
        <h1 className="challenge-admin__title">Challenge admin</h1>
        <form method="post" action="/api/season/challenge/admin/logout"><button type="submit" className="btn btn--secondary">Sign out</button></form>
      </div>
      <p className="contact-form__privacy">
        {participants.length} runners, {results.length} runs. {isChallengeDemo() ? "Preview with demo data: changes reset when the server restarts." : ""}
        {done ? <span role="status"> {done === "failed" ? "That didn't work. Try again." : "Saved."}</span> : null}
      </p>

      <section aria-labelledby="review-title" className="challenge-admin__section">
        <h2 id="review-title" className="challenge-page__subtitle">To review ({toReview.length})</h2>
        <p className="contact-form__privacy">
          Held runs first, then unchecked runs from the top {REVIEW_TOP}. Open the proof, check the date, distance and time, and the runner&apos;s earlier Strava runs.
          Mark the runner prize-eligible once the history looks real.
        </p>
        {toReview.length === 0 ? <p>Nothing to review.</p> : (
          <div className="challenge-board challenge-admin__scroll">
            <table className="challenge-board__table challenge-admin__table">
              <caption className="sr-only">Runs to review</caption>
              <thead><tr><th scope="col">Runner</th><th scope="col">Window</th><th scope="col">Time</th><th scope="col">Change</th><th scope="col">Proof</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
              <tbody>
                {toReview.map((r) => <ReviewRow key={r.id} run={r} runner={byId.get(r.participantId)} baseline={baselineOf.get(r.participantId)} />)}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="winners-title" className="challenge-admin__section">
        <h2 id="winners-title" className="challenge-page__subtitle">Prize winners</h2>
        <p className="contact-form__privacy">Top 3 per window: verified Strava runs from prize-eligible runners. The host is never a winner.</p>
        <div className="challenge-admin__winners">
          {RETESTS.map((w) => {
            const winners = windowWinners(participants, results, w.id);
            return (
              <div key={w.id} className="challenge-admin__winner-card">
                <h3>{w.label}</h3>
                {winners.length ? (
                  <ol>{winners.map((s) => <li key={s.participant.id}>{s.participant.displayName} · {formatImprovement(s.improvementPct!)}</li>)}</ol>
                ) : <p className="contact-form__privacy">No verified winners yet.</p>}
                {winners.length ? <a href={`/api/season/challenge/admin/export?window=${w.id}`} className="back-link">Download CSV with emails</a> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="runners-title" className="challenge-admin__section">
        <details>
          <summary><h2 id="runners-title" className="challenge-page__subtitle challenge-admin__summary">All runners ({participants.length})</h2></summary>
          <div className="challenge-board challenge-admin__scroll">
            <table className="challenge-board__table challenge-admin__table">
              <caption className="sr-only">All runners</caption>
              <thead><tr><th scope="col">Runner</th><th scope="col">Email</th><th scope="col">Runs</th><th scope="col">Updates</th><th scope="col">Actions</th></tr></thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} id={`row-${p.id}`}>
                    <th scope="row">{countryFlag(p.country)} {p.displayName}{p.isHost ? " (host)" : ""}{p.hidden ? " · hidden" : ""}</th>
                    <td className="challenge-admin__email">{p.email}</td>
                    <td>{results.filter((r) => r.participantId === p.id).length}</td>
                    <td>{p.newsletter ? "Yes" : "No"}</td>
                    <td><RunnerActions runner={p} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </AdminShell>
  );
}

function ReviewRow({ run, runner, baseline }: { run: RunResult; runner?: Participant; baseline?: RunResult }) {
  if (!runner) return null;
  const change = baseline && run.windowId !== "baseline" ? formatImprovement(improvementPct(baseline.timeSeconds, run.timeSeconds)) : "–";
  return (
    <tr id={`row-${run.id}`} className={run.status === "flagged" ? "challenge-admin__flagged" : undefined}>
      <th scope="row">
        {countryFlag(runner.country)} {runner.displayName}
        <span className="challenge-admin__meta">{runner.prizeEligible ? "Prize-eligible" : "Not yet eligible"}</span>
      </th>
      <td>{findChallengeWindow(run.windowId as ChallengeWindowId).label}</td>
      <td className="challenge-board__time">{formatRunTime(run.timeSeconds)}</td>
      <td className="challenge-board__time">{change}</td>
      <td><a href={run.proofUrl} target="_blank" rel="noopener noreferrer nofollow">{run.proofKind === "strava" ? "Strava" : "Other link"}</a></td>
      <td>{run.status === "flagged" ? "Held" : "Self-reported"}</td>
      <td>
        <div className="challenge-admin__actions">
          <Action action="verify" id={run.id} label="Verify" />
          <Action action="reject" id={run.id} label="Reject" />
          <Action action={runner.prizeEligible ? "ineligible" : "eligible"} id={runner.id} label={runner.prizeEligible ? "Not eligible" : "Eligible"} />
        </div>
      </td>
    </tr>
  );
}

function RunnerActions({ runner }: { runner: Participant }) {
  return (
    <div className="challenge-admin__actions">
      <Action action={runner.hidden ? "show" : "hide"} id={runner.id} label={runner.hidden ? "Show" : "Hide name"} view="runners" />
      <Action action={runner.prizeEligible ? "ineligible" : "eligible"} id={runner.id} label={runner.prizeEligible ? "Not eligible" : "Eligible"} view="runners" />
    </div>
  );
}

function Action({ action, id, label, view = "review" }: { action: string; id: string; label: string; view?: string }) {
  return (
    <form method="post" action="/api/season/challenge/admin">
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="view" value={view} />
      <button type="submit" className="challenge-admin__button">{label}</button>
    </form>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="challenge-admin">
      <div className="challenge-admin__inner">{children}</div>
    </main>
  );
}
