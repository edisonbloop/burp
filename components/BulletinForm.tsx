"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBulletinPost, updateMyBulletinPost } from "@/lib/bulletin-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { parseVideoUrl } from "@/lib/video";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BulletinCategory, BulletinPost } from "@/types/bulletin";

// Convert an ISO timestamp to the value a datetime-local input expects.
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const CATEGORY_OPTIONS: { value: BulletinCategory; label: string }[] = [
  { value: "event", label: "Event" },
  { value: "promotion", label: "Promotion / Offer" },
  { value: "product", label: "Product" },
  { value: "service", label: "Service" },
];

// Prepend https:// when a URL is entered without a scheme (e.g. "www.site.com").
function httpsify(v: string) {
  const t = v.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

// Optional URL field that auto-adds https:// then validates (blank allowed).
function urlField(message: string) {
  return z
    .string()
    .transform(httpsify)
    .refine((v) => v === "" || z.string().url().safeParse(v).success, message);
}

const schema = z.object({
  full_name: z.string().min(2, "Your name is required"),
  business_name: z.string().max(80, "Keep it under 80 characters").optional(),
  category: z.enum(["event", "promotion", "product", "service"] as const, {
    message: "Please choose what you're posting",
  }),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(80, "Keep the title under 80 characters"),
  description: z
    .string()
    .min(20, "Please add at least a short description (min 20 characters)")
    .max(2000, "Please keep the description under 2000 characters"),
  contact_info: z
    .string()
    .min(5, "Contact info (email, phone or handle) is required"),
  link_url: urlField("Please enter a valid URL or leave blank").optional(),
  video_url: urlField("Please enter a valid video URL or leave blank").optional(),
  price: z.string().max(60, "Keep this short").optional(),
  location: z.string().max(120, "Keep this short").optional(),
  event_date: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: "Please confirm the details are accurate",
  }),
});

type FormValues = z.infer<typeof schema>;

export default function BulletinForm({ initial }: { initial?: BulletinPost }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const isEdit = !!initial;
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  // null = still checking; flyer upload is restricted to signed-in members.
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  // Name pulled from the signed-in member's profile, used to prefill + lock the name field.
  const [memberName, setMemberName] = useState("");
  // The signed-in member's id, attached to new posts so they can edit later.
  const [userId, setUserId] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      category: initial?.category,
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      contact_info: initial?.contact_info ?? "",
      business_name: initial?.business_name ?? "",
      link_url: initial?.link_url ?? "",
      video_url: initial?.video_url ?? "",
      price: initial?.price ?? "",
      location: initial?.location ?? "",
      event_date: toDatetimeLocal(initial?.event_date),
      consent: isEdit, // already consented at first submission
    },
  });

  useEffect(() => {
    let active = true;

    async function loadMember(session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) {
      if (!active) return;
      setIsSignedIn(!!session);
      if (!session) {
        setMemberName("");
        setUserId("");
        return;
      }
      setUserId(session.user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!active) return;
      const name =
        (profile?.full_name as string | undefined)?.trim() ||
        (session.user.user_metadata?.full_name as string | undefined)?.trim() ||
        "";
      setMemberName(name);
      // Prefill the name from the profile only when creating a new post.
      if (name && !isEdit) setValue("full_name", name, { shouldValidate: true });
    }

    supabase.auth.getSession().then(({ data }) => loadMember(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => loadMember(session));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, setValue, isEdit]);

  const category = watch("category");
  const descriptionValue = watch("description") ?? "";
  const videoUrlValue = watch("video_url") ?? "";
  const videoPreview = parseVideoUrl(videoUrlValue);

  const normalizeUrlOnBlur =
    (field: "link_url" | "video_url") =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const v = e.target.value.trim();
      if (v && !/^https?:\/\//i.test(v)) {
        setValue(field, `https://${v}`, { shouldValidate: true });
      }
    };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5 MB.");
      return;
    }

    setUploadError("");
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `flyers/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("bulletin")
      .upload(path, file, { contentType: file.type });

    if (error) {
      setUploadError("Could not upload image — " + error.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("bulletin").getPublicUrl(path);
    setImageUrl(publicUrl);
    setUploading(false);
  };

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    const payload = {
      category: data.category,
      title: data.title,
      description: data.description,
      full_name: data.full_name,
      business_name: data.business_name || undefined,
      contact_info: data.contact_info,
      link_url: data.link_url || undefined,
      image_url: imageUrl || undefined,
      video_url: data.video_url || undefined,
      price: data.price || undefined,
      location: data.location || undefined,
      event_date: data.event_date || undefined,
    };

    const result = isEdit
      ? await updateMyBulletinPost(initial!.id, userId, payload)
      : await createBulletinPost({ ...payload, userId: userId || undefined });

    if (result.error) {
      setServerError(result.error);
    } else if (isEdit) {
      router.push(`/bulletin/${initial!.id}`);
      router.refresh();
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
          Posted to the Bulletin
        </h2>
        <p className="text-stone-mid max-w-md leading-relaxed mb-8 text-sm">
          Thank you! Your post has been submitted. An administrator will review
          it shortly before it goes live on the community board.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              reset();
              setImageUrl("");
              setSubmitted(false);
            }}
            className="px-6 py-3 rounded-xl border border-stone-edge text-stone hover:border-gold hover:text-gold font-medium transition-colors text-sm"
          >
            Post Another
          </button>
          <Link
            href="/bulletin"
            className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold transition-colors text-center text-sm"
          >
            Back to the Bulletin
          </Link>
        </div>
      </div>
    );
  }

  const labelClass =
    "block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans";
  const accent = { fontFamily: "var(--font-accent)" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Scripture hook */}
      <div className="border border-stone-edge bg-parchment-soft rounded-2xl p-6 text-center">
        <span
          className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-2"
          style={accent}
        >
          Romans 12:11
        </span>
        <blockquote className="text-stone-mid text-xs italic leading-relaxed max-w-lg mx-auto">
          &ldquo;Not slothful in business; fervent in spirit; serving the Lord.&rdquo;
        </blockquote>
      </div>

      {/* Name & Business */}
      <div className="grid sm:grid-cols-2 gap-6">
        {!isEdit && isSignedIn && memberName ? (
          <div>
            <label className={labelClass} style={accent}>
              Posting As
            </label>
            {/* Name comes from your member profile */}
            <input type="hidden" {...register("full_name")} />
            <div className="h-[46px] flex items-center gap-2 bg-parchment-soft border border-stone-edge rounded-xl px-4">
              <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
              <span className="text-sm font-semibold text-ink truncate">{memberName}</span>
            </div>
          </div>
        ) : (
          <div>
            <label className={labelClass} style={accent}>
              Your Name <span className="text-gold-deep">*</span>
            </label>
            <input
              {...register("full_name")}
              type="text"
              placeholder="e.g. Grace Adeyemi"
              className={inputClass}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.full_name.message}</p>
            )}
          </div>
        )}

        <div>
          <label className={labelClass} style={accent}>
            Business / Ministry <span className="text-stone-light font-normal">(optional)</span>
          </label>
          <input
            {...register("business_name")}
            type="text"
            placeholder="e.g. Grace Bakes"
            className={inputClass}
          />
          {errors.business_name && (
            <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.business_name.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass} style={accent}>
          What are you posting? <span className="text-gold-deep">*</span>
        </label>
        <select {...register("category")} className={inputClass}>
          <option value="">Select…</option>
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

      {/* Title */}
      <div>
        <label className={labelClass} style={accent}>
          Title <span className="text-gold-deep">*</span>
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="e.g. Worship Night this Friday · 20% off all cakes · Web design services"
          className={inputClass}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass} style={accent}>
          Details <span className="text-gold-deep">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={6}
          placeholder="Describe your event, offer, product or service. Include what people need to know to take you up on it."
          className={`${inputClass} resize-none`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-xs text-danger-earthen font-semibold">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-stone-light font-medium">{descriptionValue.length}/2000</span>
        </div>
      </div>

      {/* Price & Location */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass} style={accent}>
            Price <span className="text-stone-light font-normal">(optional)</span>
          </label>
          <input
            {...register("price")}
            type="text"
            placeholder='e.g. "₦5,000", "Free", "From $20"'
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={accent}>
            {category === "event" ? "Venue / Location" : "Location / Area"}{" "}
            <span className="text-stone-light font-normal">(optional)</span>
          </label>
          <input
            {...register("location")}
            type="text"
            placeholder={category === "event" ? "e.g. Main Hall, Lagos" : "e.g. Lagos · Remote · Worldwide"}
            className={inputClass}
          />
        </div>
      </div>

      {/* Event date — events only */}
      {category === "event" && (
        <div>
          <label className={labelClass} style={accent}>
            Event Date & Time <span className="text-stone-light font-normal">(optional)</span>
          </label>
          <input {...register("event_date")} type="datetime-local" className={inputClass} />
        </div>
      )}

      {/* Contact */}
      <div>
        <label className={labelClass} style={accent}>
          How can people reach you? <span className="text-gold-deep">*</span>
        </label>
        <input
          {...register("contact_info")}
          type="text"
          placeholder="Email, phone or WhatsApp / social handle"
          className={inputClass}
        />
        {errors.contact_info && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.contact_info.message}</p>
        )}
      </div>

      {/* Link */}
      <div>
        <label className={labelClass} style={accent}>
          Link <span className="text-stone-light font-normal">(optional)</span>
        </label>
        <input
          {...register("link_url", { onBlur: normalizeUrlOnBlur("link_url") })}
          type="text"
          placeholder="Website, shop, registration or social link (www. or https://...)"
          className={inputClass}
        />
        {errors.link_url && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.link_url.message}</p>
        )}
      </div>

      {/* Video link */}
      <div>
        <label className={labelClass} style={accent}>
          Video Link <span className="text-stone-light font-normal">(optional)</span>
        </label>
        <input
          {...register("video_url", { onBlur: normalizeUrlOnBlur("video_url") })}
          type="text"
          placeholder="YouTube, Vimeo or other video URL (www. or https://...)"
          className={inputClass}
        />
        {errors.video_url && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{errors.video_url.message}</p>
        )}

        {/* Live preview */}
        {videoPreview && (
          <div className="mt-3">
            <div
              className="relative w-full rounded-xl overflow-hidden border border-stone-edge bg-ink"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={videoPreview.embedUrl}
                title="Video preview"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <p className="mt-1 text-[10px] text-stone-light uppercase tracking-wide font-semibold">
              {videoPreview.provider} video detected — this is how it&rsquo;ll show on your post.
            </p>
          </div>
        )}
        {!videoPreview && videoUrlValue.trim() && (
          <p className="mt-1 text-[10px] text-stone-light">
            We&rsquo;ll show this as a link. For an inline player, use a YouTube or Vimeo URL.
          </p>
        )}
      </div>

      {/* Flyer / photo upload */}
      <div>
        <label className={labelClass} style={accent}>
          Flyer / Photo <span className="text-stone-light font-normal">(optional)</span>
        </label>

        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-stone-edge bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Flyer preview" className="w-full max-h-80 object-contain bg-parchment-soft" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 bg-ink/80 text-vellum text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-ink transition-colors"
            >
              Remove
            </button>
          </div>
        ) : isSignedIn === false ? (
          <div className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed border-stone-edge bg-parchment-soft text-center px-4">
            <svg className="w-7 h-7 text-stone-light" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25z" />
            </svg>
            <span className="text-xs font-semibold text-stone-mid">
              Flyer uploads are for signed-in members
            </span>
            <Link
              href="/signin?redirect=/bulletin/submit"
              className="text-xs font-bold text-gold hover:underline"
            >
              Sign in to add a flyer →
            </Link>
            <span className="text-[10px] text-stone-light">
              You can still post without a flyer.
            </span>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              uploading
                ? "border-gold bg-gold-wash/30"
                : "border-stone-edge bg-white hover:border-gold hover:bg-parchment-soft"
            } ${isSignedIn === null ? "opacity-60 pointer-events-none" : ""}`}
          >
            <svg className="w-7 h-7 text-stone-light" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs font-semibold text-stone-mid">
              {uploading ? "Uploading…" : "Tap to upload a flyer or photo"}
            </span>
            <span className="text-[10px] text-stone-light">PNG or JPG · up to 5 MB</span>
            <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} className="hidden" />
          </label>
        )}

        {uploadError && (
          <p className="mt-1 text-xs text-danger-earthen font-semibold">{uploadError}</p>
        )}
      </div>

      {/* Consent */}
      <div className="space-y-3 bg-parchment-soft border border-stone-edge rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input {...register("consent")} type="checkbox" className="mt-0.5 w-4 h-4 accent-gold" />
          <span className="text-xs text-stone-mid leading-relaxed font-sans">
            I confirm these details are accurate and that an administrator may review this post before it goes live. <span className="text-gold-deep">*</span>
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-danger-earthen font-semibold ml-7">{errors.consent.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="w-full py-4 px-6 rounded-xl bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? isEdit
            ? "Saving…"
            : "Posting..."
          : uploading
          ? "Uploading image…"
          : isEdit
          ? "Save Changes"
          : "Post to the Bulletin"}
      </button>
    </form>
  );
}
