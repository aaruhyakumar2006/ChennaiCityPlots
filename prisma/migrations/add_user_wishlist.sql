-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--
-- Creates the user_wishlist table so saved plots persist across devices
-- when users are logged in.

create table if not exists public.user_wishlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, property_id)
);

-- Only the owning user can read/write their wishlist
alter table public.user_wishlist enable row level security;

create policy "Users can view their own wishlist"
  on public.user_wishlist for select
  using (auth.uid() = user_id);

create policy "Users can add to their wishlist"
  on public.user_wishlist for insert
  with check (auth.uid() = user_id);

create policy "Users can remove from their wishlist"
  on public.user_wishlist for delete
  using (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists idx_user_wishlist_user_id on public.user_wishlist(user_id);
