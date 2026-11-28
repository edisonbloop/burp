"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "./admin-session";
import { getSupabase } from "./supabase";
import {
  THANKSGIVING_NOTE_MAX,
  type AdminThanksgivingRsvp,
  type MyThanksgivingRsvp,
  type PlaceCardData,
} from "@/types/thanksgiving";

/**
 * Thanksgiving potluck place cards. Guests RSVP with no sign-in; each gets a
 * secret token (only in their own link) and is matched with someone else who
 * RSVP'd, then writes one sentence they appreciate about them. The notes are
 * printed anonymously on the back of each person's place card.
 */

const TABLE = "thanksgiving_rsvps";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean = (s: string | null | undefined, max: number) => (s ?? "").trim().replace(/\s+/g, " ").slice(0, max);

function makeToken() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(randomBytes(16), (b) => alphabet[b % alphabet.length]).join("");
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function rsvpsOpen(): Promise<boolean> {
  const { data } = await getSupabase().from("thanksgiving_settings").select("rsvps_open").eq("id", 1).maybeSingle();
  return data?.rsvps_open ?? true;
}

/**
 * Give everyone without a match someone to write for.
 *
 * First, waiting writers are paired with people nobody is writing for yet
 * (never themselves). Those two groups are always the same size, so this
 * covers everyone except when the only person left unclaimed is the waiter
 * themselves. In that case they write for whoever has the fewest writers
 * (that card gets two notes), and they'll be claimed by the next person to
 * RSVP. Only the very first guest ever has to wait.
 */
async function matchWaiting() {
  const supabase = getSupabase();
  const { data } = await supabase.from(TABLE).select("id, target_id").order("created_at");
  const rows = (data ?? []) as { id: string; target_id: string | null }[];
  if (rows.length < 2) return;

  const writers = new Map<string, number>(rows.map((r) => [r.id, 0]));
  for (const r of rows) if (r.target_id && writers.has(r.target_id)) writers.set(r.target_id, writers.get(r.target_id)! + 1);

  const waiting = rows.filter((r) => !r.target_id).map((r) => r.id);
  if (!waiting.length) return;
  const unclaimed = rows.filter((r) => writers.get(r.id) === 0).map((r) => r.id);

  // Pair waiting → unclaimed at random, never with themselves.
  const plan = new Map<string, string>();
  const pool = shuffle(unclaimed);
  for (const w of shuffle(waiting)) {
    const i = pool.findIndex((u) => u !== w);
    if (i >= 0) {
      plan.set(w, pool.splice(i, 1)[0]);
    } else if (pool[0] === w) {
      // Only they are left: swap with someone already paired, if anyone.
      const earlier = [...plan.keys()][0];
      if (earlier) {
        plan.set(w, plan.get(earlier)!);
        plan.set(earlier, pool.splice(0, 1)[0]);
      }
    }
  }
  // Anyone still without a match writes for whoever has the fewest writers.
  for (const t of plan.values()) writers.set(t, writers.get(t)! + 1);
  for (const w of waiting) {
    if (plan.has(w)) continue;
    const others = shuffle(rows.filter((r) => r.id !== w));
    others.sort((a, b) => writers.get(a.id)! - writers.get(b.id)!);
    plan.set(w, others[0].id);
    writers.set(others[0].id, writers.get(others[0].id)! + 1);
  }

  for (const [writer, target] of plan) {
    // Only fill an empty slot, so two RSVPs landing together can't overwrite each other.
    await supabase.from(TABLE).update({ target_id: target }).eq("id", writer).is("target_id", null);
  }
}

async function guestCount() {
  const { count } = await getSupabase().from(TABLE).select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function getThanksgivingStatus(): Promise<{ open: boolean; count: number }> {
  try {
    return { open: await rsvpsOpen(), count: await guestCount() };
  } catch {
    return { open: false, count: 0 };
  }
}

export async function rsvpThanksgiving(
  input: { name: string; dish?: string }
): Promise<{ token?: string; me?: MyThanksgivingRsvp; error?: string }> {
  try {
    const name = clean(input.name, 40);
    const dish = clean(input.dish, 80) || null;
    if (name.length < 2) return { error: "Add your name as you'd like it on your place card." };
    if (!(await rsvpsOpen())) return { error: "RSVPs are closed now — speak to the organisers if you're coming." };

    const supabase = getSupabase();
    const { data: existing } = await supabase.from(TABLE).select("id").ilike("name", name.replace(/[%_\\]/g, "\\$&")).maybeSingle();
    if (existing) {
      return {
        error: `Someone called “${name}” has already RSVP’d. If that’s you, open the link from when you RSVP’d (or ask an organiser for it). Otherwise, add your surname.`,
      };
    }

    const token = makeToken();
    const { error } = await supabase.from(TABLE).insert({ token, name, dish });
    if (error) {
      if (error.code === "23505") return { error: `Someone called “${name}” has already RSVP’d — try adding your surname.` };
      return { error: "Couldn't save your RSVP. Please try again." };
    }

    // Return their match in the same call: a second action straight after this
    // one (or a revalidatePath refresh) left the page stuck on "Loading…".
    const me = await loadMe(token);
    return me ? { token, me } : { token };
  } catch {
    return { error: "Couldn't save your RSVP. Please try again." };
  }
}

export async function getMyThanksgivingRsvp(token: string): Promise<MyThanksgivingRsvp | null> {
  return loadMe(token);
}

/** A guest's own view, matching them first if they're still waiting. */
async function loadMe(token: string): Promise<MyThanksgivingRsvp | null> {
  try {
    if (!token || token.length > 64) return null;
    const supabase = getSupabase();
    const load = () => supabase.from(TABLE).select("id, name, dish, target_id, note").eq("token", token).maybeSingle();
    let { data: me } = await load();
    if (!me) return null;

    if (!me.target_id) {
      await matchWaiting();
      ({ data: me } = await load());
      if (!me) return null;
    }

    let target_name: string | null = null;
    if (me.target_id) {
      const { data: t } = await supabase.from(TABLE).select("name").eq("id", me.target_id).maybeSingle();
      target_name = t?.name ?? null;
    }

    return {
      name: me.name,
      dish: me.dish,
      target_name,
      note: target_name ? me.note : null,
      rsvps_open: await rsvpsOpen(),
      guest_count: await guestCount(),
    };
  } catch {
    return null;
  }
}

export async function saveMyThanksgivingNote(token: string, note: string): Promise<{ error?: string }> {
  try {
    const text = clean(note, THANKSGIVING_NOTE_MAX);
    if (text.length < 3) return { error: "Write a short sentence about them." };
    const supabase = getSupabase();
    const { data: me } = await supabase.from(TABLE).select("id, target_id").eq("token", token).maybeSingle();
    if (!me) return { error: "We couldn't find your RSVP." };
    if (!me.target_id) return { error: "You haven't been matched yet." };

    const { error } = await supabase.from(TABLE).update({ note: text, note_updated_at: new Date().toISOString() }).eq("id", me.id);
    if (error) return { error: "Couldn't save your note. Please try again." };
    return {};
  } catch {
    return { error: "Couldn't save your note. Please try again." };
  }
}

export async function updateMyThanksgivingDish(token: string, dish: string): Promise<{ error?: string }> {
  try {
    const { error } = await getSupabase().from(TABLE).update({ dish: clean(dish, 80) || null }).eq("token", token);
    return error ? { error: "Couldn't save that." } : {};
  } catch {
    return { error: "Couldn't save that." };
  }
}

/* ── Admin ──────────────────────────────────────────────────────────────── */

export async function adminGetThanksgiving(): Promise<{ rsvps: AdminThanksgivingRsvp[]; open: boolean }> {
  try {
    await requireAdminSession();
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("id, token, name, dish, target_id, note, extra_note, created_at")
      .order("created_at");
    if (error) return { rsvps: [], open: true };
    return { rsvps: (data ?? []) as AdminThanksgivingRsvp[], open: await rsvpsOpen() };
  } catch {
    return { rsvps: [], open: true };
  }
}

export async function adminSetThanksgivingOpen(open: boolean): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await getSupabase().from("thanksgiving_settings").upsert({ id: 1, rsvps_open: open });
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/thanksgiving");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Admin: add someone who can't RSVP themselves (they're matched like anyone else). */
export async function adminAddThanksgivingGuest(name: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const clean_name = clean(name, 40);
    if (clean_name.length < 2) return { error: "Add a name." };
    const { error } = await getSupabase().from(TABLE).insert({ token: makeToken(), name: clean_name });
    if (error) return { error: error.code === "23505" ? "That name is already on the list." : error.message };
    await matchWaiting();
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminUpdateThanksgivingRsvp(
  id: string,
  fields: { name?: string; note?: string; extra_note?: string }
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    if (!UUID.test(id)) return { error: "Bad id" };
    const update: Record<string, string | null> = {};
    if (fields.name !== undefined) {
      const n = clean(fields.name, 40);
      if (n.length < 2) return { error: "Name is too short." };
      update.name = n;
    }
    if (fields.note !== undefined) update.note = clean(fields.note, THANKSGIVING_NOTE_MAX) || null;
    if (fields.extra_note !== undefined) update.extra_note = clean(fields.extra_note, THANKSGIVING_NOTE_MAX) || null;
    const { error } = await getSupabase().from(TABLE).update(update).eq("id", id);
    if (error) return { error: error.code === "23505" ? "That name is already on the list." : error.message };
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Admin: remove a guest. Whoever was writing for them is re-matched (their note is cleared). */
export async function adminDeleteThanksgivingRsvp(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    if (!UUID.test(id)) return { error: "Bad id" };
    const supabase = getSupabase();
    await supabase.from(TABLE).update({ target_id: null, note: null, note_updated_at: null }).eq("target_id", id);
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) return { error: error.message };
    await matchWaiting();
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Admin: everything needed to print place cards. */
export async function adminGetPlaceCards(): Promise<PlaceCardData[]> {
  await requireAdminSession();
  const { data } = await getSupabase().from(TABLE).select("id, name, target_id, note, extra_note").order("name");
  const rows = (data ?? []) as { id: string; name: string; target_id: string | null; note: string | null; extra_note: string | null }[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    notes: [
      ...rows.filter((w) => w.target_id === r.id && w.note).map((w) => w.note!),
      ...(r.extra_note ? [r.extra_note] : []),
    ],
  }));
}
