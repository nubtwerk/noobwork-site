-- Supabase schema for plants.noobwork.no
-- Run in Supabase SQL editor when PLANTS_STORE=supabase

create table if not exists rooms (
  id text primary key,
  name text not null,
  notes text
);

insert into rooms (id, name) values
  ('living-room', 'Living room'),
  ('bedroom', 'Bedroom'),
  ('kitchen', 'Kitchen'),
  ('balcony', 'Balcony')
on conflict (id) do nothing;

create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  species_id text not null,
  room_id text not null references rooms(id),
  acquired_at timestamptz,
  last_watered_at timestamptz not null,
  custom_interval_days int,
  pot_material text not null check (pot_material in ('plastic', 'terracotta', 'ceramic')),
  pot_size text not null check (pot_size in ('small', 'medium', 'large')),
  light_level text not null check (light_level in ('low', 'medium', 'bright')),
  photo_prompt_interval_days int not null default 21,
  last_photo_at timestamptz,
  next_photo_prompt_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists care_logs (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id) on delete cascade,
  task_type text not null check (task_type in ('water', 'fertilize', 'photo', 'snooze')),
  completed_at timestamptz not null,
  notes text
);

create table if not exists plant_photos (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id) on delete cascade,
  storage_path text not null,
  taken_at timestamptz not null,
  prompt_type text not null check (prompt_type in ('scheduled', 'manual', 'health_concern'))
);

create table if not exists photo_analyses (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references plant_photos(id) on delete cascade,
  plant_id uuid not null references plants(id) on delete cascade,
  model text not null,
  overall_health text not null check (overall_health in ('healthy', 'stressed', 'concerning')),
  confidence float not null,
  findings jsonb not null default '[]',
  watering_assessment text not null,
  light_assessment text not null,
  pests_detected boolean not null default false,
  follow_up_days int not null default 14,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_plants_room on plants(room_id);
create index if not exists idx_care_logs_plant on care_logs(plant_id, completed_at desc);
create index if not exists idx_photo_analyses_plant on photo_analyses(plant_id, created_at desc);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
