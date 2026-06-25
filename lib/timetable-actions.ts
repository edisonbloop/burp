"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import { getSupabaseAdmin } from "./supabase-admin";
import { TIMETABLE_DAYS } from "@/types/timetable";
import type {
  FacilitationTimetable,
  FacilitationTimetableInput,
  MemberSuggestion,
  TimetableDay,
} from "@/types/timetable";

async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * Public: Read the single facilitating-timetable row.
 */
export async function getFacilitationTimetable(): Promise<FacilitationTimetable | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("facilitation_timetable")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching facilitation timetable:", error);
    return null;
  }

  return (data as FacilitationTimetable | null) ?? null;
}

/**
 * Admin/typeahead: Search members by name or username for the facilitator picker.
 */
export async function searchMembers(query: string): Promise<MemberSuggestion[]> {
  // Strip characters that have meaning in a PostgREST .or() filter.
  const q = query.trim().replace(/[,()%*]/g, " ").replace(/\s+/g, " ").trim();
  if (q.length < 2) return [];

  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
    .not("full_name", "is", null)
    .limit(6);

  if (error) {
    console.error("Error searching members:", error);
    return [];
  }

  return (data as MemberSuggestion[]) ?? [];
}

const DAY_LABELS: Record<TimetableDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/**
 * Admin: Update the facilitating timetable. Emails any member who has been
 * newly assigned (or reassigned) to a day since the last save.
 */
export async function adminUpdateFacilitationTimetable(
  data: FacilitationTimetableInput
): Promise<{ error?: string; emailed?: number }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    // Previous assignments, to detect what changed.
    const { data: existing } = await supabase
      .from("facilitation_timetable")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    const prev = existing as FacilitationTimetable | null;

    const clean = (v: string) => v.trim() || null;

    const row: Record<string, unknown> = { id: 1, note: clean(data.note), updated_at: new Date().toISOString() };
    for (const day of TIMETABLE_DAYS) {
      row[day] = clean(data[day].name);
      row[`${day}_user_id`] = data[day].userId || null;
    }

    const { error } = await supabase.from("facilitation_timetable").upsert(row);
    if (error) return { error: error.message };

    // Determine who was newly assigned (member linked + changed from before).
    const newlyAssigned: { userId: string; day: TimetableDay }[] = [];
    for (const day of TIMETABLE_DAYS) {
      const userId = data[day].userId;
      const prevUserId = prev?.[`${day}_user_id` as keyof FacilitationTimetable] as string | null | undefined;
      if (userId && userId !== prevUserId) {
        newlyAssigned.push({ userId, day });
      }
    }

    let emailed = 0;
    if (newlyAssigned.length > 0) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { sendFacilitatorEmail } = await import("./email");
        for (const { userId, day } of newlyAssigned) {
          try {
            const { data: authUser } = await admin.auth.admin.getUserById(userId);
            const email = authUser?.user?.email;
            if (!email) continue;
            const firstName = (data[day].name || "").split(" ")[0];
            await sendFacilitatorEmail(email, firstName, DAY_LABELS[day]);
            emailed++;
          } catch {
            /* email failure must not block the save */
          }
        }
      }
    }

    revalidatePath("/timetable");
    return { emailed };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update timetable" };
  }
}
