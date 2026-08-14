"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createWorshipAttendance } from "@/lib/worship-actions";

const schema = z.object({
  full_name: z.string().min(2, "Your name is required"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(30).optional(),
  notes: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function WorshipAttendForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", phone: "", notes: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    const result = await createWorshipAttendance({
      full_name: data.full_name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
    });

    if (result.error) setServerError(result.error);
    else setSubmitted(true);
  };

  const registerAnother = () => {
    reset({ full_name: "", email: "", phone: "", notes: "" });
    setSubmitted(false);
    setServerError("");
  };

  const labelClass =
    "block text-[10px] font-bold tracking-widest uppercase text-stone-mid mb-2";
  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-base font-sans";
  const accent = { fontFamily: "var(--font-accent)" };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-5 text-gold-deep">✓</div>
        <h3
          className="text-2xl sm:text-3xl font-bold text-ink mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You&rsquo;re checked in
        </h3>
        <p className="text-stone-mid text-base leading-relaxed max-w-sm mx-auto mb-8">
          Welcome to <em>From the Heart</em>. Find a seat — the night is about to begin.
        </p>
        <button
          type="button"
          onClick={registerAnother}
          className="px-8 py-3.5 rounded-full border border-stone-edge text-stone-mid hover:border-gold hover:text-ink font-bold text-xs tracking-[0.2em] uppercase transition-colors"
          style={accent}
        >
          Register someone else
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass} style={accent}>
          Full Name <span className="text-gold-deep">*</span>
        </label>
        <input
          {...register("full_name")}
          type="text"
          placeholder="Your name"
          autoComplete="name"
          className={inputClass}
        />
        {errors.full_name && (
          <p className="mt-1.5 text-sm text-red-700 font-semibold">{errors.full_name.message}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={accent}>
            Email <span className="normal-case text-stone-light">(optional)</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            className={inputClass}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-700 font-semibold">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass} style={accent}>
            Phone <span className="normal-case text-stone-light">(optional)</span>
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="For contact if needed"
            autoComplete="tel"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} style={accent}>
          Notes <span className="normal-case text-stone-light">(optional)</span>
        </label>
        <textarea
          {...register("notes")}
          rows={2}
          placeholder="Accessibility, first time, etc."
          className={`${inputClass} resize-none`}
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-xl bg-gold hover:bg-gold-deep text-[#0f0d0b] font-bold text-sm tracking-[0.15em] uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={accent}
      >
        {isSubmitting ? "Checking you in…" : "Check in — I'm here"}
      </button>
    </form>
  );
}
