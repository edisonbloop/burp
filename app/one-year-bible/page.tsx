"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getOneYearPlanDays } from "@/lib/oneyear-actions";
import { getAvailableBibleVersions } from "@/lib/bible-actions";
import OneYearDayCard from "@/components/OneYearDayCard";
import { MONTH_NAMES } from "@/types/oneyear";
import type { OneYearPlanDay } from "@/types/oneyear";
import type { BibleVersionInfo } from "@/types/bible";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

export default function OneYearBiblePage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [days, setDays] = useState<OneYearPlanDay[]>([]);
  const [versions, setVersions] = useState<(BibleVersionInfo & { configured: boolean })[]>([]);
  const [versionId, setVersionId] = useState("web");
  const [openMonth, setOpenMonth] = useState<number | null>(null);
  const [jumpValue, setJumpValue] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const [d, v] = await Promise.all([getOneYearPlanDays(), getAvailableBibleVersions()]);
        if (!active) return;
        setDays(d);
        setVersions(v);
        if (d.length > 0) setOpenMonth(d[0].month);
      } catch (e) {
        if (!active) return;
        setLoadError(e instanceof Error ? e.message : "Something went wrong loading the reading plan.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const byMonth = useMemo(() => {
    const map = new Map<number, OneYearPlanDay[]>();
    for (const d of days) {
      const list = map.get(d.month) ?? [];
      list.push(d);
      map.set(d.month, list);
    }
    return map;
  }, [days]);

  function handleJump(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(jumpValue, 10);
    const target = days.find((d) => d.day_number === n);
    if (target) setOpenMonth(target.month);
  }

  const inputCls =
    "px-3.5 py-2.5 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140" style={accent}>
            ← B U R P
          </Link>
        </div>
      </div>

      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
        style={{ background: "radial-gradient(ellipse 120% 90% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)" }}
      >
        <span className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3" style={accent}>
          365 Days · Chronological Order
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-tight mb-4" style={display}>
          One Year Bible
        </h1>
        <p className="text-sm text-stone-mid max-w-lg mx-auto">
          Read through the whole Bible in a year, in the order events happened — Day 1 through Day 365. Start
          whenever you like.
        </p>
      </section>

      <section className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {loading && <p className="text-center text-sm text-stone-mid py-16">Loading…</p>}

        {!loading && loadError && (
          <div className="text-center py-16">
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 inline-block">{loadError}</p>
            <br />
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !loadError && days.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-ink mb-3" style={display}>
              Nothing here yet
            </h2>
            <p className="text-sm text-stone-mid">The reading plan hasn&rsquo;t been set up yet.</p>
          </div>
        )}

        {!loading && !loadError && days.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-2xl border border-stone-edge bg-parchment-soft">
              <form onSubmit={handleJump} className="flex items-center gap-2">
                <input
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  placeholder="Jump to day #"
                  className={`${inputCls} w-32`}
                  inputMode="numeric"
                />
                <button type="submit" className="px-3 py-2.5 rounded-xl border border-stone-edge text-xs font-bold uppercase tracking-wider hover:border-gold" style={accent}>
                  Go
                </button>
              </form>
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs font-bold text-stone-mid uppercase tracking-wider" style={accent}>
                  Translation
                </label>
                <select value={versionId} onChange={(e) => setVersionId(e.target.value)} className={inputCls}>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.configured}>
                      {v.abbreviation}
                      {!v.configured ? " (unavailable)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {MONTH_NAMES.map((name, idx) => {
                const month = idx + 1;
                const monthDays = byMonth.get(month) ?? [];
                if (monthDays.length === 0) return null;
                const isOpen = openMonth === month;
                return (
                  <div key={month} className="rounded-2xl border border-stone-edge bg-white overflow-hidden">
                    <button
                      onClick={() => setOpenMonth(isOpen ? null : month)}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-parchment-soft/40 transition-colors"
                    >
                      <p className="text-lg font-bold text-ink" style={display}>
                        {name}
                      </p>
                      <span className="text-xs text-stone-light">
                        Days {monthDays[0].day_number}–{monthDays[monthDays.length - 1].day_number} {isOpen ? "▲" : "▼"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-stone-edge/50 p-4 space-y-2 bg-parchment-soft/30">
                        {monthDays.map((d) => (
                          <OneYearDayCard key={d.id} day={d} versionId={versionId} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest" style={accent}>
          BURP · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
