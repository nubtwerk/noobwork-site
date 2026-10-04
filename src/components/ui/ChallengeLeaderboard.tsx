import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import type { Standing } from "@/lib/challenge/leaderboard";
import { formatImprovement } from "@/lib/challenge/leaderboard";
import { countryFlag, countryName, formatRunTime } from "@/lib/challenge/validate";

function Row({ standing, highlight }: { standing: Standing; highlight?: "host" | "you" }) {
  const { participant, baseline, latest, improvementPct, verified, rank } = standing;
  return (
    <tr className={highlight ? `challenge-board__row challenge-board__row--${highlight}` : "challenge-board__row"}>
      <td className="challenge-board__rank">{rank ?? "–"}</td>
      <th scope="row" className="challenge-board__runner">
        <span className="challenge-board__flag" role="img" aria-label={countryName(participant.country)}>{countryFlag(participant.country)}</span>
        <span className="challenge-board__name">{participant.displayName}</span>
        {highlight === "host" ? <span className="challenge-board__tag">Host</span> : null}
      </th>
      <td className="challenge-board__time challenge-board__col-optional">{formatRunTime(baseline.timeSeconds)}</td>
      <td className="challenge-board__time challenge-board__col-optional">{latest ? formatRunTime(latest.timeSeconds) : "–"}</td>
      <td className="challenge-board__change">
        <span className={improvementPct !== undefined && improvementPct > 0 ? "challenge-board__up" : undefined}>
          {improvementPct === undefined ? "–" : formatImprovement(improvementPct)}
        </span>
        {verified ? (
          <SealCheck className="challenge-board__verified" weight="fill" aria-label="Verified" role="img" />
        ) : (
          <span className="challenge-board__self">Self-reported</span>
        )}
      </td>
    </tr>
  );
}

/** The public board: Joachim pinned on top, then the top runners by improvement. */
export default function ChallengeLeaderboard({
  host,
  rows,
  you,
  caption,
}: {
  host?: Standing;
  rows: Standing[];
  you?: Standing;
  caption: string;
}) {
  const youShown = you && rows.some((r) => r.participant.id === you.participant.id);
  return (
    <div className="challenge-board">
      <table className="challenge-board__table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="challenge-board__rank">#</th>
            <th scope="col">Runner</th>
            <th scope="col" className="challenge-board__col-optional">Baseline</th>
            <th scope="col" className="challenge-board__col-optional">Latest</th>
            <th scope="col" className="challenge-board__change">Change</th>
          </tr>
        </thead>
        <tbody>
          {host ? <Row standing={host} highlight="host" /> : null}
          {rows.map((s) => (
            <Row key={s.participant.id} standing={s} highlight={you?.participant.id === s.participant.id ? "you" : undefined} />
          ))}
          {you && !youShown && !you.participant.isHost ? <Row standing={you} highlight="you" /> : null}
        </tbody>
      </table>
    </div>
  );
}
