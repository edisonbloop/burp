-- BURP — Thanksgiving potluck place cards
-- Run this in the Supabase SQL Editor (safe to re-run).
--
-- People RSVP at /thanksgiving. Each person is matched with someone else who
-- RSVP'd and writes one sentence they appreciate about them. That note is
-- printed, anonymously, on the back of their match's place card.
--
-- No sign-in: each RSVP gets a secret token kept in the person's own link
-- (and their browser), so they can come back to see their match. All access
-- goes through server code (service-role key), so RLS is on with no policies.

create extension if not exists "pgcrypto";

create table if not exists public.thanksgiving_rsvps (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,               -- secret, only in the person's own link
  name text not null,                       -- printed on the front of their card
  dish text,                                -- what they're bringing to the potluck
  target_id uuid references thanksgiving_rsvps(id) on delete set null, -- who they write for
  note text,                                -- their note about target_id
  note_updated_at timestamptz,
  extra_note text,                          -- an admin-written note for this person's card
  created_at timestamptz not null default now()
);

-- Matching gives everyone a different, unclaimed person where it can. When
-- nobody is left unclaimed, a newcomer writes for someone who already has a
-- writer (their card just gets two notes) so they never have to wait.
create index if not exists idx_thanksgiving_target
  on public.thanksgiving_rsvps (target_id);

create unique index if not exists idx_thanksgiving_name_unique
  on public.thanksgiving_rsvps (lower(name));

alter table public.thanksgiving_rsvps enable row level security;

-- One row of settings: whether RSVPs are open.
create table if not exists public.thanksgiving_settings (
  id int primary key default 1 check (id = 1),
  rsvps_open boolean not null default true
);
insert into public.thanksgiving_settings (id) values (1) on conflict (id) do nothing;
alter table public.thanksgiving_settings enable row level security;
