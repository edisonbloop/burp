"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createWorshipRsvp } from "@/lib/worship-actions";

const schema = z.object({
  full_name: z.string().min(2, "Your name is required"),
  email: z.string().email("Please enter a valid email"),
  guest_count: z
    .number({ message: "Enter a number" })
    .int()
    .min(1, "At least 1")
    .max(20, "Max 20 guests"),
  notes: z.string().max(300, "Keep this under 300 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

export default function WorshipRsvpForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", guest_count: 1, notes: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    const result = await createWorshipRsvp({
      full_name: data.full_name,
      email: data.email,
      guest_count: data.guest_count,
      notes: data.notes || undefined,
    });

    if (result.error) setServerError(result.error);
    else setSubmitted(true);
  };

  const labelClass =
    "block text-[10px] font-bold tracking-widest uppercase text-[#a89885] mb-2";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-[#f0e6d6] placeholder:text-[#6a5e50] focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans";
  const accent = { fontFamily: "var(--font-accent)" };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-5 text-gold">✓</div>
        <h3
          className="text-2xl sm:text-3xl font-bold text-gold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You&rsquo;re on the list
        </h3>
        <p className="text-[#c8b898] text-sm leading-relaxed max-w-sm mx-auto">
          A confirmation is on its way to your inbox. We&rsquo;ll send your livestream
          link closer to the night.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={accent}>
            Full Name
          </label>
          <input
            {...register("full_name")}
            type="text"
            placeholder="e.g. Grace Adeyemi"
            className={inputClass}
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-[#e0a888] font-semibold">{errors.full_name.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass} style={accent}>
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@email.com"
            className={inputClass}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[#e0a888] font-semibold">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass} style={accent}>
          Guests joining with you
        </label>
        <input
          {...register("guest_count", { valueAsNumber: true })}
          type="number"
          min={1}
          max={20}
          className={`${inputClass} max-w-[140px]`}
        />
        {errors.guest_count && (
          <p className="mt-1 text-xs text-[#e0a888] font-semibold">{errors.guest_count.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass} style={accent}>
          Anything you&rsquo;d like us to know <span className="normal-case text-[#6a5e50]">(optional)</span>
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Prayer request, accessibility need, anything else"
          className={`${inputClass} resize-none`}
        />
      </div>

      {serverError && (
        <p className="text-sm text-[#e0a888] bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-medium">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-xl bg-gold hover:bg-gold-deep text-[#0f0d0b] font-bold text-sm tracking-wide uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={accent}
      >
        {isSubmitting ? "Saving your seat…" : "RSVP to attend the livestream"}
      </button>
    </form>
  );
}
