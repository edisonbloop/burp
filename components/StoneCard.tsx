"use client";

import { motion } from "framer-motion";
import type { PublicStone } from "@/types/stones";

interface StoneCardProps {
  stone: PublicStone;
  index?: number;
  onClick?: () => void;
}

function displayName(stone: PublicStone): string {
  if (stone.anonymous) return "Anonymous";
  return stone.display_name || stone.full_name;
}

export default function StoneCard({ stone, index = 0, onClick }: StoneCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.6), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="break-inside-avoid mb-5 rounded-2xl p-5 flex flex-col gap-4 cursor-pointer select-none"
      style={{
        background: "linear-gradient(160deg, #ffffff 0%, #fdf8f0 100%)",
        boxShadow: "0 2px 12px rgba(196,137,58,0.08), 0 1px 3px rgba(196,137,58,0.06)",
      }}
      onHoverStart={(e) => {
        (e.target as HTMLElement).style.boxShadow =
          "0 12px 40px rgba(196,137,58,0.16), 0 4px 12px rgba(196,137,58,0.1)";
      }}
      onHoverEnd={(e) => {
        (e.target as HTMLElement).style.boxShadow =
          "0 2px 12px rgba(196,137,58,0.08), 0 1px 3px rgba(196,137,58,0.06)";
      }}
    >
      {/* Top row: journey word + featured */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #f9edda, #f0d9b0)",
            color: "#8a5420",
            letterSpacing: "0.1em",
          }}
        >
          {stone.journey_word}
        </span>
        {stone.featured && (
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#c4893a] flex items-center gap-1">
            <span style={{ fontSize: "10px" }}>✦</span> Featured
          </span>
        )}
      </div>

      {/* Scripture */}
      {stone.scripture && (
        <div className="relative pl-5">
          <span
            className="absolute left-0 top-[-6px] leading-none select-none"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "2.5rem",
              color: "#e3be82",
              lineHeight: 1,
            }}
          >
            &ldquo;
          </span>
          <p
            className="text-sm leading-relaxed text-[#6b4f30]"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >
            {stone.scripture}
          </p>
        </div>
      )}

      {/* Main remembrance */}
      <p className="text-[#2d1f0e] leading-relaxed text-[0.95rem]">
        {stone.remembrance}
      </p>

      {/* Optional testimony */}
      {stone.testimony && (
        <p className="text-sm text-[#7a5a3a] leading-relaxed italic border-l-2 border-[#e8d4b0] pl-3">
          {stone.testimony}
        </p>
      )}

      {/* Author line */}
      <div
        className="flex items-center gap-3 pt-3"
        style={{ borderTop: "1px solid #f0d9b0" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: "#f0d9b0", color: "#8a5420" }}
        >
          {displayName(stone)[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#4d2c11] truncate">
            {displayName(stone)}
          </p>
          <p className="text-xs text-[#c4b090]">
            {new Date(stone.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );

  if (stone.featured) {
    return (
      <div
        className="break-inside-avoid mb-5 rounded-[18px] p-px"
        style={{
          background:
            "linear-gradient(135deg, #d4a052 0%, #f0d9b0 40%, #c4893a 70%, #e3be82 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.6), ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={onClick}
          className="rounded-[17px] p-5 flex flex-col gap-4 cursor-pointer select-none h-full"
          style={{
            background: "linear-gradient(160deg, #fffdf9 0%, #fdf5e8 100%)",
            boxShadow: "0 4px 20px rgba(196,137,58,0.12), 0 1px 4px rgba(196,137,58,0.08)",
          }}
        >
          {/* Top row */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #f9edda, #f0d9b0)",
                color: "#8a5420",
              }}
            >
              {stone.journey_word}
            </span>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#c4893a] flex items-center gap-1">
              <span style={{ fontSize: "10px" }}>✦</span> Featured
            </span>
          </div>

          {/* Scripture */}
          {stone.scripture && (
            <div className="relative pl-5">
              <span
                className="absolute left-0 top-[-6px] leading-none select-none"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "2.5rem",
                  color: "#d4a052",
                  lineHeight: 1,
                }}
              >
                &ldquo;
              </span>
              <p
                className="text-sm leading-relaxed text-[#6b4f30]"
                style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
              >
                {stone.scripture}
              </p>
            </div>
          )}

          {/* Remembrance */}
          <p className="text-[#2d1f0e] leading-relaxed text-[0.95rem]">
            {stone.remembrance}
          </p>

          {stone.testimony && (
            <p className="text-sm text-[#7a5a3a] leading-relaxed italic border-l-2 border-[#d4a052]/40 pl-3">
              {stone.testimony}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid #e8d4b0" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #d4a052, #c4893a)",
                color: "#fff",
              }}
            >
              {displayName(stone)[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#4d2c11] truncate">
                {displayName(stone)}
              </p>
              <p className="text-xs text-[#c4b090]">
                {new Date(stone.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return card;
}
