"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStone } from "@/lib/actions";
import Link from "next/link";

const schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  display_name: z.string().optional(),
  contact: z.string().optional(),
  journey_word: z
    .string()
    .min(1, "Please share your one-word summary")
    .regex(/^\S+$/, "One word only — no spaces")
    .max(30, "Keep it short"),
  scripture: z.string().optional(),
  remembrance: z
    .string()
    .min(10, "Please share at least a sentence")
    .max(1500, "Please keep it under 1500 characters"),
  testimony: z.string().max(600, "Please keep it under 600 characters").optional(),
  consent_public: z.boolean().refine((v) => v === true, {
    message: "You must consent to share your stone publicly",
  }),
  anonymous: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function StoneForm() {
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
      consent_public: false,
      anonymous: false,
    },
  });

  const remembranceValue = watch("remembrance") ?? "";

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    const result = await createStone({
      full_name: data.full_name,
      display_name: data.display_name,
      contact: data.contact,
      journey_word: data.journey_word,
      scripture: data.scripture,
      remembrance: data.remembrance,
      testimony: data.testimony,
      consent_public: data.consent_public,
      anonymous: data.anonymous,
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
        <div className="text-5xl mb-6">◉</div>
        <h2
          className="text-3xl font-bold text-[#2d1f0e] mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Your Stone Has Been Set
        </h2>
        <p className="text-[#7a5a3a] max-w-md leading-relaxed mb-8">
          Your stone has been added to the memorial. May this remembrance become
          fuel for your next season. It will be reviewed and shared once approved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              reset();
              setSubmitted(false);
            }}
            className="px-6 py-3 rounded-xl border border-[#e8d4b0] text-[#7a5a3a] hover:border-[#c4893a] hover:text-[#c4893a] font-medium transition-colors"
          >
            Submit Another Stone
          </button>
          <Link
            href="/stones"
            className="px-6 py-3 rounded-xl bg-[#c4893a] hover:bg-[#a96e28] text-white font-semibold transition-colors text-center"
          >
            View the Stones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Full name */}
      <div>
        <label className="block text-sm font-medium text-[#4d2c11] mb-1.5">
          Full Name <span className="text-[#c4893a]">*</span>
        </label>
        <input
          {...register("full_name")}
          type="text"
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      {/* Display name */}
      <div>
        <label className="block text-sm font-medium text-[#4d2c11] mb-1.5">
          Display Name{" "}
          <span className="text-[#7a5a3a] font-normal">(optional)</span>
        </label>
        <input
          {...register("display_name")}
          type="text"
          placeholder="How you'd like to be shown publicly"
          className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition"
        />
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-[#4d2c11] mb-1.5">
          Email or WhatsApp{" "}
          <span className="text-[#7a5a3a] font-normal">(optional, admin use only)</span>
        </label>
        <input
          {...register("contact")}
          type="text"
          placeholder="For organizer follow-up only, never displayed"
          className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition"
        />
      </div>

      {/* Journey word */}
      <div>
        <label className="block text-sm font-medium text-[#4d2c11] mb-1.5">
          One Word that Describes Your Journey{" "}
          <span className="text-[#c4893a]">*</span>
        </label>
        <input
          {...register("journey_word")}
          type="text"
          placeholder="e.g. Awakening, Surrender, Peace, Clarity…"
          className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition"
        />
        {errors.journey_word && (
          <p className="mt-1 text-sm text-red-600">{errors.journey_word.message}</p>
        )}
      </div>

      {/* Scripture */}
      <div>
        <label className="block text-sm font-medium text-[#4d2c11] mb-1.5">
          Scripture that Stood Out{" "}
          <span className="text-[#7a5a3a] font-normal">(optional but encouraged)</span>
        </label>
        <input
          {...register("scripture")}
          type="text"
          placeholder='e.g. Psalm 103:2 — "Forget not all His benefits"'
          className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition"
        />
      </div>

      {/* Stone of remembrance */}
      <div>
        <label className="block text-sm font-medium text-[#4d2c11] mb-1.5">
          Your Stone of Remembrance <span className="text-[#c4893a]">*</span>
        </label>
        <p className="text-sm text-[#7a5a3a] mb-2 leading-relaxed italic">
          What do you want to remember God did in you during these 100 days?
        </p>
        <textarea
          {...register("remembrance")}
          rows={5}
          placeholder="In Joshua 4, Israel set up stones so future generations would ask, 'What do these stones mean?' Your story may become someone else's courage."
          className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.remembrance ? (
            <p className="text-sm text-red-600">{errors.remembrance.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-[#c4b090]">
            {remembranceValue.length}/1500
          </span>
        </div>
      </div>

      {/* Testimony */}
      <div>
        <label className="block text-sm font-medium text-[#4d2c11] mb-1.5">
          Short Testimony{" "}
          <span className="text-[#7a5a3a] font-normal">(optional)</span>
        </label>
        <textarea
          {...register("testimony")}
          rows={3}
          placeholder="Anything else you'd like to share…"
          className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition resize-none"
        />
        {errors.testimony && (
          <p className="mt-1 text-sm text-red-600">{errors.testimony.message}</p>
        )}
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 bg-[#fdf8f0] border border-[#e8d4b0] rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register("consent_public")}
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-[#c4893a]"
          />
          <span className="text-sm text-[#4d2c11] leading-relaxed">
            I agree that my submitted stone may be displayed publicly on this
            page. <span className="text-[#c4893a]">*</span>
          </span>
        </label>
        {errors.consent_public && (
          <p className="text-sm text-red-600 ml-7">{errors.consent_public.message}</p>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register("anonymous")}
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-[#c4893a]"
          />
          <span className="text-sm text-[#4d2c11] leading-relaxed">
            Display this anonymously — my name will not be shown.
          </span>
        </label>
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-xl bg-[#c4893a] hover:bg-[#a96e28] text-white font-semibold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Setting your stone…" : "Set My Stone of Remembrance"}
      </button>
    </form>
  );
}
