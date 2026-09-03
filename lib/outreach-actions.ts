"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";
import { MAX_VOTES_PER_PERSON } from "@/types/outreach";
import type {
  OutreachRound,
  OutreachIdea,
  OutreachComment,
  OutreachIdeaWithComments,
  NewIdeaFormData,
  CommentFormData,
  VoteTally,
  OutreachPhase,
} from "@/types/outreach";

async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * Public: The round everyone interacts with — the most recently created one.
 */
export async function getActiveRound(): Promise<OutreachRound | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("outreach_rounds")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching outreach round:", error);
    return null;
  }

  return (data as OutreachRound | null) ?? null;
}

/**
 * Public: All approved ideas for a round (shortlisted + general list),
 * each with its comments attached.
 */
export async function getRoundIdeas(roundId: string): Promise<OutreachIdeaWithComments[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data: ideas, error: ideasErr } = await supabase
    .from("outreach_ideas")
    .select("*")
    .eq("round_id", roundId)
    .eq("approved", true)
    .order("is_shortlisted", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (ideasErr) {
    console.error("Error fetching outreach ideas:", ideasErr);
    return [];
  }

  const ideaIds = (ideas ?? []).map((i) => i.id);
  if (ideaIds.length === 0) return [];

  const { data: comments } = await supabase
    .from("outreach_comments")
    .select("*")
    .in("idea_id", ideaIds)
    .order("created_at", { ascending: true });

  const commentsByIdea = new Map<string, OutreachComment[]>();
  for (const c of (comments as OutreachComment[]) ?? []) {
    const list = commentsByIdea.get(c.idea_id) ?? [];
    list.push(c);
    commentsByIdea.set(c.idea_id, list);
  }

  return (ideas as OutreachIdea[]).map((idea) => ({
    ...idea,
    comments: commentsByIdea.get(idea.id) ?? [],
  }));
}

/**
 * Public: Which idea IDs this browser has already voted for in this round
 * (so the UI can show their existing picks and let them change their mind).
 */
export async function getMyVotes(roundId: string, voterToken: string): Promise<string[]> {
  if (!voterToken) return [];
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data } = await supabase
    .from("outreach_votes")
    .select("idea_id")
    .eq("round_id", roundId)
    .eq("voter_token", voterToken);

  return (data ?? []).map((v) => v.idea_id);
}

/**
 * Public: Post a comment on an idea. Open — no sign-in, not moderated.
 */
export async function submitComment(data: CommentFormData): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();

    const name = data.name.trim();
    const comment = data.comment.trim();
    if (!name || !comment) return { error: "Please add your name and a comment." };
    if (comment.length > 1000) return { error: "Please keep your comment under 1000 characters." };

    const { error } = await supabase.from("outreach_comments").insert({
      idea_id: data.idea_id,
      name,
      comment,
    });

    if (error) return { error: error.message };

    revalidatePath("/outreach");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Public: Submit a new idea not already on the list. Goes to pending review
 * before it appears publicly.
 */
export async function submitNewIdea(data: NewIdeaFormData): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();

    const name = data.name.trim();
    const title = data.title.trim();
    const description = data.description.trim();
    if (!name || !title || !description) {
      return { error: "Please fill in your name, a title, and a description." };
    }

    const { error } = await supabase.from("outreach_ideas").insert({
      round_id: data.round_id,
      title,
      description,
      submitted_by_name: name,
      is_shortlisted: false,
      approved: false,
    });

    if (error) return { error: error.message };

    revalidatePath("/outreach");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Public: Submit (or replace) this browser's votes for the poll. Full
 * replace — lets someone change their mind before the poll closes.
 */
export async function submitVotes(
  roundId: string,
  voterToken: string,
  ideaIds: string[]
): Promise<{ error?: string }> {
  try {
    if (!voterToken) return { error: "Missing voter token — please refresh and try again." };
    if (ideaIds.length === 0) return { error: "Pick at least one idea." };
    if (ideaIds.length > MAX_VOTES_PER_PERSON) {
      return { error: `Please pick up to ${MAX_VOTES_PER_PERSON} ideas.` };
    }

    const supabase = getSupabase();

    const { data: round } = await supabase
      .from("outreach_rounds")
      .select("phase")
      .eq("id", roundId)
      .single();

    if (!round || round.phase !== "poll_open") {
      return { error: "Voting isn't open right now." };
    }

    const { data: validIdeas } = await supabase
      .from("outreach_ideas")
      .select("id")
      .eq("round_id", roundId)
      .eq("is_shortlisted", true)
      .in("id", ideaIds);

    if (!validIdeas || validIdeas.length !== ideaIds.length) {
      return { error: "One or more selected ideas aren't part of this poll." };
    }

    await supabase.from("outreach_votes").delete().eq("round_id", roundId).eq("voter_token", voterToken);

    const { error } = await supabase.from("outreach_votes").insert(
      ideaIds.map((idea_id) => ({ round_id: roundId, idea_id, voter_token: voterToken }))
    );

    if (error) return { error: error.message };

    revalidatePath("/outreach");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Public (only meaningful once the round is closed): Final vote tallies.
 */
export async function getPublicVoteResults(roundId: string): Promise<VoteTally[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data: round } = await supabase.from("outreach_rounds").select("phase").eq("id", roundId).single();
  if (!round || round.phase !== "closed") return [];

  return computeVoteTallies(roundId);
}

async function computeVoteTallies(roundId: string): Promise<VoteTally[]> {
  const supabase = getSupabase();

  const { data: ideas } = await supabase
    .from("outreach_ideas")
    .select("id, title")
    .eq("round_id", roundId)
    .eq("is_shortlisted", true);

  const { data: votes } = await supabase.from("outreach_votes").select("idea_id").eq("round_id", roundId);

  const counts = new Map<string, number>();
  for (const v of votes ?? []) counts.set(v.idea_id, (counts.get(v.idea_id) ?? 0) + 1);

  return (ideas ?? [])
    .map((i) => ({ idea_id: i.id, title: i.title, count: counts.get(i.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

// ── Admin ──────────────────────────────────────────────────────────────

export async function adminCreateRound(title: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase.from("outreach_rounds").insert({ title: title.trim(), phase: "collecting" });
    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create round" };
  }
}

export async function adminSetRoundPhase(roundId: string, phase: OutreachPhase): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase.from("outreach_rounds").update({ phase }).eq("id", roundId);
    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update phase" };
  }
}

export async function adminCreateIdea(
  roundId: string,
  data: { title: string; summary?: string; description: string; is_shortlisted: boolean; display_order?: number }
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    if (!data.title.trim() || !data.description.trim()) {
      return { error: "Title and description are required." };
    }

    const { error } = await supabase.from("outreach_ideas").insert({
      round_id: roundId,
      title: data.title.trim(),
      summary: data.summary?.trim() || null,
      description: data.description.trim(),
      is_shortlisted: data.is_shortlisted,
      display_order: data.display_order ?? 0,
      approved: true,
    });

    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to add idea" };
  }
}

export async function adminUpdateIdea(
  id: string,
  data: { title: string; summary?: string; description: string }
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    if (!data.title.trim() || !data.description.trim()) {
      return { error: "Title and description are required." };
    }

    const { error } = await supabase
      .from("outreach_ideas")
      .update({
        title: data.title.trim(),
        summary: data.summary?.trim() || null,
        description: data.description.trim(),
      })
      .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update idea" };
  }
}

export async function adminSetIdeaApproval(id: string, approved: boolean): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase.from("outreach_ideas").update({ approved }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update approval" };
  }
}

export async function adminSetIdeaShortlisted(id: string, isShortlisted: boolean): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase
      .from("outreach_ideas")
      .update({ is_shortlisted: isShortlisted })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update shortlist" };
  }
}

export async function adminDeleteIdea(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase.from("outreach_ideas").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete idea" };
  }
}

export async function adminDeleteComment(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();
    const { error } = await supabase.from("outreach_comments").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/outreach");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete comment" };
  }
}

/**
 * Admin: Full round overview — every idea (approved + pending), comment
 * counts, and live vote tallies regardless of phase.
 */
export async function adminGetRoundOverview(roundId: string): Promise<{
  ideas: (OutreachIdea & { commentCount: number })[];
  tallies: VoteTally[];
  totalVoters: number;
}> {
  await requireAdminSession();
  const supabase = getSupabase();

  const { data: ideas } = await supabase
    .from("outreach_ideas")
    .select("*")
    .eq("round_id", roundId)
    .order("is_shortlisted", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const ideaIds = (ideas ?? []).map((i) => i.id);
  const { data: comments } = ideaIds.length
    ? await supabase.from("outreach_comments").select("idea_id").in("idea_id", ideaIds)
    : { data: [] };

  const commentCounts = new Map<string, number>();
  for (const c of comments ?? []) commentCounts.set(c.idea_id, (commentCounts.get(c.idea_id) ?? 0) + 1);

  const { data: voters } = await supabase.from("outreach_votes").select("voter_token").eq("round_id", roundId);
  const totalVoters = new Set((voters ?? []).map((v) => v.voter_token)).size;

  const tallies = await computeVoteTallies(roundId);

  return {
    ideas: (ideas as OutreachIdea[]).map((i) => ({ ...i, commentCount: commentCounts.get(i.id) ?? 0 })),
    tallies,
    totalVoters,
  };
}
