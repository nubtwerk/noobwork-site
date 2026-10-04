# Community challenge ("Climb with me")

Followers run Season 1 with Joachim: a 5 km baseline in January 2027, then a retest in each quarterly window. The board on `/season` ranks percentage improvement against each runner's own baseline. Design and reasoning: the project's `community-challenge/design.md`.

## Where things live

| What | Where |
| --- | --- |
| Dates, thresholds, prizes, launch switch | `src/data/challenge.ts` |
| Ranking, review rules, winners | `src/lib/challenge/leaderboard.ts` |
| Storage (Supabase or demo) | `src/lib/challenge/store.ts`, schema in `supabase/migrations/` |
| Section on `/season` | `src/components/sections/ChallengeSection.tsx` |
| Runner's personal page | `/season/challenge/me?t=…` |
| Rules (draft) | `/season/challenge/rules` |
| Admin | `/season/admin/challenge` |

## Modes

- **Production**: hidden until `challenge.enabled` is `true`. Needs the database and secrets below.
- **Preview and local, no database**: demo mode. 64 made-up runners, no emails sent (the form shows the link instead), the clock fixed inside the first retest window, admin password `preview`. Changes live in server memory and reset on restart.
- **Any environment with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`**: real data, real emails.

## Going live

1. Legal review of `/season/challenge/rules`, then set `rulesReviewed: true` and confirm `prizeExcludedCountries`.
2. Create the Supabase project (shared with sponsor bidding if that lands first) and run the migration in `supabase/migrations/`.
3. Set in Vercel (Production): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CHALLENGE_SECRET` (32+ random characters), `SEASON_ADMIN_PASSWORD` (12+ characters). Resend is already configured for the contact form; confirmation emails need `SEASON_FROM_EMAIL` or `CONTACT_FROM_EMAIL` on a verified domain.
4. Set `enabled: true` in `src/data/challenge.ts` when `/season` goes public in mid-December.

`CHALLENGE_SECRET` signs every personal link. Changing it breaks every runner's link (they can get a new one by entering their email again).

## Each quarter (about 1 to 2 hours)

1. After the window closes, open `/season/admin/challenge`.
2. Work the **To review** list: held runs first, then unchecked runs in the top 20. Open the proof, check the date, distance and time, and the runner's earlier Strava runs. Verify or reject. Mark the runner prize-eligible when the history looks real.
3. **Prize winners** shows the top 3 verified, prize-eligible runners per window. Download the CSV and pass names and emails to the Challenge partner for prizes.
4. Name the winners (display names only) in the retest episode.

## Privacy

Stored: email, display name, country, run times, proof links, newsletter tick. Public: display name, country flag, times and change. Runners can delete themselves from their personal link. Delete all challenge data six months after the finale (July 2028): `truncate challenge_results, challenge_participants;`.

The newsletter tick is stored but not yet sent to Resend Contacts. Wire it to the follower list from the Season follow signup once that is merged.
