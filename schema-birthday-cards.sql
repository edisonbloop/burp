-- BURP — Birthday Cards
-- Run this in the Supabase SQL Editor (safe to re-run).
--
-- A group birthday card: an organiser creates it (honoree's name + photos),
-- shares a link, and everyone adds a message (and optionally a photo). The
-- organiser approves each message, then the honoree opens an animated card
-- with all the wishes.
--
-- Starting a card needs a signed-in member; signing one only needs the
-- link, so friends outside BURP can add a message. The organiser manages
-- the card with a secret manage_key that only lives in their private
-- manage link. All access goes
-- through server code (service-role key), so RLS is on with no policies.

create extension if not exists "pgcrypto";

create table if not exists public.birthday_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,              -- short public id used in /birthday/<slug>
  manage_key text not null,               -- secret, only in the organiser's manage link
  honoree_name text not null,
  birthday date,                          -- optional; the date shown on the card
  turning_age int check (turning_age between 1 and 130),
  headline text,                          -- optional custom headline
  organiser_name text not null,
  organiser_note text,                    -- the organiser's own message, shown first
  photo_urls text[] not null default '{}',-- photos of the honoree (max 12)
  theme text not null default 'gold',     -- 'gold' | 'blush' | 'midnight' | 'garden'
  accepting_messages boolean not null default true,
  created_at timestamptz not null default now()
);

-- Optional link to the CRM roster, so the create page can pre-fill people
-- with known birthdays and spot a card that's already been started.
alter table public.birthday_cards
  add column if not exists person_id uuid references people(id) on delete set null;

-- Only signed-in members can start a card; remember who did.
alter table public.birthday_cards
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists idx_birthday_cards_person
  on public.birthday_cards (person_id, created_at);

create table if not exists public.birthday_card_messages (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references birthday_cards(id) on delete cascade,
  author_name text not null,
  message text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Messages stay hidden from the card until the organiser approves them.
alter table public.birthday_card_messages
  add column if not exists approved boolean not null default false;

create index if not exists idx_birthday_messages_card
  on public.birthday_card_messages (card_id, created_at);

alter table public.birthday_cards enable row level security;
alter table public.birthday_card_messages enable row level security;

-- Storage bucket for card photos. Public read; uploads happen in server code
-- (service role), so no insert policy is needed.
insert into storage.buckets (id, name, public)
values ('birthday', 'birthday', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and policyname = 'Public read birthday photos'
  ) then
    create policy "Public read birthday photos"
      on storage.objects for select
      using (bucket_id = 'birthday');
  end if;
end $$;
