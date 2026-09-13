# Noobwork

Joachim Haraldsen’s creator website and partnership inquiry page, built with Next.js 16, React 19 and TypeScript. The existing Newake / Inter typography and colour system are documented in `DESIGN.md`.

## Local development and verification

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

### Browser E2E (Playwright)

Partnership-funnel coverage lives in `e2e/`. CI runs it with `CONTACT_EMAIL_MODE=stub` so Resend is never called.

```sh
npm ci
npm run test:e2e:install   # once per machine
npm run build
CONTACT_EMAIL_MODE=stub npm run test:e2e
```

Playwright starts `npm run start` against the production build. With a server already on port 3000, local runs reuse it (`reuseExistingServer`). Desktop and mobile Chromium projects share the same funnel specs.

The root website and `plants/` are independent Next.js applications with separate dependencies, TypeScript aliases and builds. Root tooling excludes Plants; GitHub Actions checks both applications separately (plus root Playwright E2E) before its aggregate `test` check succeeds. Run the same commands inside `plants/` when changing that application.

The website prebuild refreshes its YouTube feed, keeping the committed fallback if YouTube is unavailable. It does not refresh the manually reviewed partnership examples or factual review date.

## Partnership content

- `src/data/partnerships.ts`: the three inquiry formats, dated organic work examples, and `recentReach` (YouTube Studio paste target for the media-kit block).
- `src/data/profile-facts.ts`: shared profile milestones and explicit content review date.
- `src/content/ai-context/`: the same positioning in machine-readable profile content.
- `docs/profile-fact-review.md`: evidence, limitations and review checklist (includes Studio reach update steps).
- `docs/partnership-operations.md`: qualification, proposals, reporting and measurement.
- `docs/partnership-pipeline-template.csv`: private monthly CRM template — copy out of the repo; never commit real prospects.

## Contact form

Copy `.env.example` to `.env.local`. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and a verified `CONTACT_FROM_EMAIL` in the deployment environment. An unconfigured sender produces a visible error and email fallback. Never commit credentials.

The form supports JavaScript and native POST submissions. Native errors render the escaped draft in a non-cacheable response so it can be corrected or retried; success uses a redirect containing only a result code. The API caps the actual streamed body at 64 KB, validates field sizes and rejects cross-site browser submissions. Its in-memory rate limit is per server instance, so use edge rate limiting if production traffic requires a global limit.

Unit tests mock email delivery. Playwright E2E uses `CONTACT_EMAIL_MODE=stub` so the API returns success without calling Resend. A passing form test proves the request and feedback paths, not provider or inbox delivery. Do not submit live test inquiries without explicit authorization to send a message.

## Analytics

Custom partnership events send only the event names and allowlisted offer/source labels defined in `src/lib/partnership-analytics.ts` to Vercel Analytics (`partnership_cta_clicked`, `partnership_offer_selected`, `inquiry_started`, `inquiry_submitted`, `inquiry_failed`, `inquiry_rate_limited`). Names, emails, budgets, timing, message contents and UTM/`ref` values are excluded from these custom events; allowlisted UTMs are added to the inquiry email body only. Custom events require a Vercel plan that supports them; verify receipt in the project dashboard before relying on conversion reports. JavaScript-disabled visits do not emit these custom events.

## Deployment

The root website uses Vercel Git integration. Verify the deployment commit and custom-domain alias after release, as a failed latest deployment can leave the previous successful version live. Plants deployment is a separate opt-in workflow documented in `plants/README.md`.
