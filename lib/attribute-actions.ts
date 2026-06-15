"use server";

import { getSupabase } from "./supabase";
import { revalidatePath } from "next/cache";
import type { GodAttribute, AttributeReference } from "@/types/attributes";

/** Fetch all approved attributes (no references, just metadata) */
export async function getAttributes(): Promise<GodAttribute[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("god_attributes")
    .select("*")
    .eq("approved", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }
  return data ?? [];
}

/** Fetch a single approved attribute with all its approved references */
export async function getAttribute(
  id: string
): Promise<(GodAttribute & { references: AttributeReference[] }) | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const [{ data: attr, error: attrErr }, { data: refs }] = await Promise.all([
    supabase
      .from("god_attributes")
      .select("*")
      .eq("id", id)
      .eq("approved", true)
      .single(),
    supabase
      .from("god_attribute_references")
      .select("*")
      .eq("attribute_id", id)
      .eq("approved", true)
      .order("book", { ascending: true })
      .order("chapter", { ascending: true })
      .order("verse_start", { ascending: true }),
  ]);

  if (attrErr || !attr) return null;
  return { ...attr, references: refs ?? [] };
}

/** Community submission: propose a new attribute or book study */
export async function submitAttribute(params: {
  entryType: "attribute" | "book";
  name: string;
  description: string;
  content: string;
  submittedBy: string;
  passageBook?: string;
}): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();

    if (params.entryType === "attribute" && !params.name.trim()) {
      return { error: "Attribute name is required." };
    }
    if (params.entryType === "book" && !params.passageBook) {
      return { error: "Please select a Bible book." };
    }

    // Auto-generate name for book studies if no custom title given
    const name = params.name.trim() || params.passageBook?.trim() || "";

    const { error } = await supabase.from("god_attributes").insert({
      entry_type: params.entryType,
      name,
      description: params.description.trim() || null,
      content: params.content || null,
      passage_book: params.passageBook?.trim() || null,
      passage_chapter: null,
      passage_chapter_end: null,
      submitted_by: params.submittedBy.trim() || null,
      approved: false,
      featured: false,
    });

    if (error) return { error: error.message };
    revalidatePath("/attributes");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

/** Community submission: add a Bible reference to an existing attribute */
export async function submitReference(params: {
  attributeId: string;
  book: string;
  chapter: number | null;
  verseStart: number | null;
  verseEnd: number | null;
  verseText: string;
  note: string;
  submittedBy: string;
}): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();
    if (!params.attributeId || !params.book.trim()) {
      return { error: "Attribute and Bible book are required." };
    }

    const { error } = await supabase.from("god_attribute_references").insert({
      attribute_id: params.attributeId,
      book: params.book.trim(),
      chapter: params.chapter ?? null,
      verse_start: params.verseStart ?? null,
      verse_end: params.verseEnd ?? null,
      verse_text: params.verseText.trim() || null,
      note: params.note.trim() || null,
      submitted_by: params.submittedBy.trim() || null,
      approved: false,
    });

    if (error) return { error: error.message };
    revalidatePath(`/attributes/${params.attributeId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
