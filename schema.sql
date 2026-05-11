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
