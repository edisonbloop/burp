"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";

async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

// ── Plans ──────────────────────────────────────────────────────────────────

export async function adminCreatePlan(
  title: string,
  description: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("reading_plans")
      .insert({ title: title.trim(), description: description.trim() || null });
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminUpdatePlan(
  id: string,
  title: string,
  description: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("reading_plans")
      .update({ title: title.trim(), description: description.trim() || null })
      .eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminDeletePlan(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("reading_plans")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

// ── Discussions ────────────────────────────────────────────────────────────

export async function adminCreateDiscussion(
  planId: string,
  dayNumber: number | null,
  title: string,
  content: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("discussions")
      .insert({
        plan_id: planId,
        day_number: dayNumber,
        title: title.trim(),
        content: content.trim() || null,
      });
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminUpdateDiscussion(
  id: string,
  dayNumber: number | null,
  title: string,
  content: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("discussions")
      .update({
        day_number: dayNumber,
        title: title.trim(),
        content: content.trim() || null,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminDeleteDiscussion(
  id: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("discussions")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

// ── Transcribed Comments ───────────────────────────────────────────────────

/**
 * Admin-only: post a reflection on behalf of someone who shared it in the
 * WhatsApp group or elsewhere but doesn't have a BURP account.
 * Stores with user_id = null and attributed_to = their name.
 */
export async function adminPostTranscribedComment(
  discussionId: string,
  attributedTo: string,
  content: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const cleanName = attributedTo.trim();
    const cleanContent = content.trim();
    if (!cleanName || !cleanContent) return { error: "Name and reflection are required" };

    const { error } = await getSupabase()
      .from("comments")
      .insert({
        discussion_id: discussionId,
        user_id: null,
        attributed_to: cleanName,
        content: cleanContent,
      });

    if (error) return { error: error.message };
    revalidatePath("/talk-it-over");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

// ── Library Item Admin Actions ─────────────────────────────────────────────

export async function adminUpdateLibraryApproval(
  id: string,
  approved: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("library_items")
      .update({ approved })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/library");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminUpdateLibraryFeatured(
  id: string,
  featured: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("library_items")
      .update({ featured })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/library");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminDeleteLibraryItem(
  id: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase()
      .from("library_items")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/library");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}
