"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PublicStone } from "@/types/stones";

interface StoneModalProps {
  stone: PublicStone | null;
  onClose: () => void;
}

function displayName(stone: PublicStone): string {
  if (stone.anonymous) return "Anonymous";
  return stone.display_name || stone.full_name;
}

export default function StoneModal({ stone, onClose }: StoneModalProps) {
  useEffect(() => {
    if (!stone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [stone, onClose]);

  return (
    <AnimatePresence>
      {stone && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(29, 16, 6, 0.65)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl pointer-events-auto"
              style={{
                background: stone.featured
                  ? "linear-gradient(160deg, #fffdf9 0%, #fdf5e8 100%)"
                  : "linear-gradient(160deg, #ffffff 0%, #fdf8f0 100%)",
                boxShadow: "0 32px 80px rgba(45,31,14,0.3), 0 8px 24px rgba(196,137,58,0.15)",
              }}
            >
              {/* Gold border for featured */}
              {stone.featured && (
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #d4a052, #f0d9b0, #c4893a, #e3be82) border-box",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "destination-out",
                    maskComposite: "exclude",
                    border: "1.5px solid transparent",
                  }}
                />
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-[#7a5a3a] hover:text-[#2d1f0e] hover:bg-[#f0d9b0] transition-colors z-10"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="p-8 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #f9edda, #f0d9b0)",
                      color: "#8a5420",
                    }}
                  >
                    {stone.journey_word}
                  </span>
                  {stone.featured && (
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-[#c4893a] flex items-center gap-1">
                      <span>✦</span> Featured Stone
                    </span>
                  )}
                </div>

                {/* Scripture */}
                {stone.scripture && (
                  <div
                    className="rounded-2xl p-5 relative"
                    style={{ background: "linear-gradient(135deg, #fdf8f0, #f9edda)" }}
                  >
                    <span
                      className="block leading-none mb-2 select-none"
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "3rem",
                        color: stone.featured ? "#d4a052" : "#e3be82",
                        lineHeight: 1,
                      }}
                    >
                      &ldquo;
                    </span>
                    <p
                      className="text-base leading-relaxed text-[#5a3e20]"
                      style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
                    >
                      {stone.scripture}
                    </p>
                  </div>
                )}

                {/* Remembrance — main content */}
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#c4b090] mb-3">
                    Stone of Remembrance
                  </p>
                  <p className="text-[#2d1f0e] leading-relaxed text-base">
                    {stone.remembrance}
                  </p>
                </div>

                {/* Testimony */}
                {stone.testimony && (
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#c4b090] mb-3">
                      Testimony
                    </p>
                    <p className="text-[#5a3e20] leading-relaxed text-sm italic">
                      {stone.testimony}
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #e3be82, transparent)",
                  }}
                />

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                    style={
                      stone.featured
                        ? {
                            background: "linear-gradient(135deg, #d4a052, #c4893a)",
                            color: "#fff",
                          }
                        : { background: "#f0d9b0", color: "#8a5420" }
                    }
                  >
                    {displayName(stone)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2d1f0e]">{displayName(stone)}</p>
                    <p className="text-sm text-[#c4b090]">
                      {new Date(stone.created_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
