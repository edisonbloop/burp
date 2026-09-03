-- BURP — Community Outreach Ideas, Comments & Voting
-- Run this in the Supabase SQL Editor (safe to re-run — everything is
-- "if not exists"). Standalone addition; no dependency on other tables.
--
-- Open access by design: no sign-in required to comment, submit ideas, or
-- vote. Voting duplication is limited by a client-side browser token
-- (voter_token), not a real identity check — reasonable for an internal
-- community poll, not bulletproof against a determined bad actor.

create extension if not exists "pgcrypto";

-- One row per outreach round (lets this be re-run for future initiatives).
create table if not exists public.outreach_rounds (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  phase       text not null default 'collecting', -- 'collecting' | 'poll_open' | 'closed'
  created_at  timestamptz not null default now(),
  constraint outreach_rounds_phase_check check (phase in ('collecting', 'poll_open', 'closed'))
);

alter table public.outreach_rounds disable row level security;

-- Ideas: both admin-curated shortlist entries and community-submitted ones.
create table if not exists public.outreach_ideas (
  id                 uuid primary key default gen_random_uuid(),
  round_id           uuid not null references public.outreach_rounds(id) on delete cascade,
  title              text not null,
  summary            text, -- short one-line focus statement
  description        text not null, -- full description (markdown-ish plain text, rendered with line breaks)
  is_shortlisted     boolean not null default false, -- true = one of the curated ideas in the poll
  display_order      int not null default 0,
  submitted_by_name  text, -- null for admin-seeded ideas; set for community submissions
  approved           boolean not null default true, -- admin-seeded default true; community submissions default false
  created_at         timestamptz not null default now()
);

alter table public.outreach_ideas disable row level security;

create index if not exists idx_outreach_ideas_round on public.outreach_ideas (round_id, approved, is_shortlisted, display_order);

-- Comments on any idea (curated or community-submitted). Open, attributed by name, not moderated.
create table if not exists public.outreach_comments (
  id          uuid primary key default gen_random_uuid(),
  idea_id     uuid not null references public.outreach_ideas(id) on delete cascade,
  name        text not null,
  comment     text not null,
  created_at  timestamptz not null default now()
);

alter table public.outreach_comments disable row level security;

create index if not exists idx_outreach_comments_idea on public.outreach_comments (idea_id, created_at);

-- Votes: one browser (voter_token) can vote once per idea per round.
create table if not exists public.outreach_votes (
  id           uuid primary key default gen_random_uuid(),
  round_id     uuid not null references public.outreach_rounds(id) on delete cascade,
  idea_id      uuid not null references public.outreach_ideas(id) on delete cascade,
  voter_token  text not null,
  created_at   timestamptz not null default now(),
  constraint outreach_votes_unique unique (round_id, idea_id, voter_token)
);

alter table public.outreach_votes disable row level security;

create index if not exists idx_outreach_votes_round on public.outreach_votes (round_id);
create index if not exists idx_outreach_votes_voter on public.outreach_votes (round_id, voter_token);
