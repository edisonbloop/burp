"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAvailableBibleVersions, getBibleVerse } from "@/lib/bible-actions";
import type { BibleVersionInfo, BibleVerseResult } from "@/types/bible";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

type VersionResult =
  | { status: "loading"; version: BibleVersionInfo }
  | { status: "done"; version: BibleVersionInfo; result: BibleVerseResult }
  | { status: "error"; version: BibleVersionInfo; error: string };

export default function ScripturePage() {
  const [versions, setVersions] = useState<(BibleVersionInfo & { configured: boolean })[]>([]);
  const [reference, setReference] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<VersionResult[]>([]);

  useEffect(() => {
    getAvailableBibleVersions().then(setVersions);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const ref = reference.trim();
    if (!ref) return;

    const configured = versions.filter((v) => v.configured);
    if (configured.length === 0) return;

    setSearching(true);
    setResults(configured.map((v) => ({ status: "loading", version: v })));

    const settled = await Promise.all(
      configured.map(async (v) => {
        try {
          const res = await getBibleVerse(ref, v.id);
          if (res.error || !res.result) {
            return { status: "error" as const, version: v, error: res.error ?? "Not found." };
          }
          return { status: "done" as const, version: v, result: res.result };
        } catch (e) {
          return {
            status: "error" as const,
            version: v,
            error: e instanceof Error ? e.message : "Lookup failed.",
          };
        }
      })
    );

    setResults(settled);
    setSearching(false);
  }

  const inputCls =
    "px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

  const unconfigured = versions.filter((v) => !v.configured);

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={accent}
          >
            ← B U R P
          </Link>
        </div>
      </div>

      <section
        className="py-16 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)",
        }}
      >
        <span
          className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
          style={accent}
        >
          Acts 17:11 · Searched the Scriptures Daily
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-tight mb-6" style={display}>
          Search the Scriptures
        </h1>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder='e.g. "John 3:16" or "Romans 8:28-30"'
            className={`${inputCls} flex-1 min-w-[220px]`}
          />
          <button
            type="submit"
            disabled={searching || !reference.trim()}
            className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-colors disabled:opacity-60"
            style={accent}
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </form>
      </section>

      <section className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {results.length === 0 && (
          <p className="text-center text-sm text-stone-mid italic">
            Enter any reference above to compare it across every available translation.
          </p>
        )}

        {/* Never surface per-version errors to visitors — just quietly omit that version. */}
        {(() => {
          const visible = results.filter((r) => r.status !== "error");
          const settledCount = results.filter((r) => r.status !== "loading").length;
          const allErrored = results.length > 0 && settledCount === results.length && visible.length === 0;

          if (allErrored) {
            return (
              <p className="text-center text-sm text-stone-mid italic">
                Couldn&rsquo;t find that reference — try a different one, e.g. &ldquo;John 3:16&rdquo;.
              </p>
            );
          }

          return (
            <div className="space-y-4">
              {visible.map((r) => (
                <div key={r.version.id} className="p-5 rounded-2xl border border-stone-edge bg-white">
                  <p className="text-xs font-bold text-gold-deep uppercase tracking-widest mb-2" style={accent}>
                    {r.version.abbreviation} · {r.version.label}
                  </p>
                  {r.status === "loading" && <p className="text-sm text-stone-light">Looking up…</p>}
                  {r.status === "done" && (
                    <>
                      <p className="text-sm text-stone-light mb-2">{r.result.reference}</p>
                      <p className="text-base text-ink leading-relaxed italic">
                        &ldquo;{r.result.text}&rdquo;
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {unconfigured.length > 0 && (
          <p className="mt-10 text-center text-[11px] text-stone-light">
            {unconfigured.map((v) => v.abbreviation).join(", ")} coming soon — awaiting setup.
          </p>
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
