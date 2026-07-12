"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import type { Person } from "@/types/crm";
import type {
  AssignmentMethod,
  MyAssignmentStatus,
  RecipientDetails,
  SecretSantaMappingRow,
  SecretSantaRound,
} from "@/types/secretsanta";

async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * The round everyone interacts with by default: the one with the latest year.
 */
export async function getLatestRound(): Promise<SecretSantaRound | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("secret_santa_rounds")
    .select("*")
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching secret santa round:", error);
    return null;
  }

  return (data as SecretSantaRound | null) ?? null;
}

/**
 * Admin: Create the round for a year if it doesn't exist yet, and ensure
 * it's open for picking.
 */
export async function adminStartRound(year: number): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("secret_santa_rounds")
      .select("id")
      .eq("year", year)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("secret_santa_rounds")
        .update({ is_active: true })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("secret_santa_rounds")
        .insert({ year, is_active: true });
      if (error) return { error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/secret-santa");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to start round" };
  }
}

/**
 * Admin: Open or close self-picking for a round.
 */
export async function adminSetRoundActive(
  roundId: string,
  isActive: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("secret_santa_rounds")
      .update({ is_active: isActive })
      .eq("id", roundId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/secret-santa");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update round" };
  }
}

/**
 * Public: What a signed-in participant should see about their own round status.
 * Never reveals the full mapping or who is gifting them — only their own assignment.
 */
export async function getMyAssignmentStatus(
  userId: string | null
): Promise<MyAssignmentStatus> {
  if (!userId) return { state: "not_signed_in" };

  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return { state: "no_active_round" };
  }

  const { data: person } = await supabase
    .from("people")
    .select("id")
    .eq("linked_user_id", userId)
    .maybeSingle();

  if (!person) return { state: "not_in_roster" };

  const round = await getLatestRound();
  if (!round) return { state: "no_active_round" };

  const { data: assignment } = await supabase
    .from("secret_santa_assignments")
    .select("recipient_person_id")
    .eq("round_id", round.id)
    .eq("giver_person_id", person.id)
    .maybeSingle();

  if (!assignment) return { state: "not_picked_yet", roundYear: round.year };

  const { data: recipient } = await supabase
    .from("people")
    .select("full_name, notes, phone, email, birthday_month, birthday_day")
    .eq("id", assignment.recipient_person_id)
    .single();

  return {
    state: "assigned",
    roundYear: round.year,
    recipientName: recipient?.full_name ?? "Someone",
    recipientNotes: recipient?.notes ?? null,
    recipientPhone: recipient?.phone ?? null,
    recipientEmail: recipient?.email ?? null,
    recipientBirthdayMonth: recipient?.birthday_month ?? null,
    recipientBirthdayDay: recipient?.birthday_day ?? null,
  };
}

/**
 * Public: A signed-in, roster-linked member picks their own Secret Santa
 * at random from everyone not yet claimed. Idempotent — re-calling after
 * already picking just returns the existing assignment.
 */
export async function pickMySecretSanta(
  userId: string
): Promise<{ error?: string } & Partial<RecipientDetails>> {
  try {
    const supabase = getSupabase();

    const { data: person } = await supabase
      .from("people")
      .select("id")
      .eq("linked_user_id", userId)
      .maybeSingle();

    if (!person) {
      return { error: "You're not part of this year's Secret Santa roster yet. Ask an admin to add you." };
    }

    const round = await getLatestRound();
    if (!round) return { error: "Secret Santa hasn't started yet." };
    if (!round.is_active) return { error: "Picking is currently closed." };

    const recipientFields = "full_name, notes, phone, email, birthday_month, birthday_day";
    function toRecipientDetails(r: {
      full_name: string;
      notes: string | null;
      phone: string | null;
      email: string | null;
      birthday_month: number | null;
      birthday_day: number | null;
    }): RecipientDetails {
      return {
        recipientName: r.full_name,
        recipientNotes: r.notes,
        recipientPhone: r.phone,
        recipientEmail: r.email,
        recipientBirthdayMonth: r.birthday_month,
        recipientBirthdayDay: r.birthday_day,
      };
    }

    // Idempotent: if they already picked, just return it.
    const { data: existing } = await supabase
      .from("secret_santa_assignments")
      .select("recipient_person_id")
      .eq("round_id", round.id)
      .eq("giver_person_id", person.id)
      .maybeSingle();

    if (existing) {
      const { data: recipient } = await supabase
        .from("people")
        .select(recipientFields)
        .eq("id", existing.recipient_person_id)
        .single();
      return recipient
        ? toRecipientDetails(recipient)
        : { recipientName: "Someone", recipientNotes: null, recipientPhone: null, recipientEmail: null, recipientBirthdayMonth: null, recipientBirthdayDay: null };
    }

    // Try a few times in case of a race with another concurrent picker.
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: participants } = await supabase
        .from("people")
        .select(`id, ${recipientFields}`)
        .eq("secret_santa_opt_out", false);

      const { data: taken } = await supabase
        .from("secret_santa_assignments")
        .select("recipient_person_id")
        .eq("round_id", round.id);

      const takenIds = new Set((taken ?? []).map((t) => t.recipient_person_id));
      const available = (participants ?? []).filter(
        (p) => p.id !== person.id && !takenIds.has(p.id)
      );

      if (available.length === 0) {
        return { error: "No one is left to be matched with — ask an admin to auto-match the remaining people." };
      }

      const picked = available[Math.floor(Math.random() * available.length)];

      const { error } = await supabase.from("secret_santa_assignments").insert({
        round_id: round.id,
        giver_person_id: person.id,
        recipient_person_id: picked.id,
        assigned_method: "self_pick" as AssignmentMethod,
      });

      if (!error) {
        revalidatePath("/secret-santa");
        return toRecipientDetails(picked);
      }

      // Unique-constraint race (someone else claimed this recipient first) — retry.
      if (error.code !== "23505") return { error: error.message };
    }

    return { error: "Couldn't complete your pick due to a conflict — please try again." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Admin: Full oversight view of a round — every assignment made so far,
 * and who hasn't picked yet.
 */
export async function adminGetRoundOverview(roundId: string): Promise<{
  mapping: SecretSantaMappingRow[];
  notPicked: (Person & { canSelfPick: boolean })[];
  totalParticipants: number;
}> {
  await requireAdminSession();
  const supabase = getSupabase();

  const { data: people } = await supabase
    .from("people")
    .select("*")
    .eq("secret_santa_opt_out", false)
    .order("full_name", { ascending: true });

  const participants = (people as Person[]) ?? [];
  const byId = new Map(participants.map((p) => [p.id, p]));

  const { data: assignments } = await supabase
    .from("secret_santa_assignments")
    .select("*")
    .eq("round_id", roundId);

  const rows = (assignments ?? []) as {
    id: string;
    giver_person_id: string;
    recipient_person_id: string;
    assigned_method: AssignmentMethod;
  }[];

  const mapping: SecretSantaMappingRow[] = rows.map((row) => ({
    id: row.id,
    giver_person_id: row.giver_person_id,
    giver_name: byId.get(row.giver_person_id)?.full_name ?? "Unknown",
    recipient_person_id: row.recipient_person_id,
    recipient_name: byId.get(row.recipient_person_id)?.full_name ?? "Unknown",
    assigned_method: row.assigned_method,
  }));

  const pickedGiverIds = new Set(rows.map((r) => r.giver_person_id));
  const notPicked = participants
    .filter((p) => !pickedGiverIds.has(p.id))
    .map((p) => ({ ...p, canSelfPick: !!p.linked_user_id }));

  return { mapping, notPicked, totalParticipants: participants.length };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a random bijection givers[] -> recipients[] with no self-matches.
 * Returns null if it genuinely can't be done (e.g. a single giver == single recipient).
 */
function buildMatching(givers: string[], recipients: string[]): string[] | null {
  const n = givers.length;
  if (n === 0) return [];
  if (n === 1) return givers[0] !== recipients[0] ? [recipients[0]] : null;

  for (let attempt = 0; attempt < 25; attempt++) {
    const shuffled = shuffle(recipients);
    for (let i = 0; i < n; i++) {
      if (shuffled[i] === givers[i]) {
        const j = (i + 1) % n;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    if (!shuffled.some((r, i) => r === givers[i])) return shuffled;
  }
  return null;
}

/**
 * Admin: Randomly match everyone who hasn't picked yet, all at once.
 */
export async function adminAutoMatchRemaining(
  roundId: string
): Promise<{ error?: string; matched?: number }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { data: people } = await supabase
      .from("people")
      .select("id")
      .eq("secret_santa_opt_out", false);
    const participantIds = (people ?? []).map((p) => p.id);

    const { data: assignments } = await supabase
      .from("secret_santa_assignments")
      .select("giver_person_id, recipient_person_id")
      .eq("round_id", roundId);

    const rows = assignments ?? [];
    const assignedGivers = new Set(rows.map((r) => r.giver_person_id));
    const assignedRecipients = new Set(rows.map((r) => r.recipient_person_id));

    const remainingGivers = participantIds.filter((id) => !assignedGivers.has(id));
    const availableRecipients = participantIds.filter((id) => !assignedRecipients.has(id));

    if (remainingGivers.length === 0) {
      return { matched: 0 };
    }
    if (remainingGivers.length !== availableRecipients.length) {
      return { error: "Roster is out of sync — the number of people left to give and to receive doesn't match. Contact support." };
    }

    const matched = buildMatching(remainingGivers, availableRecipients);
    if (!matched) {
      return { error: "Couldn't find a valid random match for the remaining people. Try again, or assign the last few manually." };
    }

    const { error } = await supabase.from("secret_santa_assignments").insert(
      remainingGivers.map((giverId, i) => ({
        round_id: roundId,
        giver_person_id: giverId,
        recipient_person_id: matched[i],
        assigned_method: "auto_match" as AssignmentMethod,
      }))
    );

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/secret-santa");
    return { matched: remainingGivers.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Auto-match failed" };
  }
}

/**
 * Admin: Manually assign (or reassign) one giver's recipient.
 */
export async function adminManualAssign(
  roundId: string,
  giverPersonId: string,
  recipientPersonId: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    if (giverPersonId === recipientPersonId) {
      return { error: "A person can't be assigned to gift themselves." };
    }

    // Is the recipient already claimed by someone else this round?
    const { data: recipientTaken } = await supabase
      .from("secret_santa_assignments")
      .select("giver_person_id")
      .eq("round_id", roundId)
      .eq("recipient_person_id", recipientPersonId)
      .maybeSingle();

    if (recipientTaken && recipientTaken.giver_person_id !== giverPersonId) {
      return { error: "That person is already assigned to receive a gift from someone else. Unassign that pairing first." };
    }

    // Free up this giver's previous assignment, if any, then insert the new one.
    await supabase
      .from("secret_santa_assignments")
      .delete()
      .eq("round_id", roundId)
      .eq("giver_person_id", giverPersonId);

    const { error } = await supabase.from("secret_santa_assignments").insert({
      round_id: roundId,
      giver_person_id: giverPersonId,
      recipient_person_id: recipientPersonId,
      assigned_method: "manual" as AssignmentMethod,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/secret-santa");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to assign" };
  }
}

/**
 * Admin: Remove a specific person's assignment, freeing both them (as giver)
 * and their recipient back into the available pool.
 */
export async function adminUnassign(
  roundId: string,
  giverPersonId: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase
      .from("secret_santa_assignments")
      .delete()
      .eq("round_id", roundId)
      .eq("giver_person_id", giverPersonId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/secret-santa");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to unassign" };
  }
}
