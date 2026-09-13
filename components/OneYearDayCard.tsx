"use client";

import { useState } from "react";
import { getBibleVerse } from "@/lib/bible-actions";
import type { OneYearPlanDay } from "@/types/oneyear";
import type { BibleVerseResult } from "@/types/bible";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

interface ReadingState {
  loading: boolean;
  result?: BibleVerseResult;
  error?: string;
}

export default function OneYearDayCard({ day, versionId }: { day: OneYearPlanDay; versionId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [states, setStates] = useState<Record<number, ReadingState>>({});
  const [hasFetched, setHasFetched] = useState(false);

  async function fetchAll() {
    setHasFetched(true);
    const initial: Record<number, ReadingState> = {};
    day.readings.forEach((_, i) => (initial[i] = { loading: true }));
    setStates(initial);

    await Promise.all(
      day.readings.map(async (ref, i) => {
        try {
          const res = await getBibleVerse(ref, versionId);
          setStates((prev) => ({
            ...prev,
            [i]: res.error ? { loading: false, error: res.error } : { loading: false, result: res.result },
          }));
        } catch (e) {
          setStates((prev) => ({
            ...prev,
            [i]: { loading: false, error: e instanceof Error ? e.message : "Lookup failed." },
          }));
        }
      })
    );
  }

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !hasFetched) fetchAll();
  }

  return (
    <div className="rounded-xl border border-stone-edge bg-white overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-parchment-soft/50 transition-colors">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gold-deep uppercase tracking-wider" style={accent}>
            Day {day.day_number}
          </p>
          <p className="text-sm text-ink font-medium truncate">{day.readings.join(" · ")}</p>
        </div>
        <span className="text-xs text-stone-light flex-shrink-0">{expanded ? "Hide" : "Read"}</span>
      </button>

      {expanded && (
        <div className="border-t border-stone-edge/50 p-4 bg-parchment-soft space-y-4">
          {day.readings.map((ref, i) => {
            const s = states[i];
            return (
              <div key={i}>
                <p className="text-xs font-bold text-stone uppercase tracking-wider mb-1" style={accent}>
                  {ref}
                </p>
                {!s || s.loading ? (
                  <p className="text-xs text-stone-light italic">Loading…</p>
                ) : s.error ? (
                  <p className="text-xs text-danger-earthen">{s.error}</p>
                ) : s.result ? (
                  <p className="text-sm text-ink leading-relaxed italic" style={display}>
                    &ldquo;{s.result.text}&rdquo;
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
