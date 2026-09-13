"use client";

import { useEffect, useState } from "react";
import { getBibleVerse, getAvailableBibleVersions } from "@/lib/bible-actions";
import type { OneYearPlanDay } from "@/types/oneyear";
import type { BibleVerseResult, BibleVersionInfo } from "@/types/bible";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

interface ReadingState {
  loading: boolean;
  result?: BibleVerseResult;
  error?: string;
}

export default function PlanReadingSection({ day }: { day: OneYearPlanDay }) {
  const [expanded, setExpanded] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [states, setStates] = useState<Record<number, ReadingState>>({});
  const [versions, setVersions] = useState<(BibleVersionInfo & { configured: boolean })[]>([]);
  const [versionId, setVersionId] = useState("web");

  useEffect(() => {
    getAvailableBibleVersions().then(setVersions);
  }, []);

  async function fetchAll(forVersionId: string) {
    setHasFetched(true);
    const initial: Record<number, ReadingState> = {};
    day.readings.forEach((_, i) => (initial[i] = { loading: true }));
    setStates(initial);

    await Promise.all(
      day.readings.map(async (ref, i) => {
        try {
          const res = await getBibleVerse(ref, forVersionId);
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
    if (next && !hasFetched) fetchAll(versionId);
  }

  function handleVersionChange(newVersionId: string) {
    setVersionId(newVersionId);
    if (expanded) fetchAll(newVersionId);
  }

  return (
    <div className="rounded-2xl border-2 border-gold-soft/60 bg-gold-wash/15 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gold-wash/25 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-gold-deep uppercase tracking-widest mb-0.5" style={accent}>
            Day {day.day_number} · One Year Bible
          </p>
          <p className="text-sm font-bold text-ink" style={display}>
            {expanded ? "Reading" : "Read Today's Passage"}
          </p>
        </div>
        <span className="text-xs text-stone-mid flex-shrink-0">{expanded ? "Hide ▲" : "Open ▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-gold-soft/40 p-5 space-y-4 bg-white/60">
          <div className="flex items-center gap-2 justify-end">
            <label className="text-[10px] font-bold text-stone-mid uppercase tracking-wider" style={accent}>
              Translation
            </label>
            <select
              value={versionId}
              onChange={(e) => handleVersionChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-edge bg-white text-ink"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id} disabled={!v.configured}>
                  {v.abbreviation}
                  {!v.configured ? " (unavailable)" : ""}
                </option>
              ))}
            </select>
          </div>

          {day.readings.map((ref, i) => {
            const s = states[i];
            return (
              <div key={i}>
                <p className="text-xs font-bold text-gold-deep uppercase tracking-wider mb-1" style={accent}>
                  {ref}
                </p>
                {!s || s.loading ? (
                  <p className="text-xs text-stone-light italic">Loading…</p>
                ) : s.error ? (
                  <p className="text-xs text-danger-earthen">{s.error}</p>
                ) : s.result ? (
                  <p className="text-sm text-ink leading-relaxed italic">&ldquo;{s.result.text}&rdquo;</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
