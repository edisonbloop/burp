"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import { MONTH_NAMES } from "@/types/crm";
import type { BulkImportResult, Person, PersonFormData } from "@/types/crm";

async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * Admin: Fetch every person in the CRM roster.
 */
export async function getPeople(): Promise<Person[]> {
  await requireAdminSession();
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching people:", error);
    return [];
  }

  return (data as Person[]) ?? [];
}

export async function createPerson(data: PersonFormData): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const full_name = data.full_name.trim();
    if (!full_name) return { error: "Name is required." };

    const { error } = await supabase.from("people").insert({
      full_name,
      birthday_month: data.birthday_month || null,
      birthday_day: data.birthday_day || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      notes: data.notes?.trim() || null,
      status: data.status,
      secret_santa_opt_out: data.secret_santa_opt_out ?? false,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to add person" };
  }
}

export async function updatePerson(
  id: string,
  data: PersonFormData
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const full_name = data.full_name.trim();
    if (!full_name) return { error: "Name is required." };

    const { error } = await supabase
      .from("people")
      .update({
        full_name,
        birthday_month: data.birthday_month || null,
        birthday_day: data.birthday_day || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        notes: data.notes?.trim() || null,
        status: data.status,
        secret_santa_opt_out: data.secret_santa_opt_out ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update person" };
  }
}

export async function deletePerson(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete person" };
  }
}

/**
 * Admin: Link (or unlink) a CRM person to a real BURP account, enabling
 * that person to self-pick their Secret Santa when signed in.
 */
export async function linkPersonToAccount(
  personId: string,
  userId: string | null
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("people")
      .update({ linked_user_id: userId, updated_at: new Date().toISOString() })
      .eq("id", personId);

    if (error) {
      // Unique violation — that account is already linked to someone else.
      if (error.code === "23505") {
        return { error: "That account is already linked to another person." };
      }
      return { error: error.message };
    }

    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to link account" };
  }
}

const MONTH_LOOKUP: Record<string, number> = Object.fromEntries(
  MONTH_NAMES.map((name, i) => [name.toLowerCase(), i + 1])
);

/**
 * Parse lines like "1. Benjamin — January 9" into structured entries.
 * Tolerant of "-", "–", "—" as separators and missing leading numbers.
 */
function parseBulkImportText(
  text: string
): { name: string; birthday_month: number; birthday_day: number }[] {
  const results: { name: string; birthday_month: number; birthday_day: number }[] = [];
  const lines = text.split("\n");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const match = line.match(
      /^(?:\d+\.\s*)?(.+?)\s*[—–-]\s*([A-Za-z]+)\s+(\d{1,2})\s*$/
    );
    if (!match) continue;

    const [, name, monthName, dayStr] = match;
    const month = MONTH_LOOKUP[monthName.trim().toLowerCase()];
    const day = parseInt(dayStr, 10);
    if (!month || !day || day < 1 || day > 31) continue;

    results.push({ name: name.trim(), birthday_month: month, birthday_day: day });
  }

  return results;
}

/**
 * Admin: Bulk-import people from a pasted "Name — Month Day" list.
 * Skips names that already exist in the roster (case-insensitive).
 */
export async function bulkImportPeople(rawText: string): Promise<BulkImportResult> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const lines = rawText.split("\n").filter((l) => l.trim());
    const parsed = parseBulkImportText(rawText);
    const unparsedLines = lines.filter(
      (l) => !parsed.some((p) => l.includes(p.name))
    );

    if (parsed.length === 0) {
      return { imported: 0, skippedDuplicates: [], unparsedLines: lines, error: "No valid lines found." };
    }

    const { data: existing } = await supabase.from("people").select("full_name");
    const existingNames = new Set((existing ?? []).map((p) => p.full_name.trim().toLowerCase()));

    const toInsert = parsed.filter((p) => !existingNames.has(p.name.toLowerCase()));
    const skippedDuplicates = parsed
      .filter((p) => existingNames.has(p.name.toLowerCase()))
      .map((p) => p.name);

    if (toInsert.length > 0) {
      const { error } = await supabase.from("people").insert(
        toInsert.map((p) => ({
          full_name: p.name,
          birthday_month: p.birthday_month,
          birthday_day: p.birthday_day,
          status: "active",
        }))
      );
      if (error) return { imported: 0, skippedDuplicates: [], unparsedLines: [], error: error.message };
    }

    revalidatePath("/admin");
    return { imported: toInsert.length, skippedDuplicates, unparsedLines };
  } catch (e) {
    return {
      imported: 0,
      skippedDuplicates: [],
      unparsedLines: [],
      error: e instanceof Error ? e.message : "Import failed",
    };
  }
}
