"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  adminCreateDiscussion,
  adminUpdateDiscussion,
  adminDeleteDiscussion,
} from "@/lib/admin-talk-actions";

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

interface AdminContentPanelProps {
  plans: Plan[];
}

// ── Small reusable input styles ────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a]/40 focus:border-[#c4893a] transition text-sm";
const textareaCls = `${inputCls} resize-none`;

// ── Plan form (create / edit) ──────────────────────────────────────────────
function PlanForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: { title: string; description: string };
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <div className="space-y-3 p-4 bg-[#fdf8f0] rounded-2xl border border-[#e8d4b0]">
      <div>
        <label className="block text-xs font-semibold text-[#4d2c11] mb-1">
          Plan Title <span className="text-[#c4893a]">*</span>
        </label>
        <input
          className={inputCls}
          placeholder="e.g. 100 Days in His Word"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#4d2c11] mb-1">
          Description <span className="text-[#7a5a3a] font-normal">(optional)</span>
        </label>
        <textarea
          className={textareaCls}
          rows={2}
          placeholder="A short description shown on the plans list"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => title.trim() && onSave(title, description)}
          disabled={saving || !title.trim()}
          className="px-4 py-2 rounded-xl bg-[#c4893a] text-white text-sm font-semibold hover:bg-[#a96e28] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Plan"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[#e8d4b0] text-sm text-[#7a5a3a] hover:border-[#c4893a] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Discussion form (create / edit) ────────────────────────────────────────
function DiscussionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: { day_number: number | null; title: string; content: string };
  onSave: (day: number | null, title: string, content: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [day, setDay] = useState(
    initial?.day_number != null ? String(initial.day_number) : ""
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

  return (
    <div className="space-y-3 p-4 bg-white rounded-xl border border-[#e8d4b0]">
      <div className="flex gap-3">
        <div className="w-24 flex-shrink-0">
          <label className="block text-xs font-semibold text-[#4d2c11] mb-1">
            Day #
          </label>
          <input
            className={inputCls}
            type="number"
            min={1}
            placeholder="e.g. 12"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-[#4d2c11] mb-1">
            Discussion Title <span className="text-[#c4893a]">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="e.g. When God Seems Silent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#4d2c11] mb-1">
          Reading & Discussion Prompt
        </label>
        <textarea
          className={textareaCls}
          rows={5}
          placeholder={`e.g. Read: Psalm 22\n\nTalk it over: Where in your life has silence felt like abandonment — and what did you find on the other side?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <p className="text-xs text-[#c4b090] mt-1">
          Include the scripture reference and the discussion question.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            title.trim() &&
            onSave(day ? parseInt(day) : null, title, content)
          }
          disabled={saving || !title.trim()}
          className="px-4 py-2 rounded-xl bg-[#2d1f0e] text-white text-sm font-semibold hover:bg-[#4d2c11] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Discussion"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[#e8d4b0] text-sm text-[#7a5a3a] hover:border-[#c4893a] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────
export default function AdminContentPanel({ plans: initialPlans }: AdminContentPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(
    initialPlans[0]?.id ?? null
  );
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showNewDiscForPlan, setShowNewDiscForPlan] = useState<string | null>(null);
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function act(fn: () => Promise<{ error?: string }>, onDone?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
      } else {
        onDone?.();
        router.refresh();
      }
    });
  }

  // ── Plan handlers ──────────────────────────────────────────────────────
  function handleCreatePlan(title: string, description: string) {
    act(() => adminCreatePlan(title, description), () => setShowNewPlanForm(false));
  }

  function handleUpdatePlan(id: string, title: string, description: string) {
    act(() => adminUpdatePlan(id, title, description), () => setEditingPlanId(null));
  }

  function handleDeletePlan(id: string, title: string) {
    if (!confirm(`Delete plan "${title}" and ALL its discussions? This cannot be undone.`)) return;
    act(() => adminDeletePlan(id));
  }

  // ── Discussion handlers ────────────────────────────────────────────────
  function handleCreateDisc(planId: string, day: number | null, title: string, content: string) {
    act(() => adminCreateDiscussion(planId, day, title, content), () => setShowNewDiscForPlan(null));
  }

  function handleUpdateDisc(id: string, day: number | null, title: string, content: string) {
    act(() => adminUpdateDiscussion(id, day, title, content), () => setEditingDiscId(null));
  }

  function handleDeleteDisc(id: string, title: string) {
    if (!confirm(`Delete discussion "${title}"?`)) return;
    act(() => adminDeleteDiscussion(id));
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* New plan button */}
      {!showNewPlanForm && (
        <button
          onClick={() => setShowNewPlanForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#e3be82] text-[#a96e28] text-sm font-semibold hover:border-[#c4893a] hover:bg-[#fdf8f0] transition-colors"
        >
          + New Reading Plan
        </button>
      )}

      {showNewPlanForm && (
        <div className="mb-6">
          <PlanForm
            onSave={handleCreatePlan}
            onCancel={() => setShowNewPlanForm(false)}
            saving={isPending}
          />
        </div>
      )}

      {/* Plans list */}
      {initialPlans.length === 0 && !showNewPlanForm && (
        <div className="text-center py-16 text-[#7a5a3a]">
          No reading plans yet. Create your first one above.
        </div>
      )}

      <div className="space-y-4">
        {initialPlans.map((plan) => {
          const isExpanded = expandedPlanId === plan.id;
          const isEditing = editingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className="rounded-2xl border border-[#e8d4b0] bg-white overflow-hidden"
            >
              {/* Plan header */}
              {isEditing ? (
                <div className="p-4">
                  <PlanForm
                    initial={{
                      title: plan.title,
                      description: plan.description ?? "",
                    }}
                    onSave={(t, d) => handleUpdatePlan(plan.id, t, d)}
                    onCancel={() => setEditingPlanId(null)}
                    saving={isPending}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#fdf8f0] transition-colors"
                  onClick={() =>
                    setExpandedPlanId(isExpanded ? null : plan.id)
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-[#c4893a] transition-transform flex-shrink-0"
                      style={{
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    >
                      ▶
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#2d1f0e] truncate">
                        {plan.title}
                      </p>
                      {plan.description && (
                        <p className="text-xs text-[#7a5a3a] truncate">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium text-[#c4b090] bg-[#fdf8f0] px-2 py-0.5 rounded-full border border-[#e8d4b0]">
                      {plan.discussions.length} discussion{plan.discussions.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 flex-shrink-0 ml-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingPlanId(plan.id);
                        setExpandedPlanId(plan.id);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#e8d4b0] text-[#7a5a3a] hover:border-[#c4893a] hover:text-[#c4893a] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id, plan.title)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Discussions (expanded) */}
              {isExpanded && !isEditing && (
                <div className="border-t border-[#e8d4b0] bg-[#faf6ef]">
                  <div className="p-4 space-y-3">
                    {/* Add discussion button */}
                    {showNewDiscForPlan !== plan.id && (
                      <button
                        onClick={() => setShowNewDiscForPlan(plan.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#e3be82] text-[#a96e28] text-xs font-semibold hover:border-[#c4893a] hover:bg-white transition-colors w-full"
                      >
                        + Add Discussion
                      </button>
                    )}

                    {showNewDiscForPlan === plan.id && (
                      <DiscussionForm
                        onSave={(d, t, c) => handleCreateDisc(plan.id, d, t, c)}
                        onCancel={() => setShowNewDiscForPlan(null)}
                        saving={isPending}
                      />
                    )}

                    {/* Discussion rows */}
                    {plan.discussions.length === 0 && showNewDiscForPlan !== plan.id && (
                      <p className="text-xs text-[#c4b090] text-center py-4">
                        No discussions yet. Add the first one above.
                      </p>
                    )}

                    {plan.discussions.map((disc) =>
                      editingDiscId === disc.id ? (
                        <DiscussionForm
                          key={disc.id}
                          initial={{
                            day_number: disc.day_number,
                            title: disc.title,
                            content: disc.content ?? "",
                          }}
                          onSave={(d, t, c) => handleUpdateDisc(disc.id, d, t, c)}
                          onCancel={() => setEditingDiscId(null)}
                          saving={isPending}
                        />
                      ) : (
                        <div
                          key={disc.id}
                          className="flex items-start justify-between gap-3 bg-white rounded-xl border border-[#e8d4b0] px-4 py-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {disc.day_number != null && (
                              <span className="flex-shrink-0 text-xs font-bold text-[#c4893a] bg-[#fdf8f0] px-2.5 py-1 rounded-full border border-[#f0d9b0] whitespace-nowrap">
                                Day {disc.day_number}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#2d1f0e] truncate">
                                {disc.title}
                              </p>
                              {disc.content && (
                                <p className="text-xs text-[#7a5a3a] mt-0.5 line-clamp-2">
                                  {disc.content}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setEditingDiscId(disc.id)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#e8d4b0] text-[#7a5a3a] hover:border-[#c4893a] hover:text-[#c4893a] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDisc(disc.id, disc.title)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Del
                            </button>
                          </div>
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
