-- 100 Stones of Remembrance — Supabase schema
-- Run this in the Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.stones (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  display_name     text,
  contact          text,
  journey_word     text not null,
  scripture        text,
  remembrance      text not null,
  testimony        text,
  consent_public   boolean not null default false,
  anonymous        boolean not null default false,
  approved         boolean not null default false,
  featured         boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Disable Row Level Security — access is managed server-side via service role key
alter table public.stones disable row level security;

-- Optional: index for public stones query
create index if not exists idx_stones_public
  on public.stones (approved, consent_public, featured desc, created_at desc);

-- --------------------------------------------------------
-- Bible Discussions ("Talk it over") Schema
-- --------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.reading_plans(id) on delete cascade,
  day_number integer,
  title text not null,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid references public.discussions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles disable row level security;
alter table public.reading_plans disable row level security;
alter table public.discussions disable row level security;
alter table public.comments disable row level security;

-- --------------------------------------------------------
-- Content Library Schema
-- --------------------------------------------------------

-- Dynamic Topics Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

-- Content Library Items Table
create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'poems' | 'write-ups' | 'long-messages' | 'others'
  title text not null,
  excerpt text not null,
  content text not null,
  author text, -- null/empty maps to "Anonymous"
  topic text not null, -- topic tag name matching public.topics.name
  featured boolean not null default false,
  approved boolean not null default false, -- must be approved by admin before appearing publicly
  created_at timestamptz not null default now()
);

-- If the table already exists, add the approved column safely
alter table public.library_items add column if not exists approved boolean not null default false;

-- Disable Row Level Security on library tables
alter table public.topics disable row level security;
alter table public.library_items disable row level security;

-- Seed initial topics
insert into public.topics (name) values 
  ('Faith'), ('Perseverance'), ('Grace'), ('Prayer'), 
  ('Salvation'), ('Hope'), ('Love'), ('Obedience'), 
  ('Identity in Christ')
on conflict (name) do nothing;

