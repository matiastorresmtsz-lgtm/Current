-- Enable UUID extension
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text not null unique,
  username text not null,
  first_name text,
  last_name text,
  image_url text,
  score integer not null default 0 check (score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique,
  country text not null default 'US',
  currency text not null default 'USD',
  theme text default 'dark',
  goal_type text,
  goal_amount numeric(18,2) default 0,
  goal_deadline date,
  custom_goal_name text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_snapshots (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  holdings jsonb not null default '[]'::jsonb,
  currency text not null default 'USD',
  portfolio_value numeric(18,2) not null default 0,
  total_cost numeric(18,2) not null default 0,
  pnl numeric(18,2) not null default 0,
  is_latest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, updated_at)
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique,
  username text not null,
  avatar_url text,
  country text not null default 'US',
  portfolio_value numeric(18,2) not null default 0,
  change_24h numeric(18,2) not null default 0,
  win_rate numeric(18,2) not null default 0,
  rank integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_settings_user_id on public.user_settings(user_id);
create index if not exists idx_profiles_clerk_user_id on public.profiles(clerk_user_id);
create index if not exists idx_profiles_score on public.profiles(score desc, created_at asc);
create index if not exists idx_portfolio_snapshots_user_id on public.portfolio_snapshots(user_id);
create index if not exists idx_portfolio_snapshots_latest on public.portfolio_snapshots(user_id, is_latest, updated_at desc);
create index if not exists idx_leaderboard_entries_value on public.leaderboard_entries(portfolio_value desc, updated_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_portfolio_snapshots_updated_at
before update on public.portfolio_snapshots
for each row execute function public.set_updated_at();

create trigger trg_leaderboard_entries_updated_at
before update on public.leaderboard_entries
for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.leaderboard_entries enable row level security;

create policy "Users can view own settings"
on public.user_settings for select
using (auth.uid()::text = user_id);

drop policy if exists "Anyone can view profiles" on public.profiles;
create policy "Anyone can view profiles"
on public.profiles for select
using (true);

create policy "Users can upsert own settings"
on public.user_settings for insert
with check (auth.uid()::text = user_id);

create policy "Users can update own settings"
on public.user_settings for update
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

create policy "Users can view own snapshots"
on public.portfolio_snapshots for select
using (auth.uid()::text = user_id);

create policy "Users can insert own snapshots"
on public.portfolio_snapshots for insert
with check (auth.uid()::text = user_id);

create policy "Users can update own snapshots"
on public.portfolio_snapshots for update
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

create policy "Anyone can view leaderboard entries"
on public.leaderboard_entries for select
using (true);

create policy "Users can upsert own leaderboard entry"
on public.leaderboard_entries for insert
with check (auth.uid()::text = user_id);

create policy "Users can update own leaderboard entry"
on public.leaderboard_entries for update
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);
