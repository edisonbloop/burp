"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ThemeSpec } from "./themes";

const display = { fontFamily: "var(--font-display)" };
const accent = { fontFamily: "var(--font-accent)" };

/** One signed message, as a little taped-on note. */
export default function MessageNote({
  theme,
  index,
  author,
  message,
  photo,
  featured,
  onPhoto,
  onHeart,
}: {
  theme: ThemeSpec;
  index: number;
  author: string;
  message: string;
  photo?: string | null;
  featured?: boolean;
  onPhoto?: (url: string) => void;
  onHeart?: (x: number, y: number) => void;
}) {
  const [hearts, setHearts] = useState(0);
  const tilt = featured ? 0 : ((index * 47) % 7) - 3;
  const paper = theme.papers[index % theme.papers.length];
  const tape = theme.balloons[index % theme.balloons.length];

  return (
    <motion.figure
      initial={{ opacity: 0, y: 40, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.08 }}
      whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.25 } }}
      className={`relative break-inside-avoid mb-8 rounded-[3px] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] ${featured ? "p-8 sm:p-12" : "p-6 sm:p-7"}`}
      style={{
        backgroundColor: paper,
        color: theme.paperInk,
        backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgba(0,0,0,0.035) 31px 32px)",
      }}
    >
      {/* washi tape */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 w-24 h-6 opacity-80"
        style={{ background: tape, transform: `translateX(-50%) rotate(${tilt * -1.5}deg)`, maskImage: "linear-gradient(90deg, transparent 0 2px, #000 2px calc(100% - 2px), transparent)" }}
      />

      {photo && (
        <button
          type="button"
          onClick={() => onPhoto?.(photo)}
          className="block bg-white p-2 pb-6 shadow-md mb-5 mx-auto w-full max-w-[18rem] cursor-zoom-in"
          style={{ transform: `rotate(${-tilt * 1.2}deg)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={`Photo from ${author}`} loading="lazy" className="w-full aspect-square object-cover" />
        </button>
      )}

      <blockquote
        className={`whitespace-pre-line leading-relaxed ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}
        style={display}
      >
        {message}
      </blockquote>

      <figcaption className="mt-5 flex items-end justify-between gap-3">
        <button
          type="button"
          onClick={(e) => {
            setHearts((h) => h + 1);
            const r = e.currentTarget.getBoundingClientRect();
            onHeart?.(r.left + r.width / 2, r.top);
          }}
          aria-label="Send a heart"
          className="text-sm opacity-60 hover:opacity-100 hover:scale-125 transition-all"
        >
          {hearts ? "❤️" : "🤍"}
          {hearts > 1 && <span className="text-[10px] ml-1">{hearts}</span>}
        </button>
        <span className="text-right">
          <span className="block text-2xl italic leading-none" style={{ ...display, color: theme.dark ? theme.paperInk : theme.accent }}>
            — {author}
          </span>
          {featured && (
            <span className="block text-[9px] tracking-[0.25em] uppercase mt-2 opacity-60" style={accent}>Who started this card</span>
          )}
        </span>
      </figcaption>
    </motion.figure>
  );
}
