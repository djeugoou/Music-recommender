-- Run this in Supabase Dashboard → SQL Editor
-- Fixes: "new row violates row-level security policy for table favorites"

-- 1. Enable RLS on the table (safe if already enabled)
alter table public.favorites enable row level security;

-- 2. Remove old policies if you re-run this script (optional)
drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;
drop policy if exists "favorites_update_own" on public.favorites;

-- 3. Authenticated users can read only their rows
create policy "favorites_select_own"
on public.favorites
for select
to authenticated
using (auth.uid() = user_id);

-- 4. Authenticated users can insert only with their own user_id
create policy "favorites_insert_own"
on public.favorites
for insert
to authenticated
with check (auth.uid() = user_id);

-- 5. Authenticated users can delete only their rows
create policy "favorites_delete_own"
on public.favorites
for delete
to authenticated
using (auth.uid() = user_id);

-- 6. Optional: allow update (if you add edit later)
create policy "favorites_update_own"
on public.favorites
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Verify: user_id column type should be uuid referencing auth.users(id)
-- alter table public.favorites
--   alter column user_id type uuid using user_id::uuid;
