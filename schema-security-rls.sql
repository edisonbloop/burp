-- BURP — Row Level Security lockdown
--
-- WHY: RLS was disabled on every table, so the public (anon) key that ships in
-- every browser could read AND write the whole database directly — including
-- the members' contact details (people), anonymous leadership feedback,
-- worship RSVPs, and vote tokens.
--
-- AFTER THIS SCRIPT:
--   * The browser (anon / signed-in member) can only do what the app's
--     browser code actually does: read public discussion content and
--     profiles, post/edit/delete THEIR OWN discussions and comments, edit
--     THEIR OWN profile, and read/update THEIR OWN notifications.
--   * Every other table has RLS on with no public policy = invisible and
--     read-only-to-nobody from the browser. All other access happens in
--     server code, which uses the service-role key and bypasses RLS.
--
-- ORDER OF OPERATIONS — do not skip step 1:
--   1. Make sure SUPABASE_SERVICE_ROLE_KEY is set in your hosting environment
--      (Vercel -> Settings -> Environment Variables) and that the code which
--      makes server code use it (lib/supabase.ts) is DEPLOYED.
--   2. Run this script in the Supabase SQL Editor.
--   3. Click through the site (home, Burp It, stones wall, library, sharehouse,
--      bulletin, /admin). If anything is empty or errors, run the ROLLBACK
--      block at the bottom immediately, then check step 1.
--
-- Safe to re-run.

-- 1) Turn RLS on for every table ------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'admin_assessment_ratings', 'admin_assessments', 'bulletin_posts', 'comments',
    'discussions', 'facilitation_timetable', 'god_attribute_references',
    'god_attributes', 'library_items', 'notifications', 'one_year_plan_days',
    'outreach_comments', 'outreach_ideas', 'outreach_rounds', 'outreach_votes',
    'people', 'profiles', 'reading_plans', 'secret_santa_assignments',
    'secret_santa_rounds', 'sharehouse_needs', 'stones', 'topics',
    'worship_attendance', 'worship_rsvps'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- 2) Policies for the four tables the browser touches directly ------------------

-- profiles: display names / bios are public (community directory, profile pages).
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
  for select using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- discussions: readable by everyone; members manage only their own posts.
drop policy if exists discussions_select_all on public.discussions;
create policy discussions_select_all on public.discussions
  for select using (true);

drop policy if exists discussions_insert_own on public.discussions;
create policy discussions_insert_own on public.discussions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists discussions_update_own on public.discussions;
create policy discussions_update_own on public.discussions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists discussions_delete_own on public.discussions;
create policy discussions_delete_own on public.discussions
  for delete to authenticated using (user_id = auth.uid());

-- comments: same model.
drop policy if exists comments_select_all on public.comments;
create policy comments_select_all on public.comments
  for select using (true);

drop policy if exists comments_insert_own on public.comments;
create policy comments_insert_own on public.comments
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists comments_delete_own on public.comments;
create policy comments_delete_own on public.comments
  for delete to authenticated using (user_id = auth.uid());

-- notifications: strictly private to the recipient.
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own on public.notifications
  for delete to authenticated using (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- ROLLBACK (emergency only — this re-opens the database to the public key):
--
-- do $$ declare t text; begin
--   for t in select tablename from pg_tables where schemaname = 'public' loop
--     execute format('alter table public.%I disable row level security', t);
--   end loop;
-- end $$;
-- ------------------------------------------------------------------------------
