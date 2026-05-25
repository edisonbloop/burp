"use server";

import { getSupabase } from "./supabase";

/** Fetch all library items submitted by a specific auth user */
export async function getUserLibraryItems(userId: string) {
  if (!userId) return [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("library_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Fetch discussion comments made by a specific auth user, with discussion + plan context */
export async function getUserComments(userId: string) {
  if (!userId) return [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        discussion_id,
        discussions (
          id,
          title,
          day_number,
          plan_id,
          reading_plans ( id, title )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Increment the view_count for a library item — called client-side on page load */
export async function incrementViewCount(itemId: string): Promise<void> {
  if (!itemId) return;
  try {
    const supabase = getSupabase();
    // Use raw SQL increment so we never race-overwrite another increment
    await supabase.rpc("increment_library_view", { item_id: itemId });
  } catch {
    // Non-critical — silently ignore
  }
}
