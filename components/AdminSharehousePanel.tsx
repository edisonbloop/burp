"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminUpdateNeedApproval,
  adminUpdateNeedFeatured,
  adminUpdateNeedStatus,
  adminDeleteNeed,
} from "@/lib/sharehouse-actions";
import type { SharehouseNeed, SharehouseCategory } from "@/types/sharehouse";

const CATEGORY_LABELS: Record<SharehouseCategory, string> = {
  financial: "Financial Assistance",
  medical: "Medical Support",
  job: "Job Opportunity",
  education: "Educational Need",
  emotional: "Emotional Support",
  practical: "Practical Burden",
  other: "Other Burden",
};

export default function AdminSharehousePanel({ needs }: { needs: SharehouseNeed[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"pending" | "active" | "met" | "all">("pending");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingTestimonyId, setEditingTestimonyId] = useState<string | null>(null);
  const [editedTestimony, setEditedTestimony] = useState("");
  const [error, setError] = useState("");

  const filtered = needs.filter((need) => {
    if (filter === "pending" && need.approved) return false;
    if (filter === "active" && (!need.approved || need.status !== "active")) return false;
    if (filter === "met" && (!need.approved || need.status !== "met")) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      need.title.toLowerCase().includes(q) ||
      need.description.toLowerCase().includes(q) ||
      need.full_name.toLowerCase().includes(q) ||
      need.contact_info.toLowerCase().includes(q) ||
      (need.update_testimony?.toLowerCase().includes(q) ?? false)
    );
  });

  const pendingCount = needs.filter((n) => !n.approved).length;

  function act(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleSaveTestimony(need: SharehouseNeed) {
    act(() => adminUpdateNeedStatus(need.id, "met", editedTestimony));
    setEditingTestimonyId(null);
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Pending Banner Callout */}
      {pendingCount > 0 && filter !== "active" && filter !== "met" && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-amber-600 font-bold text-lg">{pendingCount}</span>
          <p className="text-base text-amber-700 font-medium font-sans">
            need{pendingCount === 1 ? "" : "s"} waiting for verification & approval
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-sans font-medium">
          {error}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search needs by title, submitter, phone/email, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {(["pending", "active", "met", "all"] as const).map((f) => (
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
              {f === "met" ? "Met / Answered" : f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-stone-mid mb-4 font-medium font-sans">
        {filtered.length} need{filtered.length === 1 ? "" : "s"} found
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm italic font-sans">
          {filter === "pending"
            ? "All needs verified and approved — caught up!"
            : "No items match your selection."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((need) => (
            <div
              key={need.id}
              className={`rounded-2xl border bg-white overflow-hidden transition-all ${
                !need.approved
                  ? "border-amber-200 bg-amber-50/20"
                  : need.status === "met"
                  ? "border-gold-soft bg-gold-wash/10"
                  : need.featured
                  ? "border-gold-soft"
                  : "border-stone-edge"
              }`}
            >
              {/* Row header */}
              <div
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-parchment-soft/50 transition-colors"
                onClick={() => setExpanded(expanded === need.id ? null : need.id)}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex-shrink-0 mt-0.5 bg-gold-wash text-gold-deep border border-gold-soft/50"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {CATEGORY_LABELS[need.category] ?? need.category}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink text-lg truncate" style={{ fontFamily: "var(--font-display)" }}>
                      {need.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-sm font-sans text-stone-mid">
                      <span className="font-semibold text-ink">
                        {need.full_name} {need.anonymous && <span className="text-[10px] text-stone-light uppercase tracking-wider font-bold">(Anonymous Toggle)</span>}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-xs">{need.contact_info}</span>
                      <span>·</span>
                      <span>
                        {new Date(need.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {!need.approved && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Pending Approval
                        </span>
                      )}
                      {need.featured && (
                        <span className="text-[10px] font-bold text-gold-deep bg-gold-wash px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ★ Featured
                        </span>
                      )}
                      {need.status === "met" && (
                        <span className="text-[10px] font-bold text-white bg-gold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ✓ Answered
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => act(() => adminUpdateNeedApproval(need.id, !need.approved))}
                    disabled={isPending}
                    className={`text-xs px-3.5 py-2 rounded-lg border font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                      need.approved
                        ? "border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600"
                        : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {need.approved ? "Unapprove" : "Approve"}
                  </button>

                  {need.approved && (
                    <button
                      onClick={() => act(() => adminUpdateNeedFeatured(need.id, !need.featured))}
                      disabled={isPending}
                      className={`text-xs px-3.5 py-2 rounded-lg border font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                        need.featured
                          ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                          : "border-stone-edge text-stone-mid hover:border-yellow-300 hover:text-yellow-700"
                      }`}
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {need.featured ? "Unfeature" : "Feature"}
                    </button>
                  )}

                  {need.approved && (
                    <button
                      onClick={() => {
                        if (need.status === "met") {
                          act(() => adminUpdateNeedStatus(need.id, "active", null));
                        } else {
                          setEditingTestimonyId(need.id);
                          setEditedTestimony(need.update_testimony || "");
                        }
                      }}
                      disabled={isPending}
                      className={`text-xs px-3.5 py-2 rounded-lg border font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                        need.status === "met"
                          ? "border-gold-soft text-gold-deep bg-gold-wash hover:bg-gold-soft hover:text-white"
                          : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
                      }`}
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {need.status === "met" ? "Mark Active" : "Mark Met"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete need "${need.title}"? This cannot be undone.`)) {
                        act(() => adminDeleteNeed(need.id));
                      }
                    }}
                    disabled={isPending}
                    className="text-xs px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Edit Testimony Inline Drawer */}
              {editingTestimonyId === need.id && (
                <div className="border-t border-stone-edge/50 px-5 py-5 bg-amber-50/30" onClick={(e) => e.stopPropagation()}>
                  <h4 className="text-xs font-bold text-stone uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-accent)" }}>
                    Provide / Edit Testimony
                  </h4>
                  <textarea
                    value={editedTestimony}
                    onChange={(e) => setEditedTestimony(e.target.value)}
                    rows={4}
                    placeholder="Enter the testimony of how this need was met..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveTestimony(need)}
                      className="px-4 py-2 bg-ink hover:bg-stone text-vellum text-xs font-bold rounded-lg uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      Save & Mark as Met
                    </button>
                    <button
                      onClick={() => setEditingTestimonyId(null)}
                      className="px-4 py-2 border border-stone-edge text-stone hover:text-ink text-xs font-bold rounded-lg uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Expanded details preview */}
              {expanded === need.id && editingTestimonyId !== need.id && (
                <div className="border-t border-stone-edge/50 px-5 py-5 bg-parchment-soft">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column: Description */}
                    <div>
                      <p className="text-xs font-bold text-stone uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-accent)" }}>
                        Description of Need
                      </p>
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
                        {need.description}
                      </p>
                    </div>

                    {/* Right Column: Evidence & Testimony */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-stone uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                          Evidence Link / Verification
                        </p>
                        {need.evidence_url ? (
                          <a
                            href={need.evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-success-earthen hover:underline font-mono bg-white border border-stone-edge/30 px-3 py-2 rounded-xl inline-block"
                          >
                            ✓ {need.evidence_url}
                          </a>
                        ) : (
                          <span className="text-xs text-stone-light italic">No evidence document attached.</span>
                        )}
                      </div>

                      {need.status === "met" && (
                        <div>
                          <p className="text-xs font-bold text-gold-deep uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                            Met Testimony
                          </p>
                          <blockquote className="text-xs text-stone-mid italic border-l-2 border-gold-soft pl-4 py-1 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-r-xl border border-stone-edge/30">
                            &ldquo;{need.update_testimony || "No testimony provided yet."}&rdquo;
                          </blockquote>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
