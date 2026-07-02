"use client";

import { useEffect, useState } from "react";

function getTimeLeft(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now();
  const clamped = Math.max(0, diff);
  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
    done: diff <= 0,
  };
}

export default function WorshipCountdown({ targetIso }: { targetIso: string }) {
  // Start null so the server-rendered markup and first client render match;
  // the real countdown fills in after mount (avoids a hydration mismatch on tick).
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetIso));
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const units = [
    { label: "Days", value: timeLeft?.days },
    { label: "Hours", value: timeLeft?.hours },
    { label: "Minutes", value: timeLeft?.minutes },
    { label: "Seconds", value: timeLeft?.seconds },
  ];

  if (timeLeft?.done) {
    return (
      <p
        className="text-xl sm:text-2xl text-gold font-bold tracking-wide"
        style={{ fontFamily: "var(--font-display)" }}
      >
        We&rsquo;re live tonight.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -inset-3 bg-gold/10 blur-2xl rounded-full pointer-events-none" />
              <span
                className="relative block text-3xl sm:text-5xl md:text-6xl font-bold text-gold tabular-nums leading-none drop-shadow-[0_2px_10px_rgba(184,146,74,0.25)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value === undefined ? "--" : String(value).padStart(2, "0")}
              </span>
            </div>
            <span
              className="mt-2 text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-[#a89885]"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl sm:text-3xl text-gold/20 -mt-4 select-none">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
