-- BURP — Internal Member CRM + Secret Santa
-- Run this in the Supabase SQL Editor (safe to re-run — everything is
-- "if not exists"). This is a standalone addition; it does not touch or
-- depend on any other tables besides Supabase's built-in auth.users.

create extension if not exists "pgcrypto";

-- --------------------------------------------------------
-- Internal Member CRM (admin-only roster)
-- Standalone directory of community members — independent of BURP site
-- accounts, since most people here won't have signed up. A row can
-- optionally be linked to a real account (linked_user_id) once known.
-- --------------------------------------------------------

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birthday_month int check (birthday_month between 1 and 12),
  birthday_day int check (birthday_day between 1 and 31),
  phone text,
  email text,
  notes text, -- freeform admin notes (interests, gift ideas, context, etc.)
  status text not null default 'active', -- 'active' | 'semi_active' | 'occasional' | 'inactive'
  linked_user_id uuid references auth.users(id) on delete set null, -- optional link to a real BURP account
  secret_santa_opt_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one CRM row per linked BURP account
create unique index if not exists idx_people_linked_user
  on public.people (linked_user_id) where linked_user_id is not null;

create index if not exists idx_people_status on public.people (status);
create index if not exists idx_people_name on public.people (full_name);

alter table public.people disable row level security;

-- --------------------------------------------------------
-- Secret Santa
-- --------------------------------------------------------

create table if not exists public.secret_santa_rounds (
  id uuid primary key default gen_random_uuid(),
  year int not null unique,
  is_active boolean not null default true, -- whether self-picking is currently open
  created_at timestamptz not null default now()
);

alter table public.secret_santa_rounds disable row level security;

create table if not exists public.secret_santa_assignments (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references secret_santa_rounds(id) on delete cascade,
  giver_person_id uuid not null references people(id) on delete cascade,
  recipient_person_id uuid not null references people(id) on delete cascade,
  assigned_method text not null, -- 'self_pick' | 'auto_match' | 'manual'
  created_at timestamptz not null default now(),
  constraint secret_santa_no_self_gift check (giver_person_id <> recipient_person_id),
  constraint secret_santa_one_gift_per_giver unique (round_id, giver_person_id),
  constraint secret_santa_one_gift_per_recipient unique (round_id, recipient_person_id)
);

alter table public.secret_santa_assignments disable row level security;
