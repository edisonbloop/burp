"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSharehouseNeed } from "@/lib/sharehouse-actions";
import Link from "next/link";
import type { SharehouseCategory } from "@/types/sharehouse";

const CATEGORY_OPTIONS: { value: SharehouseCategory; label: string }[] = [
  { value: "financial", label: "Financial Assistance" },
  { value: "medical", label: "Medical Support" },
  { value: "job", label: "Job Opportunity" },
  { value: "education", label: "Educational Need" },
  { value: "emotional", label: "Emotional Support" },
  { value: "practical", label: "Practical Burden" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  full_name: z.string().min(2, "Full name is required for verification"),
  anonymous: z.boolean(),
  contact_info: z.string().min(5, "Contact info (email or phone) is required so caretakers can reach you"),
  category: z.enum(["financial", "medical", "job", "education", "emotional", "practical", "other"] as const, {
    message: "Please select a category for your need",
  }),
  title: z
    .string()
    .min(5, "Need title must be at least 5 characters")
    .max(80, "Keep the title under 80 characters"),
  description: z
    .string()
    .min(20, "Please describe your need in at least a short paragraph (min 20 characters)")
    .max(2000, "Please keep the description under 2000 characters"),
  evidence_url: z
    .string()
    .url("Please enter a valid URL or leave blank")
    .or(z.literal(""))
    .optional(),
  consent_moderation: z.boolean().refine((v) => v === true, {
    message: "You must consent to administrator verification and review",
  }),
});

type FormValues = z.infer<typeof schema>;

export default function SharehouseForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      anonymous: false,
      consent_moderation: false,
      evidence_url: "",
    },
  });

  const descriptionValue = watch("description") ?? "";

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    const result = await createSharehouseNeed({
      full_name: data.full_name,
      anonymous: data.anonymous,
      contact_info: data.contact_info,
      category: data.category,
      title: data.title,
      description: data.description,
      evidence_url: data.evidence_url || undefined,
    });

    if (result.error) {
      setServerError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-5xl mb-6 text-gold">▲</div>
        <h2
          className="text-3xl font-bold text-ink mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Need Registered in the Sharehouse
        </h2>
        <p className="text-stone-mid max-w-md leading-relaxed mb-8 text-sm">
          Your request has been registered. Inspired by Acts 2, we seek to verify each need to build maximum trust and transparency. An administrator will review your details and contact you shortly before releasing it onto the public board.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              reset();
              setSubmitted(false);
            }}
            className="px-6 py-3 rounded-xl border border-stone-edge text-stone hover:border-gold hover:text-gold font-medium transition-colors text-sm"
          >
            Submit Another Need
          </button>
          <Link
            href="/sharehouse"
            className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold transition-colors text-center text-sm"
          >
            Back to the Sharehouse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Visual scripture hook */}
      <div className="border border-stone-edge bg-parchment-soft rounded-2xl p-6 text-center">
        <span
          className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-2"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Acts 2:44-45
        </span>
        <blockquote className="text-stone-mid text-xs italic leading-relaxed max-w-lg mx-auto">
          &ldquo;And all that believed were together, and had all things common; And sold their possessions and goods, and parted them to all men, as every man had need.&rdquo;
        </blockquote>
      </div>

      {/* Full Name & Anonymous toggle */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
            Your Real Name <span className="text-gold-deep">*</span>
          </label>
          <input
            {...register("full_name")}
            type="text"
            placeholder="e.g. Samuel Adebayo"
            className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans"
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
            Privacy Option <span className="text-gold-deep">*</span>
          </label>
          <div className="h-[46px] flex items-center bg-white border border-stone-edge rounded-xl px-4">
            <label className="flex items-center gap-2.5 cursor-pointer w-full text-xs font-bold uppercase tracking-wide text-stone-mid">
              <input
                {...register("anonymous")}
                type="checkbox"
                className="w-4 h-4 accent-gold"
              />
              <span>Post Anonymously</span>
            </label>
          </div>
          <span className="text-[10px] text-stone-light mt-1 block leading-relaxed">
            If checked, your name is hidden as &quot;Anonymous&quot; from the community (admins still see it).
          </span>
        </div>
      </div>

      {/* Contact info (Email or phone) */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Contact details <span className="text-gold-deep">*</span>
        </label>
        <input
          {...register("contact_info")}
          type="text"
          placeholder="For verification only (e.g. email or phone number)"
          className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans"
        />
        <span className="text-[10px] text-stone-light mt-1 block leading-relaxed">
          Organizational caretakers will reach out here. Helper details can also be sent here. Keep this secure, as you will use this exact contact information to mark this need as met and share your testimony!
        </span>
        {errors.contact_info && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.contact_info.message}</p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Need Category <span className="text-gold-deep">*</span>
        </label>
        <select
          {...register("category")}
          className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans"
        >
          <option value="">Select category…</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.category.message}</p>
        )}
      </div>

      {/* Need Title */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Need Title <span className="text-gold-deep">*</span>
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="A brief, clear title summarizing your burden (e.g. Tuition assistance for final semester)"
          className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.title.message}</p>
        )}
      </div>

      {/* Detailed Description */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Details of your Burden <span className="text-gold-deep">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={6}
          placeholder="Please explain the need transparently. Include any specifics, materials, resources, or support requested so members understand the depth of the burden."
          className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-xs text-danger-earthen font-semibold">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-stone-light font-medium">
            {descriptionValue.length}/2000
          </span>
        </div>
      </div>

      {/* Supporting Evidence URL */}
      <div>
        <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
          Verification/Evidence Link <span className="text-stone-light font-normal">(optional)</span>
        </label>
        <input
          {...register("evidence_url")}
          type="text"
          placeholder="e.g. Link to admission letter, medical bill estimate, etc. (https://...)"
          className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans"
        />
        <span className="text-[10px] text-stone-light mt-1 block leading-relaxed">
          Sharing verified documentation helps build accountability, integrity, and trust within the church body. Please upload your evidence document to a drive (e.g. Google Drive, Dropbox, OneDrive) and paste the link here.
        </span>
        {errors.evidence_url && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.evidence_url.message}</p>
        )}
      </div>

      {/* Consents Box */}
      <div className="space-y-3 bg-parchment-soft border border-stone-edge rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register("consent_moderation")}
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-gold"
          />
          <span className="text-xs text-stone-mid leading-relaxed font-sans">
            I understand that BURP operates on high trust. I consent to let administrators verify my identity, review supporting details, and communicate with me before approving my post. <span className="text-gold-deep">*</span>
          </span>
        </label>
        {errors.consent_moderation && (
          <p className="text-xs text-danger-earthen font-semibold ml-7">{errors.consent_moderation.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
          {serverError}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-xl bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Registering Need..." : "Register Need in Sharehouse"}
      </button>
    </form>
  );
}
