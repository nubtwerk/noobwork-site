import type { Participant, RunResult } from "./store";

/**
 * Made-up runners for previews and local runs, so the board can be reviewed
 * before anyone joins. Never used when a database is configured.
 */
const FIRST = ["Minji", "Ola", "Sora", "Jonas", "Hana", "Kai", "Ingrid", "Tae", "Lea", "Marco", "Yuna", "Erik", "Aiko", "Sam", "Nora", "Jin", "Lukas", "Mia", "Dae", "Sofie", "Ravi", "Emma", "Hyun", "Leo"];
const COUNTRIES = ["KR", "NO", "SE", "DK", "US", "GB", "DE", "JP", "NL", "CA", "AU", "FI", "SG", "PH", "IN", "FR"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function demoSeed(): { participants: Participant[]; results: RunResult[] } {
  const random = rng(20270101);
  const participants: Participant[] = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      email: "joachim@noobwork.no",
      displayName: "Noobwork",
      country: "KR",
      newsletter: false,
      isHost: true,
      hidden: false,
      prizeEligible: false,
      createdAt: "2026-12-15T00:00:00.000Z",
    },
  ];
  const results: RunResult[] = [
    { id: "r-host-b", participantId: participants[0].id, windowId: "baseline", timeSeconds: 27 * 60 + 40, proofUrl: "https://www.strava.com/activities/1", proofKind: "strava", status: "verified", submittedAt: "2027-01-02T00:00:00.000Z" },
    { id: "r-host-1", participantId: participants[0].id, windowId: "q1", timeSeconds: 25 * 60 + 52, proofUrl: "https://www.strava.com/activities/2", proofKind: "strava", status: "verified", submittedAt: "2027-04-02T00:00:00.000Z" },
  ];

  for (let i = 0; i < 63; i++) {
    const id = `00000000-0000-4000-8000-${String(i + 2).padStart(12, "0")}`;
    const name = `${FIRST[i % FIRST.length]} ${String.fromCharCode(65 + ((i * 7) % 26))}${i >= FIRST.length ? i : ""}`.trim();
    participants.push({
      id,
      email: `runner${i}@example.com`,
      displayName: name,
      country: COUNTRIES[Math.floor(random() * COUNTRIES.length)],
      newsletter: random() > 0.5,
      isHost: false,
      hidden: false,
      prizeEligible: random() > 0.3,
      createdAt: `2026-12-${String(15 + (i % 14)).padStart(2, "0")}T00:00:00.000Z`,
    });
    const baseline = Math.round(20 * 60 + random() * 22 * 60);
    results.push({ id: `r-${i}-b`, participantId: id, windowId: "baseline", timeSeconds: baseline, proofUrl: `https://www.strava.com/activities/${1000 + i}`, proofKind: "strava", status: random() > 0.4 ? "verified" : "self_reported", submittedAt: `2027-01-0${1 + (i % 9)}T00:00:00.000Z` });
    // Most runners log the first retest; a few improve suspiciously fast and sit in review.
    if (i % 9 !== 8) {
      const flagged = i % 17 === 5;
      const gain = flagged ? 0.3 : random() * 0.16 - 0.02;
      results.push({ id: `r-${i}-1`, participantId: id, windowId: "q1", timeSeconds: Math.round(baseline * (1 - gain)), proofUrl: i % 6 === 3 ? "https://photos.example.com/treadmill.jpg" : `https://www.strava.com/activities/${5000 + i}`, proofKind: i % 6 === 3 ? "other" : "strava", status: flagged ? "flagged" : random() > 0.5 ? "verified" : "self_reported", submittedAt: `2027-04-0${1 + (i % 4)}T00:00:00.000Z` });
    }
  }
  return { participants, results };
}
