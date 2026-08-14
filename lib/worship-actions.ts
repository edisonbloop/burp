"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import { sendWorshipRsvpConfirmation, sendWorshipLivestreamEmail } from "./email";
import type { WorshipRsvp, WorshipRsvpFormData, WorshipAttendance, WorshipAttendanceFormData } from "@/types/worship";

// Admin check helper
async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * Public: RSVP to attend the "From the Heart" livestream.
 * Re-submitting with the same email updates the existing RSVP.
 */
export async function createWorshipRsvp(
  data: WorshipRsvpFormData
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();

    const full_name = data.full_name.trim();
    const email = data.email.trim().toLowerCase();
    const guest_count = Math.max(1, Math.min(20, Math.round(data.guest_count || 1)));
    const notes = data.notes?.trim() || null;

    if (!full_name || !email) {
      return { error: "Name and email are required." };
    }

    const { data: upserted, error } = await supabase
      .from("worship_rsvps")
      .upsert(
        { full_name, email, guest_count, notes },
        { onConflict: "email" }
      )
      .select("id")
      .single();

    if (error) return { error: error.message };
    if (!upserted) {
      return {
        error:
          "Your RSVP could not be saved. The worship_rsvps table may have Row Level Security enabled — disable RLS on public.worship_rsvps.",
      };
    }

    // Best-effort confirmation email — don't fail the RSVP if this errors.
    try {
      await sendWorshipRsvpConfirmation(email, full_name.split(" ")[0]);
    } catch (e) {
      console.error("Failed to send worship RSVP confirmation:", e);
    }

    revalidatePath("/worship");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Admin: Fetch all RSVPs, newest first.
 */
export async function getAdminWorshipRsvps(): Promise<WorshipRsvp[]> {
  await requireAdminSession();
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("worship_rsvps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching worship RSVPs:", error);
    return [];
  }

  return (data as WorshipRsvp[]) ?? [];
}

/**
 * Admin: Delete an RSVP entirely.
 */
export async function adminDeleteWorshipRsvp(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase.from("worship_rsvps").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete RSVP" };
  }
}

/**
 * Admin: Send the livestream link to a set of RSVPs by id, marking them notified.
 */
export async function adminSendWorshipLivestreamEmail(
  ids: string[],
  linkUrl: string,
  message?: string
): Promise<{ error?: string; sent?: number }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const url = linkUrl.trim();
    if (!url) return { error: "A livestream link is required." };
    if (!ids.length) return { error: "No recipients selected." };

    const { data: rsvps, error: fetchErr } = await supabase
      .from("worship_rsvps")
      .select("*")
      .in("id", ids);

    if (fetchErr) return { error: fetchErr.message };
    if (!rsvps?.length) return { error: "No matching RSVPs found." };

    let sent = 0;
    for (const rsvp of rsvps as WorshipRsvp[]) {
      try {
        await sendWorshipLivestreamEmail(
          rsvp.email,
          rsvp.full_name.split(" ")[0],
          url,
          message?.trim() || undefined
        );
        sent++;
      } catch (e) {
        console.error(`Failed to send livestream email to ${rsvp.email}:`, e);
      }
    }

    const { error: updateErr } = await supabase
      .from("worship_rsvps")
      .update({ notified: true })
      .in("id", ids);

    if (updateErr) console.error("Failed to mark RSVPs as notified:", updateErr);

    revalidatePath("/admin");
    return { sent };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to send emails" };
  }
}

/**
 * Public: Venue attendance check-in at the door (/worship/attend).
 */
export async function createWorshipAttendance(
  data: WorshipAttendanceFormData
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();

    const full_name = data.full_name.trim();
    const email = data.email?.trim().toLowerCase() || null;
    const phone = data.phone?.trim() || null;
    const guest_count = Math.max(1, Math.min(20, Math.round(data.guest_count || 1)));
    const notes = data.notes?.trim() || null;

    if (!full_name) {
      return { error: "Name is required." };
    }

    const { error } = await supabase.from("worship_attendance").insert({
      full_name,
      email,
      phone,
      guest_count,
      notes,
    });

    if (error) return { error: error.message };

    revalidatePath("/worship/attend");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Admin: Fetch all venue attendance records, newest first.
 */
export async function getAdminWorshipAttendance(): Promise<WorshipAttendance[]> {
  await requireAdminSession();
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("worship_attendance")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching worship attendance:", error);
    return [];
  }

  return (data as WorshipAttendance[]) ?? [];
}

/**
 * Admin: Delete a venue attendance record.
 */
export async function adminDeleteWorshipAttendance(
  id: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase.from("worship_attendance").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete record" };
  }
}
