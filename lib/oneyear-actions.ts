"use server";

import { getSupabase } from "./supabase";
import type { OneYearPlanDay } from "@/types/oneyear";

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
