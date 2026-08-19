"use client";

import { useEffect, useState } from "react";
import { getAvailableBibleVersions, getBibleVerse } from "@/lib/bible-actions";
import type { BibleVersionInfo, BibleVerseResult } from "@/types/bible";

const accent = { fontFamily: "var(--font-accent)" };

interface VerseLookupProps {
  /** Called when the user chooses to use a fetched result (e.g. insert into a form field). */
  onInsert?: (result: BibleVerseResult) => void;
  /** Label on the insert button. */
  insertLabel?: string;
  /** Pre-fill the reference field, e.g. when editing an existing entry. */
  initialReference?: string;
  compact?: boolean;
}

export default function VerseLookup({
  onInsert,
  insertLabel = "Use This",
  initialReference = "",
  compact = false,
}: VerseLookupProps) {
  const [versions, setVersions] = useState<(BibleVersionInfo & { configured: boolean })[]>([]);
  const [versionId, setVersionId] = useState("kjv");
  const [reference, setReference] = useState(initialReference);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BibleVerseResult | null>(null);

  useEffect(() => {
    getAvailableBibleVersions().then(setVersions);
  }, []);

  async function handleLookup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!reference.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await getBibleVerse(reference.trim(), versionId);
      if (res.error) setError(res.error);
      else if (res.result) setResult(res.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "px-3.5 py-2.5 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

  return (
    <div className={compact ? "" : "space-y-3"}>
      <form onSubmit={handleLookup} className="flex flex-wrap gap-2">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder='e.g. "John 3:16" or "Psalm 23:1-3"'
          className={`${inputCls} flex-1 min-w-[180px]`}
        />
        <select value={versionId} onChange={(e) => setVersionId(e.target.value)} className={inputCls}>
          {versions.map((v) => (
            <option key={v.id} value={v.id} disabled={!v.configured}>
              {v.abbreviation}
              {!v.configured ? " (needs setup)" : ""}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !reference.trim()}
          className="px-4 py-2.5 rounded-xl bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          style={accent}
        >
          {loading ? "Looking up…" : "Look Up"}
        </button>
      </form>

      {error && (
        <p className="text-xs text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
          {error}
        </p>
      )}

      {result && (
        <div className="p-4 rounded-xl bg-parchment-soft border border-stone-edge">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-bold text-gold-deep uppercase tracking-wider" style={accent}>
              {result.reference} · {result.versionAbbreviation}
            </p>
            {onInsert && (
              <button
                type="button"
                onClick={() => onInsert(result)}
                className="text-[10px] font-bold text-gold hover:text-gold-deep uppercase tracking-wider flex-shrink-0"
              >
                {insertLabel} →
              </button>
            )}
          </div>
          <p className="text-sm text-ink leading-relaxed italic">&ldquo;{result.text}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
