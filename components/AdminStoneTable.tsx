"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStoneApproval, updateStoneFeatured, deleteStone } from "@/lib/actions";
import type { Stone } from "@/types/stones";

export default function AdminStoneTable({ stones: initialStones }: { stones: Stone[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = initialStones.filter((s) => {
    if (filter === "pending" && s.approved) return false;
    if (filter === "approved" && !s.approved) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.journey_word.toLowerCase().includes(q) ||
      s.remembrance.toLowerCase().includes(q) ||
      (s.contact?.toLowerCase().includes(q) ?? false)
    );
  });

  const pending = initialStones.filter((s) => !s.approved).length;

  function act(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function confirmDelete(id: string, name: string) {
    if (confirm(`Delete stone from "${name}"? This cannot be undone.`))
      act(() => deleteStone(id));
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Pending callout */}
      {pending > 0 && filter !== "approved" && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-amber-600 font-bold text-lg">{pending}</span>
          <p className="text-base text-amber-700 font-medium">
            stone{pending === 1 ? "" : "s"} waiting for approval
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search by name, word, remembrance…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <div className="flex gap-2">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ fontFamily: "var(--font-accent)" }}
              className={`text-xs px-4 py-2 rounded-lg border font-bold tracking-widest uppercase transition-colors ${
                filter === f
                  ? "bg-ink text-vellum border-ink"
                  : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
              }`}
            >
              {f}
              {f === "pending" && pending > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-stone-mid mb-4 font-medium">
        {filtered.length} submission{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm">
          {filter === "pending" ? "No pending stones — all caught up." : "No submissions found."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((stone) => (
            <div
              key={stone.id}
              className={`rounded-2xl border bg-white overflow-hidden transition-all ${
                !stone.approved
                  ? "border-amber-200 bg-amber-50/20"
                  : stone.featured
                  ? "border-gold-soft"
                  : "border-stone-edge"
              }`}
            >
              {/* Row header */}
              <div
                className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-parchment-soft transition-colors"
                onClick={() => setExpanded(expanded === stone.id ? null : stone.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Journey word badge */}
                  <span
                    className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex-shrink-0 mt-0.5 bg-gold-wash text-gold-deep border border-gold-soft/50"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {stone.journey_word}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-ink text-lg truncate" style={{ fontFamily: "var(--font-display)" }}>
                      {stone.anonymous ? stone.display_name || "Anonymous" : stone.full_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {stone.anonymous && (
                        <span className="text-xs text-stone-light bg-parchment-soft px-2 py-0.5 rounded-full border border-stone-edge">
                          Anonymous
                        </span>
                      )}
                      {!stone.approved && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                      {stone.featured && (
                        <span className="text-xs font-bold text-gold-deep bg-gold-wash px-2 py-0.5 rounded-full">
                          ★ Featured
                        </span>
                      )}
                      {!stone.consent_public && (
                        <span className="text-xs text-stone-light bg-parchment-soft px-2 py-0.5 rounded-full border border-stone-edge">
                          No public consent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => act(() => updateStoneApproval(stone.id, !stone.approved))}
                    disabled={isPending}
                    className={`text-sm px-4 py-2 rounded-lg border font-bold transition-colors disabled:opacity-50 ${
                      stone.approved
                        ? "border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600"
                        : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {stone.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => act(() => updateStoneFeatured(stone.id, !stone.featured))}
                    disabled={isPending}
                    className={`text-sm px-4 py-2 rounded-lg border font-bold transition-colors disabled:opacity-50 ${
                      stone.featured
                        ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                        : "border-stone-edge text-stone-mid hover:border-yellow-300 hover:text-yellow-700"
                    }`}
                  >
                    {stone.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    onClick={() => confirmDelete(stone.id, stone.full_name)}
                    disabled={isPending}
                    className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === stone.id && (
                <div className="border-t border-stone-edge/50 px-5 py-5 bg-parchment-soft space-y-4">
                  {stone.contact && (
                    <p className="text-sm text-stone-mid">
                      <span className="font-bold text-stone">Contact:</span> {stone.contact}
                    </p>
                  )}
                  {stone.scripture && (
                    <p className="text-base italic text-stone-mid border-l-2 border-gold-soft pl-4">
                      &ldquo;{stone.scripture}&rdquo;
                    </p>
                  )}
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-stone mb-2" style={{ fontFamily: "var(--font-accent)" }}>
                      Remembrance
                    </p>
                    <p className="text-base text-ink leading-relaxed whitespace-pre-wrap">
                      {stone.remembrance}
                    </p>
                  </div>
                  {stone.testimony && (
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase text-stone mb-2" style={{ fontFamily: "var(--font-accent)" }}>
                        Testimony
                      </p>
                      <p className="text-sm text-stone-mid leading-relaxed">
                        {stone.testimony}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-stone-light pt-1">
                    Submitted {new Date(stone.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
