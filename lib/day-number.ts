/**
 * The One Year Bible plan is day-number-indexed against a fixed real-world
 * calendar (Day 224 = Sept 12, 2026), so "today's day" can be computed
 * directly from the clock rather than looked up — it advances on its own
 * every real day, including for the 141 future days that were bulk-created
 * ahead of time with real (future) calendar dates in their created_at.
 */
const ANCHOR_DAY_NUMBER = 224;
const ANCHOR_DATE_UTC = Date.UTC(2026, 8, 12); // Sept 12, 2026

export function getCurrentDayNumber(): number {
  const diffDays = Math.floor((Date.now() - ANCHOR_DATE_UTC) / (1000 * 60 * 60 * 24));
  return Math.min(365, Math.max(1, ANCHOR_DAY_NUMBER + diffDays));
}
