"use server";

import { getSupabase } from "./supabase";
import type { OneYearPlanDay } from "@/types/oneyear";

/**
 * Public: All 365 days of the reading plan (references only — no verse text).
 * Ordered by day_number so callers can render Day 1 -> Day 365 directly.
 */
export async function getOneYearPlanDays(): Promise<OneYearPlanDay[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("one_year_plan_days")
    .select("*")
    .order("day_number", { ascending: true });

  if (error) {
    console.error("Error fetching one-year plan days:", error);
    return [];
  }

  return (data as OneYearPlanDay[]) ?? [];
}

/**
 * Public: A single day's readings by day number (1-365).
 */
export async function getOneYearPlanDay(dayNumber: number): Promise<OneYearPlanDay | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("one_year_plan_days")
    .select("*")
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) {
    console.error("Error fetching one-year plan day:", error);
    return null;
  }

  return (data as OneYearPlanDay | null) ?? null;
}
