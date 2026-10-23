"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import type { BirthdayCard, BirthdayCardInput, BirthdayMessage, BirthdayTheme, Celebrant } from "@/types/birthday";

/**
 * Birthday cards — a group card anyone can sign, no sign-in required.
 * The organiser holds a secret manage_key (only ever in their manage link);
 * every change to a card is checked against it here.
 */

const THEMES: BirthdayTheme[] = ["gold", "blush", "midnight", "garden"];
const MAX_CARD_PHOTOS = 12;
const MAX_PHOTO_BYTES = 750 * 1024; // the browser compresses to ≤700 KB; server actions cap bodies at 1 MB
const PUBLIC_COLUMNS =
  "id, slug, honoree_name, birthday, turning_age, headline, organiser_name, organiser_note, photo_urls, theme, accepting_messages, created_at";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean = (s: string | null | undefined, max: number) => (s ?? "").trim().slice(0, max);

function makeSlug() {
  // 10 chars of base32-ish, no look-alike characters
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(randomBytes(10), (b) => alphabet[b % alphabet.length]).join("");
}

function isOurPhoto(url: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!base && url.startsWith(`${base}/storage/v1/object/public/birthday/`);
}

function validateCard(input: BirthdayCardInput): { data?: Omit<BirthdayCard, "id" | "slug" | "accepting_messages" | "created_at">; error?: string } {
  // person_id is deliberately not handled here: it's set once, at creation.
  const honoree_name = clean(input.honoree_name, 60);
  const organiser_name = clean(input.organiser_name, 60);
  if (!honoree_name) return { error: "Who's the birthday for?" };
  if (!organiser_name) return { error: "Add your name so they know who started the card." };

  const age = input.turning_age ? Math.round(Number(input.turning_age)) : null;
  if (age !== null && (Number.isNaN(age) || age < 1 || age > 130)) return { error: "That age doesn't look right." };

  const birthday = input.birthday && /^\d{4}-\d{2}-\d{2}$/.test(input.birthday) ? input.birthday : null;
  const photo_urls = (input.photo_urls ?? []).filter(isOurPhoto).slice(0, MAX_CARD_PHOTOS);

  return {
    data: {
      honoree_name,
      organiser_name,
      birthday,
      turning_age: age,
      headline: clean(input.headline, 80) || null,
      organiser_note: clean(input.organiser_note, 1500) || null,
      photo_urls,
      theme: THEMES.includes(input.theme) ? input.theme : "gold",
    },
  };
}

/** Upload one (already compressed) photo. Returns its public URL. */
export async function uploadBirthdayPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No photo received." };
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return { error: "Please choose a JPG, PNG or WebP image." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "That photo is too large." };

  try {
    const supabase = getSupabase();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `photos/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("birthday")
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (error) return { error: "Couldn't upload photo — " + error.message };
    return { url: supabase.storage.from("birthday").getPublicUrl(path).data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't upload photo." };
  }
}

export async function createBirthdayCard(
  input: BirthdayCardInput
): Promise<{ slug?: string; manageKey?: string; error?: string }> {
  const { data, error } = validateCard(input);
  if (!data) return { error };

  try {
    const supabase = getSupabase();
    let personId: string | null = null;
    if (input.person_id && UUID.test(input.person_id)) {
      const { data: person } = await supabase.from("people").select("id").eq("id", input.person_id).maybeSingle();
      personId = person?.id ?? null;
    }
    const manageKey = randomBytes(18).toString("hex");
    for (let attempt = 0; attempt < 3; attempt++) {
      const slug = makeSlug();
      const { error: insertError } = await supabase
        .from("birthday_cards")
        .insert({ ...data, slug, manage_key: manageKey, ...(personId ? { person_id: personId } : {}) });
      if (!insertError) return { slug, manageKey };
      if (insertError.code !== "23505") return { error: insertError.message };
    }
    return { error: "Couldn't create the card — please try again." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't create the card." };
  }
}

export async function getBirthdayCard(
  slug: string
): Promise<{ card: BirthdayCard; messages: BirthdayMessage[] } | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data: card, error } = await supabase
    .from("birthday_cards")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !card) return null;

  const { data: messages } = await supabase
    .from("birthday_card_messages")
    .select("*")
    .eq("card_id", card.id)
    .order("created_at", { ascending: true });

  return { card: card as BirthdayCard, messages: (messages ?? []) as BirthdayMessage[] };
}

/** Returns the card only when the key matches. */
export async function getBirthdayCardForManager(slug: string, key: string) {
  if (!key) return null;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("birthday_cards")
    .select("id")
    .eq("slug", slug)
    .eq("manage_key", key)
    .maybeSingle();
  if (!data) return null;
  return getBirthdayCard(slug);
}

async function cardIdForKey(slug: string, key: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("birthday_cards")
    .select("id")
    .eq("slug", slug)
    .eq("manage_key", key)
    .maybeSingle();
  return data?.id as string | undefined;
}

export async function signBirthdayCard(
  slug: string,
  input: { author_name: string; message: string; photo_url?: string | null }
): Promise<{ error?: string }> {
  const author_name = clean(input.author_name, 60);
  const message = clean(input.message, 1500);
  if (!author_name) return { error: "Add your name so they know who it's from." };
  if (message.length < 2) return { error: "Write a little something first 🙂" };
  const photo_url = input.photo_url && isOurPhoto(input.photo_url) ? input.photo_url : null;

  try {
    const supabase = getSupabase();
    const { data: card } = await supabase
      .from("birthday_cards")
      .select("id, accepting_messages")
      .eq("slug", slug)
      .maybeSingle();
    if (!card) return { error: "This card doesn't exist any more." };
    if (!card.accepting_messages) return { error: "This card has been sealed — messages are closed." };

    const { error } = await supabase
      .from("birthday_card_messages")
      .insert({ card_id: card.id, author_name, message, photo_url });
    if (error) return { error: error.message };

    revalidatePath(`/birthday/${slug}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't add your message." };
  }
}

export async function updateBirthdayCard(
  slug: string,
  key: string,
  input: BirthdayCardInput & { accepting_messages: boolean }
): Promise<{ error?: string }> {
  const { data, error } = validateCard(input);
  if (!data) return { error };
  try {
    const id = await cardIdForKey(slug, key);
    if (!id) return { error: "This manage link isn't valid." };
    const { error: updateError } = await getSupabase()
      .from("birthday_cards")
      .update({ ...data, accepting_messages: !!input.accepting_messages })
      .eq("id", id);
    if (updateError) return { error: updateError.message };
    revalidatePath(`/birthday/${slug}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't save changes." };
  }
}

export async function deleteBirthdayMessage(slug: string, key: string, messageId: string): Promise<{ error?: string }> {
  try {
    const id = await cardIdForKey(slug, key);
    if (!id) return { error: "This manage link isn't valid." };
    const { error } = await getSupabase()
      .from("birthday_card_messages")
      .delete()
      .eq("id", messageId)
      .eq("card_id", id);
    if (error) return { error: error.message };
    revalidatePath(`/birthday/${slug}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't remove that message." };
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Community members with a known birthday, soonest first — for pre-filling
 * the create form. Names + birthdays come from the private CRM roster, so
 * this only answers signed-in members (verified from their access token).
 */
export async function getCelebrants(
  accessToken: string | null
): Promise<{ signedIn: boolean; celebrants: Celebrant[] }> {
  if (!accessToken) return { signedIn: false, celebrants: [] };
  try {
    const supabase = getSupabase();
    const { data: auth } = await supabase.auth.getUser(accessToken);
    if (!auth.user) return { signedIn: false, celebrants: [] };

    const { data: people } = await supabase
      .from("people")
      .select("id, full_name, birthday_month, birthday_day")
      .neq("status", "inactive")
      .not("birthday_month", "is", null)
      .not("birthday_day", "is", null);
    if (!people?.length) return { signedIn: true, celebrants: [] };

    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const celebrants: Celebrant[] = people.map((p) => {
      let next = Date.UTC(now.getUTCFullYear(), p.birthday_month - 1, p.birthday_day);
      if (next < today) next = Date.UTC(now.getUTCFullYear() + 1, p.birthday_month - 1, p.birthday_day);
      return {
        person_id: p.id,
        full_name: p.full_name,
        first_name: p.full_name.trim().split(/\s+/)[0],
        month: p.birthday_month,
        day: p.birthday_day,
        next_birthday: new Date(next).toISOString().slice(0, 10),
        days_away: Math.round((next - today) / DAY_MS),
        existing_card: null,
      };
    });

    // A card counts as "for this birthday" if it was started within the 60
    // days before it. Fails quietly if the person_id column isn't there yet.
    const { data: cards } = await supabase
      .from("birthday_cards")
      .select("slug, organiser_name, person_id, created_at")
      .in("person_id", celebrants.map((c) => c.person_id))
      .gte("created_at", new Date(today - 60 * DAY_MS).toISOString())
      .order("created_at", { ascending: false });
    for (const c of celebrants) {
      const windowStart = Date.parse(c.next_birthday) - 60 * DAY_MS;
      const card = cards?.find((k) => k.person_id === c.person_id && Date.parse(k.created_at) >= windowStart);
      if (card) c.existing_card = { slug: card.slug, organiser_name: card.organiser_name };
    }

    celebrants.sort((a, b) => a.days_away - b.days_away || a.full_name.localeCompare(b.full_name));
    return { signedIn: true, celebrants };
  } catch {
    return { signedIn: false, celebrants: [] };
  }
}
