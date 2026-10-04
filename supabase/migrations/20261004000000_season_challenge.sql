-- Season 1 community challenge ("Climb with me").
-- The site talks to these tables only from the server, with the service role key.
-- Row level security is on with no policies, so the public anon key can read or write nothing.

create table if not exists public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  display_name text not null check (char_length(display_name) between 2 and 24),
  display_name_key text not null,
  country char(2) not null,
  newsletter boolean not null default false,
  is_host boolean not null default false,
  hidden boolean not null default false,
  prize_eligible boolean not null default false,
  created_at timestamptz not null default now(),
  constraint challenge_participants_name_key unique (display_name_key)
);

create table if not exists public.challenge_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.challenge_participants (id) on delete cascade,
  window_id text not null check (window_id in ('baseline', 'q1', 'q2', 'q3', 'finale')),
  time_seconds integer not null check (time_seconds between 600 and 7200),
  proof_url text not null check (char_length(proof_url) <= 300),
  proof_kind text not null check (proof_kind in ('strava', 'other')),
  status text not null default 'self_reported' check (status in ('self_reported', 'verified', 'flagged', 'rejected')),
  submitted_at timestamptz not null default now(),
  unique (participant_id, window_id)
);

create index if not exists challenge_results_participant_idx on public.challenge_results (participant_id);

alter table public.challenge_participants enable row level security;
alter table public.challenge_results enable row level security;

-- Joachim's own row, pinned on the board. Change the email before running if needed.
insert into public.challenge_participants (email, display_name, display_name_key, country, is_host)
values ('joachim@noobwork.no', 'Noobwork', 'noobwork', 'KR', true)
on conflict (email) do nothing;
