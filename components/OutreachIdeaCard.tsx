"use client";

import { useState } from "react";
import { submitComment } from "@/lib/outreach-actions";
import type { OutreachIdeaWithComments } from "@/types/outreach";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

interface Props {
  idea: OutreachIdeaWithComments;
  voteMode?: boolean;
  selected?: boolean;
  voteDisabled?: boolean;
  onToggleVote?: (ideaId: string) => void;
  onCommentAdded?: () => void;
}

export default function OutreachIdeaCard({
  idea,
  voteMode = false,
  selected = false,
  voteDisabled = false,
  onToggleVote,
  onCommentAdded,
}: Props) {
  const [showComments, setShowComments] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError("Please add your name and a comment.");
      return;
    }
    setError("");
    setSubmitting(true);
    const res = await submitComment({ idea_id: idea.id, name, comment });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setComment("");
    onCommentAdded?.();
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

  return (
    <div
      className={`rounded-2xl border-2 bg-white overflow-hidden transition-colors ${
        selected ? "border-gold" : idea.is_shortlisted ? "border-gold-soft/60" : "border-stone-edge"
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {voteMode && (
            <button
              type="button"
              onClick={() => onToggleVote?.(idea.id)}
              disabled={voteDisabled && !selected}
              className={`mt-1 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                selected
                  ? "bg-gold border-gold text-white"
                  : voteDisabled
                  ? "border-stone-edge/50 opacity-40"
                  : "border-stone-edge hover:border-gold"
              }`}
              aria-label={selected ? "Remove vote" : "Add vote"}
            >
              {selected && "✓"}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {idea.is_shortlisted && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-gold-wash text-gold-deep border border-gold-soft/50" style={accent}>
                  Shortlisted
                </span>
              )}
              {idea.submitted_by_name && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-parchment-soft text-stone-mid border border-stone-edge" style={accent}>
                  Suggested by {idea.submitted_by_name}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-ink leading-tight mb-1" style={display}>
              {idea.title}
            </h3>
            {idea.summary && <p className="text-xs font-semibold text-gold-deep mb-3">{idea.summary}</p>}
            <p className="text-sm text-stone-mid leading-relaxed whitespace-pre-wrap">{idea.description}</p>
          </div>
        </div>

        {/* Comments toggle */}
        <div className="mt-5 pt-4 border-t border-stone-edge/40">
          <button
            onClick={() => setShowComments((v) => !v)}
            className="text-xs font-bold text-stone hover:text-gold-deep uppercase tracking-wider transition-colors"
            style={accent}
          >
            💬 {idea.comments.length} Comment{idea.comments.length === 1 ? "" : "s"} {showComments ? "▲" : "▼"}
          </button>

          {showComments && (
            <div className="mt-4 space-y-3">
              {idea.comments.map((c) => (
                <div key={c.id} className="bg-parchment-soft rounded-xl p-3">
                  <p className="text-xs font-bold text-ink mb-0.5">{c.name}</p>
                  <p className="text-sm text-stone-mid whitespace-pre-wrap">{c.comment}</p>
                </div>
              ))}

              <form onSubmit={handleSubmitComment} className="space-y-2 pt-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="Add a comment or suggestion…"
                  className={`${inputCls} resize-none`}
                />
                {error && <p className="text-xs text-danger-earthen font-semibold">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  style={accent}
                >
                  {submitting ? "Posting…" : "Post Comment"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
