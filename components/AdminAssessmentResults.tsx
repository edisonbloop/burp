"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAdminAssessment } from "@/lib/admin-assessment-actions";
import { RATING_QUESTIONS } from "@/types/admin-assessment";
import type { AdminAggregateStats, AdminAssessmentSubmission } from "@/types/admin-assessment";

const accent = { fontFamily: "var(--font-accent)" };

export default function AdminAssessmentResults({
  stats,
  submissions,
}: {
  stats: AdminAggregateStats[];
  submissions: AdminAssessmentSubmission[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete(id: string) {
    if (!confirm("Delete this response? This cannot be undone.")) return;
    setError("");
    startTransition(async () => {
      const res = await deleteAdminAssessment(id);
      if (res.error) setError(res.error);
      else {
        setExpanded((prev) => (prev === id ? null : prev));
        router.refresh();
      }
    });
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-medium">
          {error}
        </p>
      )}
      {/* Aggregate stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.admin_name} className="rounded-2xl border border-stone-edge bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
                {s.admin_name}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-light">
                {s.responseCount} response{s.responseCount === 1 ? "" : "s"}
              </span>
            </div>
            {s.responseCount === 0 ? (
              <p className="text-xs text-stone-light italic">No responses yet.</p>
            ) : (
              <div className="space-y-2.5">
                {RATING_QUESTIONS.map((q) => (
                  <div key={q.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-mid font-medium">{q.label}</span>
                      <span className="font-bold text-gold-deep">{s.averages[q.key]} / 5</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-parchment-soft overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${(s.averages[q.key] / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Individual responses */}
      <h3 className="text-xs font-bold tracking-widest uppercase text-stone-light mb-3" style={accent}>
        Individual Responses ({submissions.length})
      </h3>

      {submissions.length === 0 ? (
        <p className="text-sm text-stone-mid italic py-8 text-center">No submissions yet.</p>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => {
            const isOpen = expanded === sub.id;
            return (
              <div key={sub.id} className="rounded-2xl border border-stone-edge bg-white overflow-hidden">
                <div className="w-full flex items-center justify-between gap-3 p-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : sub.id)}
                    className="flex-1 text-left"
                  >
                    <span className="text-sm font-semibold text-ink">
                      Response submitted{" "}
                      {new Date(sub.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </button>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => setExpanded(isOpen ? null : sub.id)}
                      className="text-xs text-stone-light hover:text-ink transition-colors"
                    >
                      {isOpen ? "Hide" : "View"}
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      disabled={isPending}
                      className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wider disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-stone-edge/50 p-5 bg-parchment-soft space-y-5">
                    {sub.ratings.map((r) => (
                      <div key={r.id} className="bg-white rounded-xl border border-stone-edge/60 p-4">
                        <p className="text-sm font-bold text-ink mb-2">{r.admin_name}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                          {RATING_QUESTIONS.map((q) => (
                            <div key={q.key} className="text-center bg-parchment-soft rounded-lg py-1.5">
                              <p className="text-[9px] text-stone-light uppercase tracking-wide">{q.label}</p>
                              <p className="text-sm font-bold text-gold-deep">{r[q.key]}</p>
                            </div>
                          ))}
                        </div>
                        {r.strength_text && (
                          <p className="text-xs text-stone-mid mb-1">
                            <span className="font-bold text-success-earthen">Does well:</span> {r.strength_text}
                          </p>
                        )}
                        {r.growth_text && (
                          <p className="text-xs text-stone-mid">
                            <span className="font-bold text-info-earthen">Could grow in:</span> {r.growth_text}
                          </p>
                        )}
                      </div>
                    ))}
                    {sub.overall_team_comment && (
                      <div className="bg-white rounded-xl border border-stone-edge/60 p-4">
                        <p className="text-xs font-bold text-stone uppercase tracking-widest mb-1.5" style={accent}>
                          Overall Comment
                        </p>
                        <p className="text-sm text-stone-mid whitespace-pre-wrap">{sub.overall_team_comment}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
