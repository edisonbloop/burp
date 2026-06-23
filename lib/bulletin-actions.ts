"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import type { BulletinPost, BulletinPostFormData } from "@/types/bulletin";

// Admin check helper
async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * Public: Submit a new bulletin post (event, promotion, product or service).
 * Submissions are unapproved (pending review) by default.
 */
export async function createBulletinPost(
  data: BulletinPostFormData
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();

    const title = data.title.trim();
    const description = data.description.trim();
    const category = data.category;
    const full_name = data.full_name.trim();
    const contact_info = data.contact_info.trim();
    const business_name = data.business_name?.trim() || null;
    const link_url = data.link_url?.trim() || null;
    const image_url = data.image_url?.trim() || null;
    const video_url = data.video_url?.trim() || null;
    const price = data.price?.trim() || null;
    const location = data.location?.trim() || null;
    const event_date = data.event_date?.trim() || null;

    if (!title || !description || !category || !full_name || !contact_info) {
      return { error: "Missing required fields." };
    }

    const { data: inserted, error } = await supabase
      .from("bulletin_posts")
      .insert({
        user_id: data.userId || null,
        category,
        title,
        description,
        full_name,
        business_name,
        contact_info,
        link_url,
        image_url,
        video_url,
        price,
        location,
        event_date,
        approved: false, // Must be approved by administrators
        featured: false,
        status: "active",
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    // If the row didn't come back, the write was silently blocked (e.g. RLS).
    if (!inserted) {
      return {
        error:
          "Your post could not be saved. The bulletin table may have Row Level Security enabled — disable RLS on public.bulletin_posts.",
      };
    }

    revalidatePath("/bulletin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Public: Fetch all approved, active bulletin posts for the board.
 * Sort order: featured first, then newest first.
 */
export async function getPublicBulletinPosts(): Promise<BulletinPost[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("bulletin_posts")
    .select("*")
    .eq("approved", true)
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public bulletin posts:", error);
    return [];
  }

  return (data as BulletinPost[]) ?? [];
}

/**
 * Public: Fetch a single approved post by id (for its detail page).
 * Returns posts in any status so previously shared links still resolve.
 */
export async function getBulletinPostById(
  id: string
): Promise<BulletinPost | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("bulletin_posts")
    .select("*")
    .eq("id", id)
    .eq("approved", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching bulletin post:", error);
    return null;
  }

  return (data as BulletinPost | null) ?? null;
}

/**
 * Owner: Fetch a post the member owns, regardless of approval status,
 * so they can load it into the edit form.
 */
export async function getOwnedBulletinPost(
  id: string,
  userId: string
): Promise<BulletinPost | null> {
  if (!userId) return null;
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("bulletin_posts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching owned bulletin post:", error);
    return null;
  }

  return (data as BulletinPost | null) ?? null;
}

/**
 * Owner: Update a post the member owns. Edits return the post to pending
 * review (approved = false), consistent with the Library.
 */
export async function updateMyBulletinPost(
  id: string,
  userId: string,
  data: BulletinPostFormData
): Promise<{ error?: string }> {
  try {
    if (!userId) return { error: "You must be signed in to edit." };
    const supabase = getSupabase();

    // Verify ownership before touching anything
    const { data: existing, error: fetchErr } = await supabase
      .from("bulletin_posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) return { error: "Post not found." };
    if (existing.user_id !== userId) {
      return { error: "You don't have permission to edit this post." };
    }

    const title = data.title.trim();
    const description = data.description.trim();
    if (!title || !description || !data.category || !data.full_name.trim() || !data.contact_info.trim()) {
      return { error: "Missing required fields." };
    }

    const { error } = await supabase
      .from("bulletin_posts")
      .update({
        category: data.category,
        title,
        description,
        full_name: data.full_name.trim(),
        business_name: data.business_name?.trim() || null,
        contact_info: data.contact_info.trim(),
        link_url: data.link_url?.trim() || null,
        image_url: data.image_url?.trim() || null,
        video_url: data.video_url?.trim() || null,
        price: data.price?.trim() || null,
        location: data.location?.trim() || null,
        event_date: data.event_date?.trim() || null,
        approved: false, // back to pending after any edit
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/bulletin");
    revalidatePath(`/bulletin/${id}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update post" };
  }
}

/**
 * Owner: Delete a post the member owns.
 */
export async function deleteMyBulletinPost(
  id: string,
  userId: string
): Promise<{ error?: string }> {
  try {
    if (!userId) return { error: "You must be signed in." };
    const supabase = getSupabase();

    const { data: existing, error: fetchErr } = await supabase
      .from("bulletin_posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) return { error: "Post not found." };
    if (existing.user_id !== userId) {
      return { error: "You don't have permission to delete this post." };
    }

    const { error } = await supabase.from("bulletin_posts").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/bulletin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete post" };
  }
}

/**
 * Admin: Fetch all posts in the system (approved + pending).
 */
export async function getAdminBulletinPosts(): Promise<BulletinPost[]> {
  await requireAdminSession();
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("bulletin_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin bulletin posts:", error);
    return [];
  }

  return (data as BulletinPost[]) ?? [];
}

/**
 * Admin: Toggle approved status.
 */
export async function adminUpdateBulletinApproval(
  id: string,
  approved: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("bulletin_posts")
      .update({ approved, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/bulletin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update approval" };
  }
}

/**
 * Admin: Toggle featured status.
 */
export async function adminUpdateBulletinFeatured(
  id: string,
  featured: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("bulletin_posts")
      .update({ featured, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/bulletin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update featured status" };
  }
}

/**
 * Admin: Update post status (active / expired / closed).
 */
export async function adminUpdateBulletinStatus(
  id: string,
  status: "active" | "expired" | "closed"
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("bulletin_posts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/bulletin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update status" };
  }
}

/**
 * Admin: Delete a post entirely.
 */
export async function adminDeleteBulletinPost(
  id: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("bulletin_posts")
      .delete()
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/bulletin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete post" };
  }
}
