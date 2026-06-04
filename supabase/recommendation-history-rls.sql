-- Run this in Supabase Dashboard → SQL Editor
-- Creates the recommendation_history table and RLS policies

-- 1. Create the table
create table if not exists public.recommendation_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt text not null,
  playlist jsonb not null,
  created_at timestamptz default now() not null
);

-- 2. Enable RLS
alter table public.recommendation_history enable row level security;

-- 3. Drop old policies if re-running (safe)
drop policy if exists "history_select_own" on public.recommendation_history;
drop policy if exists "history_insert_own" on public.recommendation_history;
drop policy if exists "history_delete_own" on public.recommendation_history;

-- 4. Users can only read their own rows
create policy "history_select_own"
on public.recommendation_history
for select
to authenticated
using (auth.uid() = user_id);

-- 5. Users can only insert with their own user_id
create policy "history_insert_own"
on public.recommendation_history
for insert
to authenticated
with check (auth.uid() = user_id);

-- 6. Users can only delete their own rows
create policy "history_delete_own"
on public.recommendation_history
for delete
to authenticated
using (auth.uid() = user_id);
