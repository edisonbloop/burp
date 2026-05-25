"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import type { SharehouseNeed, SharehouseNeedFormData } from "@/types/sharehouse";

// Admin check helper
async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * Public: Submit a new tangible need to the community care platform.
 * Submissions are unapproved (pending review) by default.
 */
export async function createSharehouseNeed(
  data: SharehouseNeedFormData
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    
    const title = data.title.trim();
    const description = data.description.trim();
    const category = data.category;
    const full_name = data.full_name.trim();
    const contact_info = data.contact_info.trim();
    const evidence_url = data.evidence_url?.trim() || null;

    if (!title || !description || !category || !full_name || !contact_info) {
      return { error: "Missing required fields." };
    }

    const { error } = await supabase.from("sharehouse_needs").insert({
      title,
      description,
      category,
      full_name,
      anonymous: data.anonymous,
      contact_info,
      evidence_url,
      approved: false, // Must be approved by administrators
      featured: false,
      status: "active",
    });

    if (error) return { error: error.message };

    // Revalidate paths
    revalidatePath("/sharehouse");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Public: Fetch all approved needs for the sharehouse board.
 * Sort order: featured first, then newest first.
 */
export async function getPublicSharehouseNeeds(): Promise<SharehouseNeed[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("sharehouse_needs")
    .select("*")
    .eq("approved", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public needs:", error);
    return [];
  }

  return (data as SharehouseNeed[]) ?? [];
}

/**
 * Public: Verify contact info and update status to "met" with a testimony.
 */
export async function verifyAndUpdateNeedStatus(
  id: string,
  contactInfo: string,
  testimony: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const cleanContact = contactInfo.trim().toLowerCase();
    const cleanTestimony = testimony.trim();

    if (!cleanContact || !cleanTestimony) {
      return { error: "Contact verification and testimony are required." };
    }

    // 1. Fetch the need
    const { data: need, error: fetchError } = await supabase
      .from("sharehouse_needs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !need) {
      return { error: "Need not found." };
    }

    // 2. Compare contact info (normalized comparison)
    const storedContact = need.contact_info.trim().toLowerCase();
    if (storedContact !== cleanContact) {
      return { error: "Verification failed. The contact information provided does not match our records." };
    }

    // 3. Update in database
    const { error: updateError } = await supabase
      .from("sharehouse_needs")
      .update({
        status: "met",
        update_testimony: cleanTestimony,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) return { error: updateError.message };

    // Revalidate paths so updates show up instantly
    revalidatePath("/sharehouse");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Admin: Fetch all needs in the system (approved + pending).
 */
export async function getAdminSharehouseNeeds(): Promise<SharehouseNeed[]> {
  await requireAdminSession();
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("sharehouse_needs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin needs:", error);
    return [];
  }

  return (data as SharehouseNeed[]) ?? [];
}

/**
 * Admin: Toggle approved status.
 */
export async function adminUpdateNeedApproval(
  id: string,
  approved: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("sharehouse_needs")
      .update({ approved })
      .eq("id", id);

    if (error) return { error: error.message };
    
    revalidatePath("/sharehouse");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update approval" };
  }
}

/**
 * Admin: Toggle featured status.
 */
export async function adminUpdateNeedFeatured(
  id: string,
  featured: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("sharehouse_needs")
      .update({ featured })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/sharehouse");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update featured status" };
  }
}

/**
 * Admin: Manual override for status and testimony.
 */
export async function adminUpdateNeedStatus(
  id: string,
  status: "active" | "met" | "resolved",
  testimony: string | null
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("sharehouse_needs")
      .update({
        status,
        update_testimony: testimony?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/sharehouse");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update status" };
  }
}

/**
 * Admin: Delete a need entirely.
 */
export async function adminDeleteNeed(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("sharehouse_needs")
      .delete()
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/sharehouse");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete need" };
  }
}
