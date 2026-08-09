"use server";

import { getSupabase } from "./supabase";

export type ReadingPlanWithStats = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  discussion_count: number;
  day_thread_count: number;
  last_activity_at: string | null;
  /** Titles and content from discussions — used for case-insensitive search on the index. */
  search_text: string;
};

export async function getReadingPlansWithStats(): Promise<ReadingPlanWithStats[]> {
  const supabase = getSupabase();
  const [plansResult, discussionsResult] = await Promise.all([
    supabase.from("reading_plans").select("*").order("created_at", { ascending: false }),
    supabase.from("discussions").select("plan_id, day_number, created_at, title, content"),
  ]);

  if (plansResult.error) {
    console.error("Error fetching reading plans:", plansResult.error);
    return [];
  }

  const plans = plansResult.data || [];
  const discussions = discussionsResult.data || [];

  const statsByPlan = new Map<
    string,
    { count: number; dayCount: number; lastActivity: string | null; searchParts: string[] }
  >();

  for (const d of discussions) {
    const existing = statsByPlan.get(d.plan_id) ?? {
      count: 0,
      dayCount: 0,
      lastActivity: null,
      searchParts: [],
    };
    existing.count++;
    if (d.day_number != null) existing.dayCount++;
    if (!existing.lastActivity || d.created_at > existing.lastActivity) {
      existing.lastActivity = d.created_at;
    }
    if (d.title) existing.searchParts.push(d.title);
    if (d.content) existing.searchParts.push(d.content);
    statsByPlan.set(d.plan_id, existing);
  }

  return plans.map((plan) => {
    const stats = statsByPlan.get(plan.id) ?? {
      count: 0,
      dayCount: 0,
      lastActivity: null,
      searchParts: [],
    };
    return {
      ...plan,
      discussion_count: stats.count,
      day_thread_count: stats.dayCount,
      last_activity_at: stats.lastActivity,
      search_text: stats.searchParts.join(" "),
    };
  });
}

export async function getReadingPlans() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reading_plans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reading plans:", error);
    return [];
  }
  return data || [];
}

export async function getPlan(planId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reading_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) return null;
  return data;
}

/** All posts that share a thread_id, ordered by thread_index */
export async function getThreadPosts(threadId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("discussions")
    .select("*")
    .eq("thread_id", threadId)
    .order("thread_index", { ascending: true });
  if (error) return [];
  return data || [];
}

/** Numbered day-discussion threads (day_number IS NOT NULL), ordered by day */
export async function getDayDiscussionsForPlan(planId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("discussions")
    .select("*")
    .eq("plan_id", planId)
    .not("day_number", "is", null)
    .order("day_number", { ascending: true });

  if (error) {
    console.error("Error fetching day discussions:", error);
    return [];
  }
  return data || [];
}

/** Free-form feed posts (day_number IS NULL), newest first */
export async function getFeedPostsForPlan(planId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("discussions")
    .select("*")
    .eq("plan_id", planId)
    .is("day_number", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching feed posts:", error);
    return [];
  }
  return data || [];
}

export async function getDiscussion(discussionId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("discussions")
    .select("*, reading_plans(title)")
    .eq("id", discussionId)
    .single();

  if (error) {
    console.error("Error fetching discussion:", error);
    return null;
  }
  return data;
}

export async function getComments(discussionId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(full_name)")
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
  return data || [];
}
