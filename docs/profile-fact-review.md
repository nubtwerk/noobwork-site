# Profile fact review — 10 September 2026

This is a content review date, not a claim that every statistic was freshly audited in a platform dashboard.

## Published evidence

- The existing rounded channel milestones (195K+ subscribers and 150M+ lifetime views) remain conservative historical milestones. Public third-party snapshots showed approximately 196K and 152.3M; this release does not replace them with unauthenticated precision. Verify current figures directly in YouTube Studio before using them in a proposal.
- Three organic long-form examples use the public YouTube RSS feed observations saved on 10 September 2026: `lz2_509mw60` (4,694 views, published 12 July), `bpYeEbhdsuU` (9,617, 24 June), `iYDWoRI4yD8` (13,563, 20 June). These are lifetime views of individual videos, not 30/90-day audience reach or sponsored results. Source: https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ
- The RSS feed identifies channel creation on 10 February 2013. “On YouTube since 2013” avoids an automatically ageing year count.
- Forbes featured Joachim on 11 November 2022 and described Omaken’s NOK 150M financing. The article does not substantiate every earlier cumulative fundraising, revenue or profitability claim. Source: https://www.forbes.com/sites/mattgardner1/2022/11/11/truly-heroic-meet-the-inspirational-owner-of-norways-esports-powerhouse/
- Heroic was founded in Denmark in 2016, acquired by Omaken in February 2021, and Omaken was renamed Heroic Group in November 2021. The company’s 2023 notice establishes the historical CEO period. The copy therefore uses “founded Omaken, which acquired Heroic,” avoiding the implication that Joachim founded the original esports team. Source: https://mfn.se/notc/a/heroic-group/heroic-group-termination-of-mr-haraldsen-as-ceo-and-hiring-of-new-interim-ceo-new-board-of-directors-eeefacca

## Claims withheld pending evidence

The page no longer presents undated gender, age or geography percentages, an unqualified “largest” channel ranking, daily publishing, or unsupported cumulative business totals. For any future audience chart, retain the platform export, measurement period, channel and denominator. For company figures, retain the period, company boundary, accounting basis and currency conversion.

The book and award milestones were retained from the existing profile; supporting primary records still need to be added before presenting detailed editions, award categories or dates. Organic examples must not be labelled sponsor case studies without actual campaign evidence.

## How to update

Update the shared facts, visible pages and AI-context files together. Change `PROFILE_CONTENT_REVIEWED_AT` only after a human evidence review. Update `workViewsObservedAt` and every displayed example from the same dated observation.

### Studio recent reach (`recentReach`)

There is no live YouTube Studio API on this site. After each proposal-ready Studio check:

1. Open YouTube Studio → Analytics for the channel.
2. Copy conservative display strings for last-30-day views, last-90-day views, and a typical long-form view range from recent comparable uploads.
3. Paste them into `recentReach.metrics[].value` in `src/data/partnerships.ts` and set `recentReach.observedAt` to the review day (`YYYY-MM-DD`).
4. Leave values `null` (and `observedAt` null) rather than inventing numbers. Do not add undated demographics.

Until figures are pasted, `/media-kit` shows the reach block with placeholders so partners see the structure without fake data.
