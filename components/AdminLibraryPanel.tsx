"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminUpdateLibraryApproval,
  adminUpdateLibraryFeatured,
  adminDeleteLibraryItem,
} from "@/lib/admin-talk-actions";
import type { LibraryItem } from "@/types/library";

const TYPE_LABELS: Record<string, string> = {
  poems: "Poem",
  "write-ups": "Write-Up",
  "long-messages": "Long Message",
  videos: "Video",
  others: "Other",
};

export default function AdminLibraryPanel({ items }: { items: LibraryItem[] }) {
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

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Pending callout */}
      {pending > 0 && filter !== "approved" && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-amber-600 font-bold text-lg">{pending}</span>
          <p className="text-base text-amber-700 font-medium">
            submission{pending === 1 ? "" : "s"} waiting for approval
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
          placeholder="Search submissions…"
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
        {filtered.length} item{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm">
          {filter === "pending" ? "No pending submissions — all caught up." : "No items found."}
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
                  ? "border-gold-soft"
                  : "border-stone-edge"
              }`}
            >
              {/* Row header */}
              <div
                className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-parchment-soft transition-colors"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex-shrink-0 mt-0.5 bg-gold-wash text-gold-deep border border-gold-soft/50"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-ink text-lg truncate" style={{ fontFamily: "var(--font-display)" }}>{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-stone-mid">by {item.author || "Anonymous"}</span>
                      <span className="text-sm text-stone-light">·</span>
                      <span className="text-sm text-stone-light">{item.topic}</span>
                      {!item.approved && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                      {item.featured && (
                        <span className="text-xs font-bold text-gold-deep bg-gold-wash px-2 py-0.5 rounded-full">
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => act(() => adminUpdateLibraryApproval(item.id, !item.approved))}
                    disabled={isPending}
                    className={`text-sm px-4 py-2 rounded-lg border font-bold transition-colors disabled:opacity-50 ${
                      item.approved
                        ? "border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600"
                        : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {item.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => act(() => adminUpdateLibraryFeatured(item.id, !item.featured))}
                    disabled={isPending}
                    className={`text-sm px-4 py-2 rounded-lg border font-bold transition-colors disabled:opacity-50 ${
                      item.featured
                        ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                        : "border-stone-edge text-stone-mid hover:border-yellow-300 hover:text-yellow-700"
                    }`}
                  >
                    {item.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${item.title}"? This cannot be undone.`)) act(() => adminDeleteLibraryItem(item.id)); }}
                    disabled={isPending}
                    className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded preview */}
              {expanded === item.id && (
                <div className="border-t border-stone-edge/50 px-5 py-5 bg-parchment-soft">
                  <p className="text-xs font-bold text-stone uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-accent)" }}>
                    Content Preview
                  </p>
                  <p className="text-base text-ink leading-relaxed whitespace-pre-wrap line-clamp-12">
                    {item.content}
                  </p>
                  <p className="text-sm text-stone-light mt-4">
                    Submitted{" "}
                    {new Date(item.created_at).toLocaleDateString("en-US", {
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
