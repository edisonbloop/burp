"use client";

import Link from "next/link";
import type { BulletinPost, BulletinCategory } from "@/types/bulletin";

const CATEGORY_MAP: Record<
  BulletinCategory,
  { label: string; bg: string; text: string; border: string; bar: string }
> = {
  event: {
    label: "Event",
    bg: "bg-blue-50",
    text: "text-info-earthen",
    border: "border-info-earthen/20",
    bar: "bg-info-earthen",
  },
  promotion: {
    label: "Promotion / Offer",
    bg: "bg-gold-wash",
    text: "text-gold-deep",
    border: "border-gold-soft/50",
    bar: "bg-gold",
  },
  product: {
    label: "Product",
    bg: "bg-green-50",
    text: "text-success-earthen",
    border: "border-success-earthen/20",
    bar: "bg-success-earthen",
  },
  service: {
    label: "Service",
    bg: "bg-emerald-50",
    text: "text-[#3c763d]",
    border: "border-[#3c763d]/20",
    bar: "bg-[#3c763d]",
  },
};

export default function BulletinPostCard({ post }: { post: BulletinPost }) {
  const catStyle = CATEGORY_MAP[post.category] || CATEGORY_MAP.service;
  const hasVideo = !!post.video_url;

  const eventDate = post.event_date ? new Date(post.event_date) : null;

  return (
    <div
      className={`group/card rounded-3xl border overflow-hidden transition-all duration-200 flex flex-col bg-white relative hover:-translate-y-1 hover:shadow-xl ${
        post.featured
          ? "border-gold-soft shadow-md shadow-gold/10"
          : "border-stone-edge hover:border-gold-soft"
      }`}
    >
      <span aria-hidden className={`h-1 w-full ${catStyle.bar}`} />
      {post.featured && (
        <div
          className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-gold text-ink text-[9px] font-bold tracking-widest uppercase shadow"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          ★ Featured
        </div>
      )}

      {/* Flyer / photo */}
      {post.image_url && (
        <Link href={`/bulletin/${post.id}`} className="block bg-parchment-soft overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-44 object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
            loading="lazy"
          />
        </Link>
      )}

      {/* Header & badges */}
      <div className="p-6 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {catStyle.label}
          </span>
          {post.price && (
            <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-stone-edge bg-vellum text-stone-mid">
              {post.price}
            </span>
          )}
        </div>

        <h3
          className="text-xl sm:text-2xl font-bold text-ink leading-tight mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Link href={`/bulletin/${post.id}`} className="hover:text-gold-deep transition-colors">
            {post.title}
          </Link>
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-stone-mid font-medium">
          <span
            aria-hidden
            className="w-6 h-6 rounded-full bg-gold-wash text-gold-deep flex items-center justify-center text-[10px] font-bold"
          >
            {(post.business_name || post.full_name).trim().charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold text-ink/80 truncate">{post.business_name || post.full_name}</span>
          <span className="text-stone-light">·</span>
          <span>
            {new Date(post.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs sm:text-sm text-stone-mid leading-relaxed line-clamp-3 whitespace-pre-line">
            {post.description}
          </p>

          {(eventDate || post.location) && (
            <div className="mt-4 flex flex-col gap-2 rounded-xl bg-parchment-soft border border-stone-edge/60 px-3.5 py-3">
              {eventDate && (
                <div className="flex items-center gap-2 text-[11px] text-stone-mid font-semibold">
                  <svg className="w-3.5 h-3.5 text-gold-deep shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" /></svg>
                  <span>
                    {eventDate.toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {post.location && (
                <div className="flex items-center gap-2 text-[11px] text-stone-mid font-semibold min-w-0">
                  <svg className="w-3.5 h-3.5 text-gold-deep shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  <span className="truncate">{post.location}</span>
                </div>
              )}
            </div>
          )}

          {(post.link_url || hasVideo || post.contact_info) && (
            <p className="mt-3 text-[10px] text-stone-light uppercase tracking-wider">
              Includes {[hasVideo && "video", post.link_url && "link", post.contact_info && "contact"].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        <div className="mt-5 border-t border-stone-edge/50 pt-4 pb-6">
          <Link
            href={`/bulletin/${post.id}`}
            className="group/cta inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-bold text-gold-deep hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            View full details
            <span className="text-sm font-sans transition-transform group-hover/cta:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
