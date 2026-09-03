"use client";

import { useState } from "react";
import { submitNewIdea } from "@/lib/outreach-actions";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

export default function OutreachNewIdeaForm({ roundId }: { roundId: string }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await submitNewIdea({ round_id: roundId, name, title, description });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSubmitted(true);
    setName("");
    setTitle("");
    setDescription("");
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border-2 border-gold-soft/60 bg-gold-wash/20 p-6 text-center">
        <div className="text-3xl mb-2">✓</div>
        <p className="text-sm font-bold text-ink mb-1" style={display}>
          Thanks for your idea!
        </p>
        <p className="text-xs text-stone-mid mb-4">
          It&rsquo;s been submitted for review and will appear here once approved.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs font-bold text-gold-deep hover:underline uppercase tracking-wider"
          style={accent}
        >
          Submit Another Idea
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-dashed border-stone-edge bg-parchment-soft p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-ink mb-1" style={display}>
          Have an idea we haven&rsquo;t considered?
        </h3>
        <p className="text-xs text-stone-mid">Share it below — it&rsquo;ll be reviewed and added to the list.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={inputCls}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea title"
          className={inputCls}
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Describe the idea — who it helps, what it involves…"
        className={`${inputCls} resize-none`}
      />

      {error && (
        <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-colors disabled:opacity-60"
        style={accent}
      >
        {submitting ? "Submitting…" : "Submit Idea"}
      </button>
    </form>
  );
}
