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

-- --------------------------------------------------------
-- BURP Sharehouse (Community Care Platform) Schema
-- --------------------------------------------------------

create table if not exists public.sharehouse_needs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null, -- 'financial' | 'medical' | 'job' | 'education' | 'emotional' | 'practical' | 'other'
  full_name text not null, -- real name of the submitter, stored for verification
  anonymous boolean not null default false, -- if true, display name will be "Anonymous"
  contact_info text not null, -- email, phone or messenger details
  evidence_url text, -- optional link to backing document or verification materials
  approved boolean not null default false, -- whether need is approved by admin to appear publicly
  featured boolean not null default false, -- whether need is featured
  status text not null default 'active', -- 'active' | 'met' | 'resolved'
  update_testimony text, -- testimony/update added once need is met
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Disable Row Level Security as with other tables — server-side queries handle access
alter table public.sharehouse_needs disable row level security;


-- --------------------------------------------------------
-- BURP Bulletin (Members' Board) Schema
-- Members post events, promotions, products & services for the community.
-- --------------------------------------------------------

create table if not exists public.bulletin_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null, -- owner (null for anonymous posts); lets members edit their own
  category text not null, -- 'event' | 'promotion' | 'product' | 'service'
  title text not null,
  description text not null,
  full_name text not null, -- name of the member posting
  business_name text, -- optional business / ministry name
  contact_info text not null, -- how the community can reach or buy from them
  link_url text, -- optional website / shop / social / registration link
  image_url text, -- optional flyer / photo (stored in the 'bulletin' storage bucket)
  video_url text, -- optional video link (YouTube, Vimeo, etc.)
  price text, -- optional freeform price e.g. "₦5,000", "Free", "From $20"
  location text, -- optional location / service area
  event_date timestamptz, -- optional, mainly for events
  approved boolean not null default false, -- must be approved by admin before appearing publicly
  featured boolean not null default false, -- whether the post is pinned / featured
  status text not null default 'active', -- 'active' | 'expired' | 'closed'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If the table already exists, add the owner column safely
alter table public.bulletin_posts add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Disable Row Level Security as with other tables — server-side queries handle access
alter table public.bulletin_posts disable row level security;

create index if not exists idx_bulletin_public
  on public.bulletin_posts (approved, status, featured desc, created_at desc);


-- --------------------------------------------------------
-- Facilitating Timetable (single-row weekly schedule)
-- Admin sets who facilitates each day; signed-in members view it.
-- --------------------------------------------------------

create table if not exists public.facilitation_timetable (
  id int primary key default 1,
  monday text,
  tuesday text,
  wednesday text,
  thursday text,
  friday text,
  saturday text,
  sunday text,
  monday_user_id uuid,
  tuesday_user_id uuid,
  wednesday_user_id uuid,
  thursday_user_id uuid,
  friday_user_id uuid,
  saturday_user_id uuid,
  sunday_user_id uuid,
  note text,
  updated_at timestamptz not null default now(),
  constraint facilitation_timetable_single_row check (id = 1)
);

-- If the table already exists, add the per-day member links safely
alter table public.facilitation_timetable add column if not exists monday_user_id uuid;
alter table public.facilitation_timetable add column if not exists tuesday_user_id uuid;
alter table public.facilitation_timetable add column if not exists wednesday_user_id uuid;
alter table public.facilitation_timetable add column if not exists thursday_user_id uuid;
alter table public.facilitation_timetable add column if not exists friday_user_id uuid;
alter table public.facilitation_timetable add column if not exists saturday_user_id uuid;
alter table public.facilitation_timetable add column if not exists sunday_user_id uuid;

-- Seed the single row
insert into public.facilitation_timetable (id) values (1) on conflict (id) do nothing;

alter table public.facilitation_timetable disable row level security;


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

-- Storage bucket for bulletin flyers/photos.
-- Public read; uploads are restricted to signed-in members.
insert into storage.buckets (id, name, public)
values ('bulletin', 'bulletin', true)
on conflict (id) do nothing;

create policy "Public read bulletin flyers"
  on storage.objects for select
  using (bucket_id = 'bulletin');

create policy "Members can upload bulletin flyers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'bulletin');


-- --------------------------------------------------------
-- Worship Night RSVPs ("From the Heart")
-- Public RSVP to attend the livestream; admin sends the link later.
-- --------------------------------------------------------

create table if not exists public.worship_rsvps (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text not null unique,
  guest_count  int not null default 1,
  notes        text,
  notified     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.worship_rsvps disable row level security;

create index if not exists idx_worship_rsvps_created
  on public.worship_rsvps (created_at desc);

