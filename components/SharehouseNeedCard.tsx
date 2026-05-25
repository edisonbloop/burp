"use client";

import { useState } from "react";
import type { SharehouseNeed, SharehouseCategory } from "@/types/sharehouse";

interface SharehouseNeedCardProps {
  need: SharehouseNeed;
  onMarkAsMet: (id: string) => void;
}

const CATEGORY_MAP: Record<
  SharehouseCategory,
  { label: string; bg: string; text: string; border: string }
> = {
  financial: {
    label: "Financial Assistance",
    bg: "bg-gold-wash",
    text: "text-gold-deep",
    border: "border-gold-soft/50",
  },
  medical: {
    label: "Medical Support",
    bg: "bg-red-50",
    text: "text-danger-earthen",
    border: "border-danger-earthen/20",
  },
  job: {
    label: "Job Opportunity",
    bg: "bg-blue-50",
    text: "text-info-earthen",
    border: "border-info-earthen/20",
  },
  education: {
    label: "Educational Need",
    bg: "bg-green-50",
    text: "text-success-earthen",
    border: "border-success-earthen/20",
  },
  emotional: {
    label: "Emotional Support",
    bg: "bg-amber-50/50",
    text: "text-[#8a6d3b]",
    border: "border-[#8a6d3b]/20",
  },
  practical: {
    label: "Practical Burden",
    bg: "bg-emerald-50",
    text: "text-[#3c763d]",
    border: "border-[#3c763d]/20",
  },
  other: {
    label: "Other",
    bg: "bg-stone-wash bg-parchment-soft",
    text: "text-stone",
    border: "border-stone-edge/50",
  },
};

export default function SharehouseNeedCard({ need, onMarkAsMet }: SharehouseNeedCardProps) {
  const [showHelpDetails, setShowHelpDetails] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const catStyle = CATEGORY_MAP[need.category] || CATEGORY_MAP.other;
  const isMet = need.status === "met";

  // Check if description is long
  const isLongDescription = need.description.length > 280;
  const displayedDescription =
    isLongDescription && !isDescriptionExpanded
      ? need.description.substring(0, 280) + "..."
      : need.description;

  return (
    <div
      className={`rounded-3xl border-2 overflow-hidden transition-all duration-220 flex flex-col bg-white relative ${
        isMet
          ? "border-gold-soft bg-gold-wash/10 shadow-sm"
          : need.featured
          ? "border-gold-soft/80"
          : "border-stone-edge hover:border-gold-soft/60"
      }`}
    >
      {/* Featured Star Indicator */}
      {need.featured && !isMet && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-gold-wash flex items-center justify-center border-b border-l border-gold-soft text-[10px] text-gold font-bold">
          ★
        </div>
      )}

      {/* Card Header & Badges */}
      <div className="p-6 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {catStyle.label}
          </span>

          {isMet ? (
            <span
              className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-gold-soft/50 bg-gold text-white flex items-center gap-1"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              ✓ Met & Answered
            </span>
          ) : (
            <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-stone-edge bg-vellum text-stone-mid">
              Active Need
            </span>
          )}
        </div>

        <h3
          className="text-xl sm:text-2xl font-bold text-ink leading-tight mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {need.title}
        </h3>

        <div className="flex items-center gap-2 text-[10px] text-stone-light font-medium">
          <span>By {need.anonymous ? "Anonymous" : need.full_name}</span>
          <span>·</span>
          <span>
            {new Date(need.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Card Body - Description / Testimony */}
      <div className="px-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Main Description */}
          <div className="text-xs sm:text-sm text-stone-mid leading-relaxed whitespace-pre-wrap font-sans">
            {displayedDescription}
            {isLongDescription && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-gold-deep hover:text-gold font-semibold ml-1 focus:outline-none"
              >
                {isDescriptionExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>

          {/* Evidence Link */}
          {need.evidence_url && (
            <div className="mt-4 flex items-center">
              <a
                href={need.evidence_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-success-earthen bg-green-50/50 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-success-earthen/20 transition-all uppercase tracking-wider"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
                <span>Verification Document</span>
              </a>
            </div>
          )}

          {/* Earthen Testimony section if Met */}
          {isMet && need.update_testimony && (
            <div className="mt-5 p-4 rounded-2xl bg-gold-wash/20 border border-gold-soft/30 relative">
              <span className="absolute top-2 right-3 text-3xl text-gold-deep/20 font-serif leading-none select-none">
                “
              </span>
              <span
                className="text-[9px] font-bold tracking-widest text-gold-deep uppercase block mb-1.5"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Answered & Testimony
              </span>
              <p className="text-xs text-stone-mid italic leading-relaxed whitespace-pre-wrap font-sans">
                &ldquo;{need.update_testimony}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* How to Help details panel (Expandable) */}
        {showHelpDetails && !isMet && (
          <div className="mt-5 p-4 rounded-2xl bg-parchment-soft border border-stone-edge/70 animate-fadeIn">
            <h4
              className="text-[10px] font-bold tracking-widest uppercase text-ink mb-2"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              How to Offer Support
            </h4>
            <p className="text-xs text-stone-mid leading-relaxed mb-3">
              Reach out directly to the submitter through their verified contact channel below. Coordinate with them, keeping the coordinators updated.
            </p>
            <div className="bg-white border border-stone-edge/50 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-ink font-mono break-all select-all">
              <span className="text-[10px] text-stone-light uppercase font-sans tracking-wide">
                Direct Contact Channel:
              </span>
              {need.contact_info}
            </div>
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="mt-6 border-t border-stone-edge/30 pt-4 pb-6 flex items-center justify-between gap-3">
          {isMet ? (
            <div className="w-full text-center text-[10px] font-bold tracking-widest uppercase text-gold-deep">
              Glory to God for His Provision
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowHelpDetails(!showHelpDetails)}
                className={`text-xs px-4 py-2.5 rounded-full font-semibold transition-all flex items-center gap-1 ${
                  showHelpDetails
                    ? "bg-stone text-vellum"
                    : "bg-ink hover:bg-stone text-vellum"
                }`}
              >
                <span>{showHelpDetails ? "Hide Help Info" : "How to Help"}</span>
                <span className="text-xs leading-none">→</span>
              </button>

              <button
                onClick={() => onMarkAsMet(need.id)}
                className="text-[10px] tracking-widest uppercase font-bold text-stone hover:text-gold transition-colors duration-140"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Mark as Met
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
