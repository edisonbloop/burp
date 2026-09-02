"use server";

import { cookies } from "next/headers";
import { getSupabase } from "./supabase";
import { ASSESSED_ADMINS, RATING_QUESTIONS } from "@/types/admin-assessment";
import type {
  AdminAssessmentFormData,
  AdminAssessmentSubmission,
  AdminAssessmentRatingRow,
  AdminAggregateStats,
  RatingKey,
} from "@/types/admin-assessment";

async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

/**
 * Public: Submit one respondent's ratings for all assessed admins. Fully
 * anonymous — no submitter identity is captured anywhere.
 */
export async function submitAdminAssessment(
  data: AdminAssessmentFormData
): Promise<{ error?: string }> {
  try {
    const supabase = getSupabase();

    if (data.ratings.length !== ASSESSED_ADMINS.length) {
      return { error: "Please rate every admin before submitting." };
    }
    for (const r of data.ratings) {
      if (!ASSESSED_ADMINS.includes(r.admin_name)) {
        return { error: "Invalid admin name." };
      }
      for (const q of RATING_QUESTIONS) {
        const v = r[q.key];
        if (!Number.isInteger(v) || v < 1 || v > 5) {
          return { error: `Please rate "${q.label}" for ${r.admin_name}.` };
        }
      }
      if (!r.strength_text.trim()) {
        return { error: `Please share one thing ${r.admin_name} does well.` };
      }
      if (!r.growth_text.trim()) {
        return { error: `Please share one thing ${r.admin_name} could grow in.` };
      }
    }

    const { data: assessment, error: assessmentErr } = await supabase
      .from("admin_assessments")
      .insert({ overall_team_comment: data.overall_team_comment?.trim() || null })
      .select("id")
      .single();

    if (assessmentErr || !assessment) {
      return { error: assessmentErr?.message ?? "Something went wrong saving your response." };
    }

    const { error: ratingsErr } = await supabase.from("admin_assessment_ratings").insert(
      data.ratings.map((r) => ({
        assessment_id: assessment.id,
        admin_name: r.admin_name,
        responsiveness: r.responsiveness,
        communication: r.communication,
        fairness: r.fairness,
        leadership: r.leadership,
        overall: r.overall,
        strength_text: r.strength_text.trim(),
        growth_text: r.growth_text.trim(),
      }))
    );

    if (ratingsErr) {
      // Clean up the orphaned envelope row so we don't leave a partial submission.
      await supabase.from("admin_assessments").delete().eq("id", assessment.id);
      return { error: ratingsErr.message };
    }

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/**
 * Admin: Full results — per-admin averages plus every individual (anonymous)
 * submission, for reading qualitative feedback in context.
 */
export async function getAdminAssessmentResults(): Promise<{
  stats: AdminAggregateStats[];
  submissions: AdminAssessmentSubmission[];
}> {
  await requireAdminSession();
  const supabase = getSupabase();

  const { data: assessments } = await supabase
    .from("admin_assessments")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: ratings } = await supabase
    .from("admin_assessment_ratings")
    .select("*");

  const allRatings = (ratings as AdminAssessmentRatingRow[]) ?? [];
  const ratingsByAssessment = new Map<string, AdminAssessmentRatingRow[]>();
  for (const r of allRatings) {
    const list = ratingsByAssessment.get(r.assessment_id) ?? [];
    list.push(r);
    ratingsByAssessment.set(r.assessment_id, list);
  }

  const submissions: AdminAssessmentSubmission[] = (assessments ?? []).map((a) => ({
    id: a.id,
    overall_team_comment: a.overall_team_comment,
    created_at: a.created_at,
    ratings: ratingsByAssessment.get(a.id) ?? [],
  }));

  const stats: AdminAggregateStats[] = ASSESSED_ADMINS.map((name) => {
    const rows = allRatings.filter((r) => r.admin_name === name);
    const averages = {} as Record<RatingKey, number>;
    for (const q of RATING_QUESTIONS) {
      averages[q.key] = rows.length
        ? Math.round((rows.reduce((sum, r) => sum + r[q.key], 0) / rows.length) * 10) / 10
        : 0;
    }
    return { admin_name: name, responseCount: rows.length, averages };
  });

  return { stats, submissions };
}

/**
 * Admin: Permanently delete one submission (its ratings go with it via cascade).
 */
export async function deleteAdminAssessment(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = getSupabase();

    const { error } = await supabase.from("admin_assessments").delete().eq("id", id);
    if (error) return { error: error.message };

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
}
