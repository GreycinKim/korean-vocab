-- Run in Supabase: SQL Editor → New query → paste → Run

create table if not exists public.user_vocab (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_vocab enable row level security;

create policy "Users read own vocab"
  on public.user_vocab for select
  using (auth.uid() = user_id);

create policy "Users insert own vocab"
  on public.user_vocab for insert
  with check (auth.uid() = user_id);

create policy "Users update own vocab"
  on public.user_vocab for update
  using (auth.uid() = user_id);
