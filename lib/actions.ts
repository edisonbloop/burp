"use server";

import { cookies } from "next/headers";
import { getSupabase } from "./supabase";
import type { Stone, PublicStone, StoneFormData } from "@/types/stones";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

export async function createStone(data: StoneFormData): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("stones").insert({
      full_name: data.full_name,
      display_name: data.display_name || null,
      contact: data.contact || null,
      journey_word: data.journey_word,
      scripture: data.scripture || null,
      remembrance: data.remembrance,
      testimony: data.testimony || null,
      consent_public: data.consent_public,
      anonymous: data.anonymous,
      approved: false,
      featured: false,
    });

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function getPublicStones(): Promise<PublicStone[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }
  const { data, error } = await supabase
    .from("stones")
    .select(
      "id, display_name, full_name, anonymous, journey_word, scripture, remembrance, testimony, featured, created_at"
    )
    .eq("approved", true)
    .eq("consent_public", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public stones:", error);
    return [];
  }
  return (data as PublicStone[]) ?? [];
}

export async function getAdminStones(): Promise<Stone[]> {
  await requireAdminSession();
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }
  const { data, error } = await supabase
    .from("stones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin stones:", error);
    return [];
  }
  return (data as Stone[]) ?? [];
}

export async function updateStoneApproval(
  id: string,
  approved: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase
      .from("stones")
      .update({ approved })
      .eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function updateStoneFeatured(
  id: string,
  featured: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase
      .from("stones")
      .update({ featured })
      .eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function deleteStone(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase.from("stones").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}
