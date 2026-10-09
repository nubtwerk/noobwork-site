-- Season 1 community challenge ("Climb with me").
-- Applied to the dedicated Season project AFTER 20261004104045_season_clean_database.sql,
-- which creates the season_private schema and season_private.check_secret. Never apply
-- to the fitness database.
-- Same lock-down as bidding: the tables live in season_private, which the API does not
-- expose, and the site reaches them only through the functions below. Each one requires
-- the server secret (SEASON_DB_SECRET); the publishable key alone can read or write nothing.
-- No service role key is used.

do $$
begin
  if to_regprocedure('season_private.check_secret(text)') is null then
    raise exception 'Apply the Season bidding bootstrap (20261004104045) first';
  end if;
end $$;

create table if not exists season_private.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254),
  display_name text not null check (char_length(display_name) between 2 and 24),
  display_name_key text not null,
  country char(2) not null,
  newsletter boolean not null default false,
  is_host boolean not null default false,
  hidden boolean not null default false,
  prize_eligible boolean not null default false,
  created_at timestamptz not null default now(),
  constraint challenge_participants_email_key unique (email),
  constraint challenge_participants_name_key unique (display_name_key)
);

create table if not exists season_private.challenge_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references season_private.challenge_participants (id) on delete cascade,
  window_id text not null check (window_id in ('baseline', 'q1', 'q2', 'q3', 'finale')),
  time_seconds integer not null check (time_seconds between 600 and 7200),
  proof_url text not null check (char_length(proof_url) <= 300),
  proof_kind text not null check (proof_kind in ('strava', 'other')),
  status text not null default 'self_reported' check (status in ('self_reported', 'verified', 'flagged', 'rejected')),
  submitted_at timestamptz not null default now(),
  constraint challenge_results_window_key unique (participant_id, window_id)
);
create index if not exists challenge_results_participant_idx on season_private.challenge_results (participant_id);

alter table season_private.challenge_participants enable row level security;
alter table season_private.challenge_results enable row level security;
revoke all on season_private.challenge_participants, season_private.challenge_results from public, anon, authenticated;

-- Joachim's own row, pinned on the board. Change the email before running if needed.
insert into season_private.challenge_participants (email, display_name, display_name_key, country, is_host)
values ('joachim@noobwork.no', 'Noobwork', 'noobwork', 'KR', true)
on conflict do nothing;

/* ---------- Runners ---------- */

create or replace function public.challenge_participants_list(p_secret text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  return coalesce((select jsonb_agg(to_jsonb(p) order by p.created_at) from season_private.challenge_participants p), '[]'::jsonb);
end $$;

-- Look up one runner by id or by email (pass null for the other).
create or replace function public.challenge_participant_find(p_secret text, p_id uuid, p_email text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  return (select to_jsonb(p) from season_private.challenge_participants p
          where (p_id is not null and p.id = p_id) or (p_email is not null and p.email = p_email)
          limit 1);
end $$;

create or replace function public.challenge_name_taken(p_secret text, p_key text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  return exists (select 1 from season_private.challenge_participants where display_name_key = p_key);
end $$;

-- A duplicate email or name raises unique_violation naming the constraint; the API returns 409.
create or replace function public.challenge_participant_insert(p_secret text, p_row jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r season_private.challenge_participants;
begin
  perform season_private.check_secret(p_secret);
  insert into season_private.challenge_participants (email, display_name, display_name_key, country, newsletter)
  values (p_row->>'email', p_row->>'display_name', p_row->>'display_name_key', p_row->>'country',
          coalesce((p_row->>'newsletter')::boolean, false))
  returning * into r;
  return to_jsonb(r);
end $$;

-- Only the moderation flags can change.
create or replace function public.challenge_participant_update(p_secret text, p_id uuid, p_patch jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  update season_private.challenge_participants set
    hidden = case when p_patch ? 'hidden' then (p_patch->>'hidden')::boolean else hidden end,
    prize_eligible = case when p_patch ? 'prize_eligible' then (p_patch->>'prize_eligible')::boolean else prize_eligible end
  where id = p_id;
end $$;

-- GDPR erasure: results go with the runner (on delete cascade). The host row stays.
create or replace function public.challenge_participant_delete(p_secret text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  delete from season_private.challenge_participants where id = p_id and not is_host;
end $$;

/* ---------- Results ---------- */

create or replace function public.challenge_results_list(p_secret text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  return coalesce((select jsonb_agg(to_jsonb(r) order by r.submitted_at) from season_private.challenge_results r), '[]'::jsonb);
end $$;

-- One result per runner per window: a second submission in the same window replaces the first.
create or replace function public.challenge_result_save(p_secret text, p_row jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r season_private.challenge_results;
begin
  perform season_private.check_secret(p_secret);
  insert into season_private.challenge_results (participant_id, window_id, time_seconds, proof_url, proof_kind, status)
  values ((p_row->>'participant_id')::uuid, p_row->>'window_id', (p_row->>'time_seconds')::integer,
          p_row->>'proof_url', p_row->>'proof_kind', p_row->>'status')
  on conflict (participant_id, window_id) do update set
    time_seconds = excluded.time_seconds,
    proof_url = excluded.proof_url,
    proof_kind = excluded.proof_kind,
    status = excluded.status,
    submitted_at = now()
  returning * into r;
  return to_jsonb(r);
end $$;

create or replace function public.challenge_result_set_status(p_secret text, p_id uuid, p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  update season_private.challenge_results set status = p_status where id = p_id;
end $$;

/* ---------- Grants: only anon (the publishable key) may call, and only with the secret ---------- */

do $$
declare f text;
begin
  foreach f in array array[
    'public.challenge_participants_list(text)',
    'public.challenge_participant_find(text, uuid, text)',
    'public.challenge_name_taken(text, text)',
    'public.challenge_participant_insert(text, jsonb)',
    'public.challenge_participant_update(text, uuid, jsonb)',
    'public.challenge_participant_delete(text, uuid)',
    'public.challenge_results_list(text)',
    'public.challenge_result_save(text, jsonb)',
    'public.challenge_result_set_status(text, uuid, text)'
  ] loop
    execute format('revoke all on function %s from public, authenticated', f);
    execute format('grant execute on function %s to anon', f);
  end loop;
end $$;
