-- NEW dedicated sponsorship project only; never apply to the fitness database.
-- Contains schema only: no customer data or existing credentials are migrated.
-- Season sponsor bids. Applied once to the Supabase project behind SEASON_SUPABASE_URL.
-- The tables live in a schema PostgREST does not expose. The site reaches them
-- only through the three functions below, which require the server secret
-- (SEASON_DB_SECRET); the publishable key alone can read or write nothing.

-- Refuse an existing application database. This is a clean-project bootstrap,
-- not a migration of Future Worth tables or customer data.
do $$
begin
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
  ) or exists (
    select 1 from pg_namespace where nspname in ('private_coaching', 'railway_auth')
  ) then
    raise exception 'Season bidding requires a dedicated clean project';
  end if;
end $$;

create schema if not exists season_private;
revoke all on schema season_private from public, anon, authenticated;

create table if not exists season_private.bids (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null,
  amount integer not null check (amount > 0),
  brand text not null,
  category text not null,
  website text not null,
  contact_name text not null,
  email text not null,
  show_name boolean not null default false,
  status text not null check (status in ('unconfirmed', 'pending', 'approved', 'winner', 'rejected')),
  token_hash text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  decided_at timestamptz
);
create index if not exists bids_spot_idx on season_private.bids (spot_id);
create unique index if not exists bids_token_idx on season_private.bids (token_hash) where token_hash is not null;
alter table season_private.bids enable row level security;

create table if not exists season_private.api_secrets (secret_hash text primary key check (secret_hash ~ '^[a-f0-9]{64}$'));
revoke all on all tables in schema season_private from public, anon, authenticated;
alter table season_private.api_secrets enable row level security;
-- Set the secret once (run separately, never commit the value):
-- insert into season_private.api_secrets values (encode(sha256(convert_to('<SEASON_DB_SECRET>', 'UTF8')), 'hex'));

create or replace function season_private.check_secret(p_secret text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_secret is null or length(p_secret) < 32 or not exists (
    select 1 from season_private.api_secrets
    where secret_hash = encode(sha256(convert_to(p_secret, 'UTF8')), 'hex')
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;

create or replace function public.season_bids_list(p_secret text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform season_private.check_secret(p_secret);
  return coalesce((select jsonb_agg(to_jsonb(b) order by b.created_at) from season_private.bids b), '[]'::jsonb);
end $$;

create or replace function public.season_bids_insert(p_secret text, p_bid jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row season_private.bids;
begin
  perform season_private.check_secret(p_secret);
  insert into season_private.bids (spot_id, amount, brand, category, website, contact_name, email, show_name, status, token_hash)
  values (p_bid->>'spot_id', (p_bid->>'amount')::integer, p_bid->>'brand', p_bid->>'category', p_bid->>'website',
          p_bid->>'contact_name', p_bid->>'email', coalesce((p_bid->>'show_name')::boolean, false), 'unconfirmed', p_bid->>'token_hash')
  returning * into row;
  return to_jsonb(row);
end $$;

create or replace function public.season_bids_update(p_secret text, p_id uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row season_private.bids;
begin
  perform season_private.check_secret(p_secret);
  update season_private.bids set
    status = case when p_patch ? 'status' then p_patch->>'status' else status end,
    token_hash = case when p_patch ? 'token_hash' then p_patch->>'token_hash' else token_hash end,
    confirmed_at = case when p_patch ? 'confirmed_at' then (p_patch->>'confirmed_at')::timestamptz else confirmed_at end,
    decided_at = case when p_patch ? 'decided_at' then (p_patch->>'decided_at')::timestamptz else decided_at end
  where id = p_id
  returning * into row;
  return to_jsonb(row);
end $$;

revoke all on function season_private.check_secret(text) from public, anon, authenticated;
revoke all on function public.season_bids_list(text) from public, authenticated;
revoke all on function public.season_bids_insert(text, jsonb) from public, authenticated;
revoke all on function public.season_bids_update(text, uuid, jsonb) from public, authenticated;
grant execute on function public.season_bids_list(text) to anon;
grant execute on function public.season_bids_insert(text, jsonb) to anon;
grant execute on function public.season_bids_update(text, uuid, jsonb) to anon;
