"use client";

import { useState } from "react";
import Link from "next/link";
import { submitAdminAssessment } from "@/lib/admin-assessment-actions";
import { ASSESSED_ADMINS, RATING_QUESTIONS } from "@/types/admin-assessment";
import type { AdminRatingInput, AssessedAdmin, RatingKey } from "@/types/admin-assessment";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

function emptyRating(admin_name: AssessedAdmin): AdminRatingInput {
  return {
    admin_name,
    responsiveness: 0,
    communication: 0,
    fairness: 0,
    leadership: 0,
    overall: 0,
    strength_text: "",
    growth_text: "",
  };
}

function RatingScale({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-all ${
            value === n
              ? "bg-ink border-ink text-vellum scale-110"
              : "border-stone-edge text-stone-mid hover:border-gold hover:text-gold-deep"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function AdminAssessmentForm() {
  const [step, setStep] = useState(0); // 0,1,2 = admins; 3 = final/submit
  const [ratings, setRatings] = useState<AdminRatingInput[]>(
    ASSESSED_ADMINS.map((a) => emptyRating(a))
  );
  const [overallComment, setOverallComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = ASSESSED_ADMINS.length + 1;
  const isAdminStep = step < ASSESSED_ADMINS.length;
  const currentAdmin = isAdminStep ? ASSESSED_ADMINS[step] : null;
  const currentRating = isAdminStep ? ratings[step] : null;

  function updateRating(field: RatingKey | "strength_text" | "growth_text", value: number | string) {
    setError("");
    setRatings((prev) => {
      const next = [...prev];
      next[step] = { ...next[step], [field]: value };
      return next;
    });
  }

  function handleNext() {
    if (!currentRating || !currentAdmin) return;
    const missing = RATING_QUESTIONS.find((q) => !currentRating[q.key]);
    if (missing) {
      setError(`Please rate "${missing.label}" before continuing.`);
      return;
    }
    if (!currentRating.strength_text.trim()) {
      setError(`Please share one thing ${currentAdmin} does well.`);
      return;
    }
    if (!currentRating.growth_text.trim()) {
      setError(`Please share one thing ${currentAdmin} could grow in.`);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    const res = await submitAdminAssessment({
      ratings,
      overall_team_comment: overallComment || undefined,
    });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-5xl mb-6 text-gold">✓</div>
        <h2 className="text-3xl font-bold text-ink mb-4" style={display}>
          Thank You
        </h2>
        <p className="text-stone-mid max-w-md leading-relaxed mb-8 text-sm">
          Your feedback has been submitted anonymously. It will help our admins grow and serve
          the community even better.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold transition-colors text-center text-sm"
        >
          Back to BURP
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans resize-none";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-gold" : "bg-stone-edge"
            }`}
          />
        ))}
      </div>

      {isAdminStep && currentRating && (
        <div className="space-y-6">
          <div className="text-center">
            <span
              className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-2"
              style={accent}
            >
              Step {step + 1} of {totalSteps}
            </span>
            <h2 className="text-3xl font-bold text-ink" style={display}>
              Rate {currentAdmin}
            </h2>
          </div>

          <div className="space-y-5 bg-parchment-soft rounded-2xl border border-stone-edge p-6">
            {RATING_QUESTIONS.map((q) => (
              <div key={q.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">{q.label}</p>
                  <p className="text-xs text-stone-light">{q.hint}</p>
                </div>
                <RatingScale value={currentRating[q.key]} onChange={(v) => updateRating(q.key, v)} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={accent}>
              One thing {currentAdmin} does well <span className="text-gold-deep">*</span>
            </label>
            <textarea
              rows={2}
              value={currentRating.strength_text}
              onChange={(e) => updateRating("strength_text", e.target.value)}
              placeholder="What stands out about their leadership?"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={accent}>
              One thing {currentAdmin} could grow in <span className="text-gold-deep">*</span>
            </label>
            <textarea
              rows={2}
              value={currentRating.growth_text}
              onChange={(e) => updateRating("growth_text", e.target.value)}
              placeholder="Keep it constructive — this helps them grow."
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-stone-edge text-stone hover:border-gold hover:text-gold font-semibold text-sm transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 px-6 rounded-xl bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-colors"
              style={accent}
            >
              {step === ASSESSED_ADMINS.length - 1 ? "Continue" : "Next Admin →"}
            </button>
          </div>
        </div>
      )}

      {!isAdminStep && (
        <div className="space-y-6">
          <div className="text-center">
            <span
              className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-2"
              style={accent}
            >
              Step {step + 1} of {totalSteps}
            </span>
            <h2 className="text-3xl font-bold text-ink" style={display}>
              Almost Done
            </h2>
            <p className="text-sm text-stone-mid mt-2">
              Anything you&rsquo;d like to share about the admin team as a whole?
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={accent}>
              Overall Comment <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={overallComment}
              onChange={(e) => setOverallComment(e.target.value)}
              placeholder="Anything else that would help the admin team serve better?"
              className={inputCls}
            />
          </div>

          <div className="p-4 rounded-xl bg-parchment-soft border border-stone-edge text-center">
            <p className="text-xs text-stone-mid leading-relaxed">
              This form is completely anonymous — no name or account is attached to your response.
            </p>
          </div>

          {error && (
            <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl border border-stone-edge text-stone hover:border-gold hover:text-gold font-semibold text-sm transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 px-6 rounded-xl bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-colors disabled:opacity-60"
              style={accent}
            >
              {submitting ? "Submitting…" : "Submit Feedback"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
