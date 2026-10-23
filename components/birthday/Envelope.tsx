"use client";

import { motion } from "framer-motion";
import type { ThemeSpec } from "./themes";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

/**
 * The sealed envelope. `opening` runs the sequence: flap swings open, the
 * letter slides out, then `onOpened` fires so the card can take over.
 */
export default function Envelope({
  theme,
  name,
  from,
  opening,
  onOpen,
  onOpened,
}: {
  theme: ThemeSpec;
  name: string;
  from: number;
  opening: boolean;
  onOpen: () => void;
  onOpened: () => void;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "♥";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: theme.bg, color: theme.ink }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <Sparkles color={theme.accent} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 relative"
      >
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase mb-3" style={{ ...accent, color: theme.accent }}>
          Something special for
        </p>
        <h1 className="text-5xl sm:text-7xl font-semibold italic leading-none" style={display}>{name}</h1>
      </motion.div>

      <motion.button
        type="button"
        onClick={onOpen}
        disabled={opening}
        aria-label={`Open ${name}'s birthday card`}
        className="relative w-[min(84vw,440px)] aspect-[3/2] cursor-pointer focus:outline-none"
        style={{ perspective: 1400 }}
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={opening ? { opacity: 1, y: 60, rotate: 0, scale: 1.04 } : { opacity: 1, y: [0, -8, 0], rotate: [-2, 1, -2] }}
        transition={opening ? { duration: 0.6 } : { duration: 5, repeat: Infinity, ease: "easeInOut", opacity: { duration: 0.8 } }}
        whileHover={opening ? undefined : { scale: 1.03 }}
        whileTap={opening ? undefined : { scale: 0.98 }}
      >
        {/* back of envelope */}
        <div className="absolute inset-0 rounded-md shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]" style={{ background: theme.envelopeFlap }} />

        {/* the letter */}
        <motion.div
          className="absolute left-[6%] right-[6%] bottom-[5%] h-[90%] rounded-sm flex flex-col items-center justify-center text-center shadow-md"
          style={{ background: theme.papers[0], color: theme.paperInk, zIndex: 2 }}
          initial={false}
          animate={opening ? { y: "-62%" } : { y: 0 }}
          transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => opening && setTimeout(onOpened, 350)}
        >
          <p className="text-[8px] sm:text-[10px] tracking-[0.3em] uppercase mb-1" style={{ ...accent, color: theme.accent }}>Happy</p>
          <p className="text-3xl sm:text-4xl italic" style={display}>Birthday</p>
        </motion.div>

        {/* front pocket */}
        <div
          className="absolute inset-0 rounded-md"
          style={{ background: theme.envelope, clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)", zIndex: 3 }}
        >
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase opacity-60" style={{ ...accent, color: theme.dark ? theme.ink : theme.paperInk }}>
              With love from {from} {from === 1 ? "friend" : "friends"}
            </p>
          </div>
        </div>

        {/* flap */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[56%] origin-top"
          style={{ transformStyle: "preserve-3d", zIndex: opening ? 1 : 4 }}
          initial={false}
          animate={{ rotateX: opening ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: theme.envelopeFlap, clipPath: "polygon(0 0, 100% 0, 50% 100%)", backfaceVisibility: "hidden", filter: "brightness(0.97)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: theme.envelope, clipPath: "polygon(0 0, 100% 0, 50% 100%)", transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
          />
          {/* wax seal */}
          <div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center animate-[bday-seal-pulse_2.4s_ease-in-out_infinite]"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${theme.accentSoft}, ${theme.accent} 55%, ${theme.accent} 100%)`,
              boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.25)",
              backfaceVisibility: "hidden",
              opacity: opening ? 0 : 1,
              transition: "opacity .2s",
            }}
          >
            <span className="text-2xl sm:text-3xl font-bold text-white/90 drop-shadow" style={display}>{initial}</span>
          </div>
        </motion.div>
      </motion.button>

      <motion.p
        className="mt-12 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase"
        style={{ ...accent, color: theme.muted }}
        animate={{ opacity: opening ? 0 : [0.45, 1, 0.45] }}
        transition={opening ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity }}
      >
        Tap to open · sound on 🔊
      </motion.p>
    </motion.div>
  );
}

/** Deterministic twinkles (no hydration mismatch). */
export function Sparkles({ color, count = 28 }: { color: string; count?: number }) {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const x = (i * 61) % 100;
        const y = (i * 37 + 11) % 100;
        const s = 3 + ((i * 7) % 5);
        return (
          <span
            key={i}
            className="absolute rounded-full animate-[bday-twinkle_3s_ease-in-out_infinite]"
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, background: color, animationDelay: `${(i % 9) * -0.37}s`, boxShadow: `0 0 ${s * 2}px ${color}` }}
          />
        );
      })}
    </div>
  );
}
