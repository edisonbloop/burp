"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminUpdateLibraryApproval,
  adminUpdateLibraryFeatured,
  adminDeleteLibraryItem,
} from "@/lib/admin-talk-actions";
import type { LibraryItem } from "@/types/library";

interface AdminLibraryPanelProps {
  items: LibraryItem[];
}

const TYPE_LABELS: Record<string, string> = {
  "poems": "Poem",
  "write-ups": "Write-Up",
  "long-messages": "Long Message",
  "videos": "Video",
  "others": "Other",
};

export default function AdminLibraryPanel({ items }: AdminLibraryPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = items.filter((item) => {
    if (filter === "pending" && item.approved) return false;
    if (filter === "approved" && !item.approved) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      (item.author?.toLowerCase().includes(q) ?? false) ||
      item.topic.toLowerCase().includes(q)
    );
  });

  const pending = items.filter((i) => !i.approved).length;

  function act(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function confirmDelete(id: string, title: string) {
    if (confirm(`Delete "${title}"? This cannot be undone.`))
      act(() => adminDeleteLibraryItem(id));
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Pending callout */}
      {pending > 0 && filter !== "approved" && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-amber-600 font-bold text-lg">{pending}</span>
          <p className="text-sm text-amber-700">
            submission{pending === 1 ? "" : "s"} waiting for approval
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search submissions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a]/40 focus:border-[#c4893a] transition text-sm"
        />
        <div className="flex gap-2">
          {(["pending", "approved", "all"] as const).map((f) => (
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
              {f === "pending" && pending > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#c4b090] mb-4">
        {filtered.length} item{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#7a5a3a] text-sm">
          {filter === "pending"
            ? "No pending submissions — all caught up."
            : "No items found."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white overflow-hidden transition-all ${
                !item.approved
                  ? "border-amber-200 bg-amber-50/20"
                  : item.featured
                  ? "border-[#d29e52]"
                  : "border-[#e8d4b0]"
              }`}
            >
              {/* Row header */}
              <div
                className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-[#fdf8f0] transition-colors"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: "#f9edda", color: "#8a5420" }}
                  >
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2d1f0e] text-sm truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-[#7a5a3a]">
                        by {item.author || "Anonymous"}
                      </span>
                      <span className="text-xs text-[#c4b090]">·</span>
                      <span className="text-xs text-[#c4b090]">{item.topic}</span>
                      {!item.approved && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                      {item.featured && (
                        <span className="text-[10px] font-semibold text-[#c4893a] bg-[#f9edda] px-2 py-0.5 rounded-full">
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Approve / Unapprove */}
                  <button
                    onClick={() => act(() => adminUpdateLibraryApproval(item.id, !item.approved))}
                    disabled={isPending}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-50 ${
                      item.approved
                        ? "border-[#e8d4b0] text-[#7a5a3a] hover:border-red-300 hover:text-red-600"
                        : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {item.approved ? "Unapprove" : "Approve"}
                  </button>
                  {/* Feature */}
                  <button
                    onClick={() => act(() => adminUpdateLibraryFeatured(item.id, !item.featured))}
                    disabled={isPending}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-50 ${
                      item.featured
                        ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                        : "border-[#e8d4b0] text-[#7a5a3a] hover:border-yellow-300 hover:text-yellow-700"
                    }`}
                  >
                    {item.featured ? "Unfeature" : "Feature"}
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => confirmDelete(item.id, item.title)}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded content preview */}
              {expanded === item.id && (
                <div className="border-t border-[#f0d9b0] px-5 py-4 bg-[#fdf8f0]">
                  <p className="text-xs font-semibold text-[#c4b090] uppercase tracking-widest mb-2">
                    Content Preview
                  </p>
                  <p className="text-sm text-[#2d1f0e] leading-relaxed whitespace-pre-wrap line-clamp-12">
                    {item.content}
                  </p>
                  <p className="text-xs text-[#c4b090] mt-3">
                    Submitted{" "}
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
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
