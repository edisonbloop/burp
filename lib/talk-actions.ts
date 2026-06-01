"use server";

import { getSupabase } from "./supabase";

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
