"use client";

import { useState } from "react";
import Link from "next/link";
import { parseVideoUrl } from "@/lib/video";
import type { BulletinPost, BulletinCategory } from "@/types/bulletin";

const CATEGORY_MAP: Record<
  BulletinCategory,
  { label: string; bg: string; text: string; border: string }
> = {
  event: {
    label: "Event",
    bg: "bg-blue-50",
    text: "text-info-earthen",
    border: "border-info-earthen/20",
  },
  promotion: {
    label: "Promotion / Offer",
    bg: "bg-gold-wash",
    text: "text-gold-deep",
    border: "border-gold-soft/50",
  },
  product: {
    label: "Product",
    bg: "bg-green-50",
    text: "text-success-earthen",
    border: "border-success-earthen/20",
  },
  service: {
    label: "Service",
    bg: "bg-emerald-50",
    text: "text-[#3c763d]",
    border: "border-[#3c763d]/20",
  },
};

export default function BulletinPostCard({ post }: { post: BulletinPost }) {
  const [showContact, setShowContact] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const catStyle = CATEGORY_MAP[post.category] || CATEGORY_MAP.service;
  const video = parseVideoUrl(post.video_url);

  const isLong = post.description.length > 280;
  const displayed =
    isLong && !expanded ? post.description.substring(0, 280) + "..." : post.description;

  const eventDate = post.event_date ? new Date(post.event_date) : null;

  return (
    <div
      className={`rounded-3xl border-2 overflow-hidden transition-all duration-220 flex flex-col bg-white relative ${
        post.featured ? "border-gold-soft/80" : "border-stone-edge hover:border-gold-soft/60"
      }`}
    >
      {post.featured && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-gold-wash flex items-center justify-center border-b border-l border-gold-soft text-[10px] text-gold font-bold z-10">
          ★
        </div>
      )}

      {/* Flyer / photo */}
      {post.image_url && (
        <Link href={`/bulletin/${post.id}`} className="block bg-parchment-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full max-h-72 object-cover"
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

        <div className="flex items-center gap-2 text-[10px] text-stone-light font-medium">
          <span>By {post.business_name || post.full_name}</span>
          <span>·</span>
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
          <div className="text-xs sm:text-sm text-stone-mid leading-relaxed whitespace-pre-wrap font-sans">
            {displayed}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gold-deep hover:text-gold font-semibold ml-1 focus:outline-none"
              >
                {expanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>

          {/* Meta: event date & location */}
          {(eventDate || post.location) && (
            <div className="mt-4 flex flex-col gap-1.5">
              {eventDate && (
                <div className="flex items-center gap-2 text-[11px] text-stone-mid font-semibold">
                  <span className="text-gold-deep">🗓</span>
                  <span>
                    {eventDate.toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {post.location && (
                <div className="flex items-center gap-2 text-[11px] text-stone-mid font-semibold">
                  <span className="text-gold-deep">📍</span>
                  <span>{post.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Video embed (YouTube / Vimeo) — lazy: thumbnail until clicked */}
          {video && (
            <div
              className="mt-4 relative w-full rounded-xl overflow-hidden border border-stone-edge bg-ink"
              style={{ paddingBottom: "56.25%" }}
            >
              {playing ? (
                <iframe
                  src={`${video.embedUrl}?autoplay=1`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label="Play video"
                  className="absolute inset-0 w-full h-full group"
                >
                  {video.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnail}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="absolute inset-0 bg-ink" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/10 group-hover:bg-ink/25 transition-colors">
                    <span className="w-14 h-14 rounded-full bg-ink/70 group-hover:bg-gold flex items-center justify-center text-vellum transition-colors">
                      <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Links: site + (video fallback for unrecognized links) */}
          {(post.link_url || (post.video_url && !video)) && (
            <div className="mt-4 flex items-center flex-wrap gap-2">
              {post.link_url && (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-info-earthen bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-info-earthen/20 transition-all uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  <span>Visit Link</span>
                </a>
              )}
              {post.video_url && !video && (
                <a
                  href={post.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-danger-earthen bg-red-50/60 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-danger-earthen/20 transition-all uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Video</span>
                </a>
              )}
            </div>
          )}

          {/* Contact reveal */}
          {showContact && (
            <div className="mt-5 p-4 rounded-2xl bg-parchment-soft border border-stone-edge/70 animate-fadeIn">
              <h4
                className="text-[10px] font-bold tracking-widest uppercase text-ink mb-2"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Get in Touch
              </h4>
              <div className="bg-white border border-stone-edge/50 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-ink font-mono break-all select-all">
                <span className="text-[10px] text-stone-light uppercase font-sans tracking-wide">
                  Contact {post.full_name}:
                </span>
                {post.contact_info}
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="mt-6 border-t border-stone-edge/30 pt-4 pb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowContact(!showContact)}
            className={`text-xs px-4 py-2.5 rounded-full font-semibold transition-all flex items-center gap-1 ${
              showContact ? "bg-stone text-vellum" : "bg-ink hover:bg-stone text-vellum"
            }`}
          >
            <span>{showContact ? "Hide Contact" : "Contact"}</span>
            <span className="text-xs leading-none">→</span>
          </button>

          <Link
            href={`/bulletin/${post.id}`}
            className="text-[10px] tracking-widest uppercase font-bold text-stone hover:text-gold transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
