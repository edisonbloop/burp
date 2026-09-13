-- BURP — One Year (Chronological) Bible Reading Plan
-- Run this in the Supabase SQL Editor (safe to re-run — everything is
-- "if not exists"), then run schema-oneyear-plan-seed.sql once afterward.
--
-- Copyright note: this table stores ONLY the day -> scripture reference
-- schedule (e.g. "Genesis 1:1-3:24"), sourced from oneyearbibleonline.com,
-- which distributes it "used by permission of Tyndale House Publishers, Inc."
-- No translated Bible text is stored here at all — when a member opens a
-- day on the site, the actual verse text is fetched live through BURP's own
-- already-licensed Bible API integration (lib/bible-actions.ts), the same
-- way /scripture and the admin content forms already work. This avoids ever
-- reproducing Tyndale's (or any publisher's) copyrighted translation text in
-- our own database.

create table if not exists public.one_year_plan_days (
  id            uuid primary key default gen_random_uuid(),
  day_number    int not null,
  month         int not null,
  day_of_month  int not null,
  readings      text[] not null,
  constraint one_year_plan_days_day_number_unique unique (day_number),
  constraint one_year_plan_days_day_number_check check (day_number between 1 and 365),
  constraint one_year_plan_days_month_check check (month between 1 and 12)
);

alter table public.one_year_plan_days disable row level security;

create index if not exists idx_one_year_plan_days_day_number on public.one_year_plan_days (day_number);
