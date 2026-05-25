"use server";

import { getSupabase } from "./supabase";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/attributes");
  revalidatePath("/admin");
}

/** Fetch all attributes (approved + pending) with nested references for admin */
export async function adminGetAttributes() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("god_attributes")
      .select("*, god_attribute_references(*)")
      .order("approved", { ascending: true })  // pending first
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []).map((a) => ({
      ...a,
      references: (a.god_attribute_references ?? []).sort(
        (x: { created_at: string }, y: { created_at: string }) =>
          new Date(x.created_at).getTime() - new Date(y.created_at).getTime()
      ),
    }));
  } catch {
    return [];
  }
}

/** Fetch all references (approved + pending) with their parent attribute name */
export async function adminGetReferences() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("god_attribute_references")
      .select("*, god_attributes(name)")
      .order("approved", { ascending: true })  // pending first
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function adminUpdateAttributeApproval(
  id: string,
  approved: boolean
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("god_attributes")
      .update({ approved })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateAll();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function adminUpdateAttributeFeatured(
  id: string,
  featured: boolean
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("god_attributes")
      .update({ featured })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateAll();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function adminDeleteAttribute(id: string): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("god_attributes")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateAll();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function adminUpdateReferenceApproval(
  id: string,
  approved: boolean
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("god_attribute_references")
      .update({ approved })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateAll();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function adminDeleteReference(id: string): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("god_attribute_references")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateAll();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
