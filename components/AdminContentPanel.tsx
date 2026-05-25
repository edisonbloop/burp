"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreatePlan, adminUpdatePlan, adminDeletePlan,
  adminCreateDiscussion, adminUpdateDiscussion, adminDeleteDiscussion,
  adminPostTranscribedComment,
} from "@/lib/admin-talk-actions";
import DiscussionExport from "@/components/DiscussionExport";
import PlanExport from "@/components/PlanExport";

interface Discussion {
  id: string;
  plan_id: string;
  day_number: number | null;
  title: string;
  content: string | null;
  created_at: string;
}

interface Plan {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  discussions: Discussion[];
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

function PlanForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: { title: string; description: string };
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <div className="space-y-3 p-4 bg-parchment-soft rounded-2xl border border-stone-edge">
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Plan Title <span className="text-gold">*</span>
        </label>
        <input className={inputCls} placeholder="e.g. 100 Days in His Word" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Description <span className="text-stone-light font-normal">(optional)</span>
        </label>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="A short description shown on the plans list" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => title.trim() && onSave(title, description)}
          disabled={saving || !title.trim()}
          className="px-4 py-2 rounded-xl bg-ink text-vellum text-sm font-semibold hover:bg-stone transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Plan"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-stone-edge text-sm text-stone-mid hover:border-gold hover:text-ink transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function DiscussionForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: { title: string; content: string };
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

  return (
    <div className="space-y-3 p-4 bg-vellum rounded-xl border border-stone-edge">
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Person&rsquo;s Name <span className="text-gold">*</span>
        </label>
        <input
          className={inputCls}
          placeholder="e.g. Natasha"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Discussion <span className="text-gold">*</span>
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={5}
          placeholder={`e.g. Read: Psalm 22\n\nTalk it over: Where in your life has silence felt like abandonment?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => name.trim() && content.trim() && onSave(name.trim(), content.trim())}
          disabled={saving || !name.trim() || !content.trim()}
          className="px-4 py-2 rounded-xl bg-ink text-vellum text-sm font-semibold hover:bg-stone transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Discussion"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-stone-edge text-sm text-stone-mid hover:border-gold hover:text-ink transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function TranscribeForm({
  onSave, onCancel, saving,
}: {
  onSave: (name: string, content: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  return (
    <div className="space-y-3 p-4 bg-gold-wash border border-gold-soft rounded-xl mt-2">
      <p className="text-xs font-bold tracking-widest uppercase text-gold-deep" style={{ fontFamily: "var(--font-accent)" }}>
        Transcribe a Group Reflection
      </p>
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Person&rsquo;s Name <span className="text-gold">*</span>
        </label>
        <input
          className={inputCls}
          placeholder="e.g. Adomaa"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          What They Said <span className="text-gold">*</span>
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          placeholder="Paste or type their reflection from the WhatsApp group…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => name.trim() && content.trim() && onSave(name, content)}
          disabled={saving || !name.trim() || !content.trim()}
          className="px-4 py-2 rounded-xl bg-ink text-vellum text-sm font-semibold hover:bg-stone transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add Reflection"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-stone-edge text-sm text-stone-mid hover:border-gold hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminContentPanel({ plans: initialPlans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(initialPlans[0]?.id ?? null);
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showNewDiscForPlan, setShowNewDiscForPlan] = useState<string | null>(null);
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [transcribingDiscId, setTranscribingDiscId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function act(fn: () => Promise<{ error?: string }>, onDone?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else { onDone?.(); router.refresh(); }
    });
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}

      {/* New plan button */}
      {!showNewPlanForm && (
        <button
          onClick={() => setShowNewPlanForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-stone-edge text-stone-mid text-sm font-semibold hover:border-gold hover:text-gold-deep hover:bg-gold-wash transition-colors"
        >
          + New Reading Plan
        </button>
      )}

      {showNewPlanForm && (
        <div className="mb-6">
          <PlanForm
            onSave={(t, d) => act(() => adminCreatePlan(t, d), () => setShowNewPlanForm(false))}
            onCancel={() => setShowNewPlanForm(false)}
            saving={isPending}
          />
        </div>
      )}

      {initialPlans.length === 0 && !showNewPlanForm && (
        <div className="text-center py-16 text-stone-mid text-sm">
          No reading plans yet. Create your first one above.
        </div>
      )}

      <div className="space-y-3">
        {initialPlans.map((plan) => {
          const isExpanded = expandedPlanId === plan.id;
          const isEditing = editingPlanId === plan.id;

          return (
            <div key={plan.id} className="rounded-2xl border border-stone-edge bg-white overflow-hidden">
              {/* Plan header */}
              {isEditing ? (
                <div className="p-4">
                  <PlanForm
                    initial={{ title: plan.title, description: plan.description ?? "" }}
                    onSave={(t, d) => act(() => adminUpdatePlan(plan.id, t, d), () => setEditingPlanId(null))}
                    onCancel={() => setEditingPlanId(null)}
                    saving={isPending}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-parchment-soft transition-colors"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-gold transition-transform duration-200 text-xs flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                    <div className="min-w-0">
                      <p className="font-bold text-ink text-lg truncate" style={{ fontFamily: "var(--font-display)" }}>{plan.title}</p>
                      {plan.description && (
                        <p className="text-sm text-stone-mid truncate mt-0.5">{plan.description}</p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-sm font-semibold text-stone-light bg-parchment-soft px-2.5 py-0.5 rounded-full border border-stone-edge">
                      {plan.discussions.length} disc.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                    <PlanExport planId={plan.id} planTitle={plan.title} />
                    <button
                      onClick={() => { setEditingPlanId(plan.id); setExpandedPlanId(plan.id); }}
                      className="text-sm px-4 py-2 rounded-lg border border-stone-edge text-stone-mid font-semibold hover:border-gold hover:text-gold-deep transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete plan "${plan.title}" and ALL its discussions?`)) act(() => adminDeletePlan(plan.id)); }}
                      className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Discussions */}
              {isExpanded && !isEditing && (
                <div className="border-t border-stone-edge bg-parchment-soft">
                  <div className="p-4 space-y-2.5">
                    {showNewDiscForPlan !== plan.id && (
                      <button
                        onClick={() => setShowNewDiscForPlan(plan.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-stone-edge text-stone-mid text-xs font-semibold hover:border-gold hover:text-gold-deep hover:bg-white transition-colors w-full"
                      >
                        + Add Discussion
                      </button>
                    )}
                    {showNewDiscForPlan === plan.id && (
                      <DiscussionForm
                        onSave={(t, c) => act(() => adminCreateDiscussion(plan.id, null, t, c), () => setShowNewDiscForPlan(null))}
                        onCancel={() => setShowNewDiscForPlan(null)}
                        saving={isPending}
                      />
                    )}
                    {plan.discussions.length === 0 && showNewDiscForPlan !== plan.id && (
                      <p className="text-xs text-stone-light text-center py-4">No discussions yet.</p>
                    )}
                    {plan.discussions.map((disc) =>
                      editingDiscId === disc.id ? (
                        <DiscussionForm
                          key={disc.id}
                          initial={{ title: disc.title, content: disc.content ?? "" }}
                          onSave={(t, c) => act(() => adminUpdateDiscussion(disc.id, null, t, c), () => setEditingDiscId(null))}
                          onCancel={() => setEditingDiscId(null)}
                          saving={isPending}
                        />
                      ) : (
                        <div key={disc.id} className="bg-white rounded-xl border border-stone-edge overflow-hidden">
                          <div className="flex items-start justify-between gap-3 px-4 py-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gold-deep uppercase tracking-wide mb-1" style={{ fontFamily: "var(--font-accent)" }}>
                                  {disc.title}
                                </p>
                                {disc.content && (
                                  <p className="text-sm text-ink line-clamp-2">{disc.content}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                              <DiscussionExport
                                discussionId={disc.id}
                                discussionTitle={disc.title}
                                discussionContent={disc.content ?? null}
                                planTitle={plan.title}
                              />
                              <button
                                onClick={() => setTranscribingDiscId(transcribingDiscId === disc.id ? null : disc.id)}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gold-soft text-gold-deep font-semibold hover:bg-gold-wash transition-colors"
                                title="Add a reflection from the group"
                              >
                                ✦ Transcribe
                              </button>
                              <button onClick={() => setEditingDiscId(disc.id)} className="text-sm px-3 py-1.5 rounded-lg border border-stone-edge text-stone-mid font-semibold hover:border-gold hover:text-gold-deep transition-colors">
                                Edit
                              </button>
                              <button onClick={() => { if (confirm(`Delete "${disc.title}"?`)) act(() => adminDeleteDiscussion(disc.id)); }} className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors">
                                Delete
                              </button>
                            </div>
                          </div>
                          {transcribingDiscId === disc.id && (
                            <div className="px-4 pb-4">
                              <TranscribeForm
                                onSave={(name, content) =>
                                  act(
                                    () => adminPostTranscribedComment(disc.id, name, content),
                                    () => setTranscribingDiscId(null)
                                  )
                                }
                                onCancel={() => setTranscribingDiscId(null)}
                                saving={isPending}
                              />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
