-- BURP — Admin/Leadership Assessment
-- Run this in the Supabase SQL Editor (safe to re-run — everything is
-- "if not exists"). Standalone addition; no dependency on other tables.
--
-- Fully anonymous by design: no submitter identity is captured anywhere.

create extension if not exists "pgcrypto";

-- One row per person who submits the form (the "envelope").
create table if not exists public.admin_assessments (
  id                  uuid primary key default gen_random_uuid(),
  overall_team_comment text,
  created_at          timestamptz not null default now()
);

alter table public.admin_assessments disable row level security;

-- One row per admin being rated, per submission (3 rows per submission).
create table if not exists public.admin_assessment_ratings (
  id              uuid primary key default gen_random_uuid(),
  assessment_id   uuid not null references public.admin_assessments(id) on delete cascade,
  admin_name      text not null, -- 'Adomaa' | 'Edison' | 'Obed'
  responsiveness  int not null check (responsiveness between 1 and 5),
  communication   int not null check (communication between 1 and 5),
  fairness        int not null check (fairness between 1 and 5),
  leadership      int not null check (leadership between 1 and 5),
  overall         int not null check (overall between 1 and 5),
  strength_text   text not null,
  growth_text     text not null,
  created_at      timestamptz not null default now()
);

-- If the table already exists from an earlier version, tighten these to required.
alter table public.admin_assessment_ratings alter column strength_text set not null;
alter table public.admin_assessment_ratings alter column growth_text set not null;

alter table public.admin_assessment_ratings disable row level security;

create index if not exists idx_admin_assessment_ratings_admin
  on public.admin_assessment_ratings (admin_name);
create index if not exists idx_admin_assessment_ratings_assessment
  on public.admin_assessment_ratings (assessment_id);
