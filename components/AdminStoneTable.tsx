"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateStoneApproval,
  updateStoneFeatured,
  deleteStone,
} from "@/lib/actions";
import type { Stone } from "@/types/stones";

interface AdminStoneTableProps {
  stones: Stone[];
}

export default function AdminStoneTable({ stones: initialStones }: AdminStoneTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
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

  function act(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function confirmDelete(id: string, name: string) {
    if (confirm(`Delete stone from "${name}"? This cannot be undone.`)) {
      act(() => deleteStone(id));
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search submissions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition text-sm"
        />
        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg border font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[#c4893a] text-white border-[#c4893a]"
                  : "border-[#e8d4b0] text-[#7a5a3a] hover:border-[#c4893a]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-[#7a5a3a] mb-4">
        {filtered.length} submission{filtered.length === 1 ? "" : "s"}
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#7a5a3a]">No submissions found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((stone) => (
            <div
              key={stone.id}
              className={`rounded-2xl border bg-white p-5 ${
                stone.approved
                  ? stone.featured
                    ? "border-[#d29e52]"
                    : "border-[#e8d4b0]"
                  : "border-amber-200 bg-amber-50/30"
              } ${isPending ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#2d1f0e]">
                      {stone.full_name}
                    </span>
                    {stone.display_name && stone.display_name !== stone.full_name && (
                      <span className="text-xs text-[#7a5a3a]">
                        ({stone.display_name})
                      </span>
                    )}
                    {stone.anonymous && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        anonymous
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f9edda] text-[#a96e28] font-medium">
                      {stone.journey_word}
                    </span>
                    {!stone.approved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Pending
                      </span>
                    )}
                    {stone.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        ★ Featured
                      </span>
                    )}
                    {!stone.consent_public && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        No public consent
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[#c4b090]">
                  {new Date(stone.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {stone.contact && (
                <p className="text-xs text-[#7a5a3a] mb-2 bg-[#fdf8f0] px-2 py-1 rounded-lg inline-block">
                  Contact: {stone.contact}
                </p>
              )}

              {stone.scripture && (
                <p className="text-sm italic text-[#7a5a3a] mb-2">
                  "{stone.scripture}"
                </p>
              )}

              <p className="text-sm text-[#2d1f0e] mb-2 leading-relaxed">
                {stone.remembrance}
              </p>

              {stone.testimony && (
                <p className="text-xs text-[#7a5a3a] border-t border-[#f0d9b0] pt-2 mt-2">
                  {stone.testimony}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#f0d9b0]">
                <button
                  onClick={() => act(() => updateStoneApproval(stone.id, !stone.approved))}
                  disabled={isPending}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                    stone.approved
                      ? "border-[#e8d4b0] text-[#7a5a3a] hover:border-red-300 hover:text-red-600"
                      : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                  }`}
                >
                  {stone.approved ? "Unapprove" : "Approve"}
                </button>

                <button
                  onClick={() => act(() => updateStoneFeatured(stone.id, !stone.featured))}
                  disabled={isPending}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                    stone.featured
                      ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                      : "border-[#e8d4b0] text-[#7a5a3a] hover:border-yellow-300 hover:text-yellow-700"
                  }`}
                >
                  {stone.featured ? "Unfeature" : "Feature"}
                </button>

                <button
                  onClick={() => confirmDelete(stone.id, stone.full_name)}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors disabled:opacity-50 ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
