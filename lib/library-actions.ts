"use server";

import { getSupabase } from "./supabase";
import type { LibraryItem, Topic, LibraryItemFormData, LibraryType } from "@/types/library";
import { revalidatePath } from "next/cache";

/**
 * Fetch topics ordered alphabetically
 */
export async function getTopics(): Promise<Topic[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
  return data ?? [];
}

/**
 * Dynamically suggest and add a new topic category
 */
export async function createTopic(name: string): Promise<{ data?: Topic; error?: string }> {
  try {
    const supabase = getSupabase();
    const cleanName = name.trim();
    
    if (!cleanName) {
      return { error: "Topic name cannot be empty" };
    }

    // Check if topic already exists to prevent unique constraint failures
    const { data: existing, error: checkError } = await supabase
      .from("topics")
      .select("*")
      .eq("name", cleanName);
      
    if (checkError) return { error: checkError.message };
    
    if (existing && existing.length > 0) {
      return { data: existing[0] };
    }

    // Insert new topic
    const { data, error } = await supabase
      .from("topics")
      .insert({ name: cleanName })
      .select()
      .single();

    if (error) return { error: error.message };
    
    revalidatePath("/library/submit");
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Fetch library items with optional filters for type, topic tag, and text search query.
 * Public mode (default) only returns approved items.
 * Admin mode returns all items regardless of approval status.
 */
export async function getLibraryItems(
  type?: LibraryType | string,
  topic?: string,
  search?: string,
  adminMode = false
): Promise<LibraryItem[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  let query = supabase.from("library_items").select("*");

  // Public pages only show approved content
  if (!adminMode) {
    query = query.eq("approved", true);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  if (topic && topic !== "all") {
    query = query.eq("topic", topic);
  }

  if (search && search.trim()) {
    const cleanSearch = search.trim();
    query = query.or(
      `title.ilike.%${cleanSearch}%,content.ilike.%${cleanSearch}%,author.ilike.%${cleanSearch}%`
    );
  }

  // Featured first, then newest
  query = query
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching library items:", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch a single library item by UUID
 */
export async function getLibraryItemById(id: string): Promise<LibraryItem | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("library_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching library item ${id}:`, error);
    return null;
  }
  return data;
}

/**
 * Submit new spiritual content material
 */
export async function createLibraryItem(
  data: LibraryItemFormData
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    
    const title = data.title.trim();
    const content = data.content.trim();
    const author = data.author?.trim() || null;
    const topic = data.topic.trim();

    if (!title || !content || !topic) {
      return { error: "Missing required fields (Title, Content, and Topic are mandatory)" };
    }

    // Generate short excerpt (first 150 chars)
    let excerpt = content;
    if (content.length > 150) {
      excerpt = content.substring(0, 150).trim() + "...";
    }

    // Insert library item
    const { error } = await supabase.from("library_items").insert({
      type: data.type,
      title,
      excerpt,
      content,
      author,
      topic,
      featured: false,
      approved: false, // All submissions require admin approval before going public
    });

    if (error) return { error: error.message };

    // Revalidate paths so browser views update instantly
    revalidatePath("/library");
    revalidatePath(`/library/type/${data.type}`);
    
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}
