"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateRound,
  adminSetRoundPhase,
  adminCreateIdea,
  adminUpdateIdea,
  adminSetIdeaApproval,
  adminSetIdeaShortlisted,
  adminDeleteIdea,
} from "@/lib/outreach-actions";
import type { OutreachRound, OutreachIdea, VoteTally } from "@/types/outreach";

const accent = { fontFamily: "var(--font-accent)" };

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

const PHASES = ["collecting", "poll_open", "closed"] as const;
const PHASE_LABELS: Record<string, string> = {
  collecting: "Collecting",
  poll_open: "Poll Open",
  closed: "Closed",
};

function IdeaForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { title: string; summary: string; description: string };
  onSave: (data: { title: string; summary: string; description: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <div className="space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Idea title" className={inputCls} />
      <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short focus statement (optional)" className={inputCls} />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        placeholder="Full description"
        className={`${inputCls} resize-none`}
      />
      <div className="flex gap-2">
        <button
          onClick={() => title.trim() && description.trim() && onSave({ title, summary, description })}
          className="px-4 py-2 rounded-xl bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider"
          style={accent}
        >
          Save
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-stone-edge text-stone hover:text-ink text-xs font-bold uppercase tracking-wider" style={accent}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminOutreachPanel({
  round,
  ideas,
  tallies,
  totalVoters,
}: {
  round: OutreachRound | null;
  ideas: (OutreachIdea & { commentCount: number })[];
  tallies: VoteTally[];
  totalVoters: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [newRoundTitle, setNewRoundTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function act(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  if (!round) {
    return (
      <div className="max-w-md">
        <p className="text-sm text-stone-mid mb-4">No outreach round has been started yet.</p>
        <div className="flex gap-2">
          <input
            value={newRoundTitle}
            onChange={(e) => setNewRoundTitle(e.target.value)}
            placeholder="Round title, e.g. BURP Community Outreach 2026"
            className={inputCls}
          />
          <button
            onClick={() => newRoundTitle.trim() && act(() => adminCreateRound(newRoundTitle))}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider whitespace-nowrap"
            style={accent}
          >
            Start Round
          </button>
        </div>
      </div>
    );
  }

  const shortlisted = ideas.filter((i) => i.is_shortlisted);
  const general = ideas.filter((i) => !i.is_shortlisted);
  const pendingCount = ideas.filter((i) => !i.approved).length;

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-medium">{error}</p>
      )}

      {/* Round status */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-5 rounded-2xl border border-stone-edge bg-parchment-soft">
        <div>
          <p className="text-xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {round.title}
          </p>
          <p className="text-sm text-stone-mid mt-1">
            {totalVoters} voter{totalVoters === 1 ? "" : "s"} so far
            {pendingCount > 0 && <span className="ml-2 text-amber-700 font-semibold">· {pendingCount} pending review</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {PHASES.map((p) => (
            <button
              key={p}
              onClick={() => p !== round.phase && act(() => adminSetRoundPhase(round.id, p))}
              className={`text-xs px-4 py-2 rounded-lg border font-bold tracking-widest uppercase transition-colors ${
                round.phase === p ? "bg-ink text-vellum border-ink" : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
              }`}
              style={accent}
            >
              {PHASE_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Vote tallies */}
      {tallies.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold tracking-widest uppercase text-stone-light mb-3" style={accent}>
            Live Vote Tallies
          </h3>
          <div className="space-y-2">
            {tallies.map((t) => {
              const max = tallies[0]?.count || 1;
              return (
                <div key={t.idea_id} className="rounded-xl border border-stone-edge bg-white p-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-ink">{t.title}</span>
                    <span className="font-bold text-gold-deep">{t.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-parchment-soft overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${(t.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add idea */}
      <div className="mb-8">
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-xs font-bold text-gold-deep hover:underline uppercase tracking-wider mb-3"
          style={accent}
        >
          {adding ? "Cancel" : "+ Add Idea"}
        </button>
        {adding && (
          <div className="p-5 rounded-2xl border border-stone-edge bg-white">
            <IdeaForm
              onSave={(data) => {
                act(() => adminCreateIdea(round.id, { ...data, is_shortlisted: false }));
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}
      </div>

      {/* Shortlisted ideas */}
      <h3 className="text-xs font-bold tracking-widest uppercase text-stone-light mb-3" style={accent}>
        Shortlisted ({shortlisted.length})
      </h3>
      <div className="space-y-2 mb-8">
        {shortlisted.map((idea) => (
          <IdeaRow key={idea.id} idea={idea} act={act} editingId={editingId} setEditingId={setEditingId} />
        ))}
        {shortlisted.length === 0 && <p className="text-sm text-stone-light italic py-4">Nothing shortlisted yet.</p>}
      </div>

      {/* General list */}
      <h3 className="text-xs font-bold tracking-widest uppercase text-stone-light mb-3" style={accent}>
        General List ({general.length})
      </h3>
      <div className="space-y-2">
        {general.map((idea) => (
          <IdeaRow key={idea.id} idea={idea} act={act} editingId={editingId} setEditingId={setEditingId} />
        ))}
        {general.length === 0 && <p className="text-sm text-stone-light italic py-4">No other ideas yet.</p>}
      </div>
    </div>
  );
}

function IdeaRow({
  idea,
  act,
  editingId,
  setEditingId,
}: {
  idea: OutreachIdea & { commentCount: number };
  act: (fn: () => Promise<{ error?: string }>) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}) {
  const isEditing = editingId === idea.id;

  return (
    <div className={`rounded-2xl border bg-white overflow-hidden ${!idea.approved ? "border-amber-200 bg-amber-50/20" : "border-stone-edge"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink truncate">{idea.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-stone-mid">
            {idea.submitted_by_name && <span>By {idea.submitted_by_name}</span>}
            <span>💬 {idea.commentCount}</span>
            {!idea.approved && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            onClick={() => act(() => adminSetIdeaApproval(idea.id, !idea.approved))}
            className={`text-xs px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider ${
              idea.approved ? "border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600" : "border-green-300 text-green-700 bg-green-50"
            }`}
            style={accent}
          >
            {idea.approved ? "Unapprove" : "Approve"}
          </button>
          <button
            onClick={() => act(() => adminSetIdeaShortlisted(idea.id, !idea.is_shortlisted))}
            className={`text-xs px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider ${
              idea.is_shortlisted ? "border-gold-soft text-gold-deep bg-gold-wash" : "border-stone-edge text-stone-mid hover:border-gold"
            }`}
            style={accent}
          >
            {idea.is_shortlisted ? "Remove from Shortlist" : "Shortlist"}
          </button>
          <button
            onClick={() => setEditingId(isEditing ? null : idea.id)}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink font-bold uppercase tracking-wider"
            style={accent}
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${idea.title}"? This removes its comments and votes too.`)) {
                act(() => adminDeleteIdea(idea.id));
              }
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider"
            style={accent}
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="border-t border-stone-edge/50 p-4 bg-parchment-soft">
          <IdeaForm
            initial={{ title: idea.title, summary: idea.summary ?? "", description: idea.description }}
            onSave={(data) => {
              act(() => adminUpdateIdea(idea.id, data));
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}
    </div>
  );
}
