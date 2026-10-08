# Dedicated Season bidding database

Season bidding requires a new dedicated Supabase project. Do not clone the fitness database or copy its customer data, Auth users, Storage files or credentials. The retiring fitness endpoint is explicitly rejected, and missing or invalid hosted configuration keeps bidding unavailable. Local memory/demo mode is development-only.

## Project and schema setup

Create an empty project in a separate Free organization when Free eligibility is available. Free may pause after a week of inactivity and lacks automatic daily backups; decide availability and restricted manual export requirements before opening live bidding. Keep existing paid organizations unchanged.

During project creation, keep Data API enabled, disable automatic exposure of new tables and enable automatic RLS. Generate/save the database password privately and submit personally; never put credentials in chat or source control.

After approving hosted schema/access configuration, apply `supabase/migrations/20261004104045_season_clean_database.sql` (equivalent to `supabase/season-bids.sql`) only to the new project. The bootstrap rejects existing public application tables and known fitness schemas. It creates private bids and a secret-hash table with RLS and explicit table revocations; three public RPCs use pinned empty search paths and require the server secret. Keep `season_private` outside the API exposed schemas.

Create a fresh server secret of at least 32 random characters after approval, and store only its SHA-256 in `season_private.api_secrets` through a parameterized operation. Do not retrieve or reuse the retiring project's hash or secret. No service-role key is required.

## Server configuration

Set these only in approved server-side provider inputs/scopes:

- `SEASON_SUPABASE_PROJECT_REF`: the new 20-letter project ref.
- `SEASON_SUPABASE_URL`: exactly `https://<project-ref>.supabase.co`.
- `SEASON_SUPABASE_KEY`: the new project's `sb_publishable_` key.
- `SEASON_DB_SECRET`: the fresh 32+ character secret whose hash is stored in the new project.
- `SEASON_ADMIN_PASSWORD`: a fresh password, 16+ characters recommended (runtime minimum 12).
- `SEASON_FROM_EMAIL`: a sender on a verified Resend domain; defaults to `CONTACT_FROM_EMAIL` when unset.

Existing `RESEND_API_KEY` and contact recipient configuration remain necessary for email. Never use `NEXT_PUBLIC_` prefixes for credentials. Preview scopes must be chosen explicitly; avoid giving every preview production data access.

The independent follower signup feature uses `SEASON_FOLLOW_SECRET` and `SEASON_FROM_EMAIL`, with no database dependency. Changing that signing secret invalidates outstanding follow-confirmation links.

## Verification and release

Before deployment, verify empty application tables, security advisors, denied anonymous direct reads, missing/wrong-secret RPC denial, synthetic bid submission/confirmation/admin review, and public-board privacy. Verify the deployed endpoint and credentials belong to the new project.

Bidding ships together with the follower signup in one release. Rebuilding current production does not merge unmerged features. Review and approve the actual combined release before promoting it. Leave the retiring database active until replacement verification, consumer review, retention/export and restore validation are complete; permanent deletion needs final explicit confirmation. Database backups exclude Storage objects.

Local checks cover configuration boundaries, sender selection and schema privileges. Hosted gateway/default privileges and the complete live flow still need provider verification.
