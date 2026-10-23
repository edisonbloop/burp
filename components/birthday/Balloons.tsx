"use client";

import { useState } from "react";

/**
 * Balloons drifting up through the hero. Tap one to pop it — it comes back a
 * few seconds later so there's always something to pop.
 */
export default function Balloons({
  colors,
  count = 7,
  onPop,
}: {
  colors: string[];
  count?: number;
  onPop: (x: number, y: number) => void;
}) {
  const [popped, setPopped] = useState<Record<number, number>>({});

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const color = colors[i % colors.length];
        const gen = popped[i] ?? 0;
        if (gen < 0) return null;
        const left = 4 + ((i * 53) % 88);
        const duration = 14 + ((i * 5) % 9);
        const size = 58 + ((i * 17) % 34);
        return (
          <button
            key={`${i}-${gen}`}
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              onPop(r.left + r.width / 2, r.top + r.height * 0.35);
              setPopped((p) => ({ ...p, [i]: -1 }));
              setTimeout(() => setPopped((p) => ({ ...p, [i]: gen + 1 })), 4000);
            }}
            className="absolute bottom-[-180px] cursor-pointer animate-[bday-rise_linear_infinite] pointer-events-auto"
            style={{
              left: `${left}%`,
              width: size,
              animationDuration: `${duration}s`,
              animationDelay: gen ? "0s" : `${-((i * 2.9) % duration)}s`,
            }}
          >
            <svg viewBox="0 0 60 120" className="w-full drop-shadow-lg overflow-visible">
              <defs>
                <radialGradient id={`bshine-${i}`} cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
                  <stop offset="25%" stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="1" />
                </radialGradient>
              </defs>
              <path d="M30 2C14 2 3 15 3 31c0 18 15 32 25 36h4c10-4 25-18 25-36C57 15 46 2 30 2z" fill={`url(#bshine-${i})`} />
              <path d="M27 67l3 5 3-5z" fill={color} />
              <path d="M30 72c-4 10 4 16 0 26s4 14 0 22" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" fill="none" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
