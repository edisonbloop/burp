"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ThemeSpec } from "./themes";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

/**
 * "Make a wish": tap to blow the candles out, or blow into the microphone.
 * The mic is only requested when they press that button, and is released as
 * soon as the candles are out.
 */
export default function Cake({
  theme,
  age,
  onBlownOut,
}: {
  theme: ThemeSpec;
  age: number | null;
  onBlownOut: () => void;
}) {
  const [out, setOut] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");
  const stopMic = useRef<(() => void) | null>(null);
  const candles = 5;

  useEffect(() => () => stopMic.current?.(), []);

  function blow() {
    if (out) return;
    stopMic.current?.();
    setListening(false);
    setOut(true);
    onBlownOut();
  }

  async function listen() {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new AudioContext();
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      ac.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let loud = 0;
      let raf = 0;
      stopMic.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ac.close().catch(() => {});
        stopMic.current = null;
      };
      setListening(true);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        // Blowing is loud, broadband noise concentrated in the low bins.
        let sum = 0;
        for (let i = 0; i < 40; i++) sum += data[i];
        loud = sum / 40 > 150 ? loud + 1 : Math.max(0, loud - 1);
        if (loud > 6) blow();
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      setMicError("No microphone access — tap the cake instead.");
    }
  }

  const tierA = theme.accentSoft;
  const tierB = theme.papers[1];

  return (
    <div className="flex flex-col items-center">
      <button type="button" onClick={blow} aria-label="Blow out the candles" className="relative w-[min(78vw,340px)] focus:outline-none" disabled={out}>
        {/* candles + flames */}
        <div className="absolute left-[18%] right-[18%] top-0 h-[34%] flex justify-between items-end px-2 z-10">
          {Array.from({ length: candles }).map((_, i) => (
            <div key={i} className="relative w-3 sm:w-3.5" style={{ height: `${70 + ((i * 13) % 20)}%` }}>
              <div
                className="absolute inset-0 rounded-sm"
                style={{ background: `repeating-linear-gradient(135deg, #fff 0 5px, ${theme.balloons[i % theme.balloons.length]} 5px 10px)` }}
              />
              <div className="absolute left-1/2 -top-1.5 w-px h-2 bg-stone-700 -translate-x-1/2" />
              {!out ? (
                <div
                  className="absolute left-1/2 -top-8 w-4 h-7 origin-bottom animate-[bday-flicker_0.6s_ease-in-out_infinite]"
                  style={{
                    animationDelay: `${i * -0.13}s`,
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    background: "radial-gradient(circle at 50% 75%, #fff 0 18%, #FFE27A 35%, #FF9F2E 65%, rgba(255,120,30,0) 72%)",
                    filter: "drop-shadow(0 0 10px rgba(255,190,80,0.9))",
                  }}
                />
              ) : (
                <div
                  className="absolute left-1/2 -top-6 w-5 h-5 rounded-full bg-stone-400/60 blur-[3px] animate-[bday-smoke_1.6s_ease-out_forwards]"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              )}
            </div>
          ))}
        </div>

        <svg viewBox="0 0 340 260" className="w-full block mt-8">
          {/* plate */}
          <ellipse cx="170" cy="240" rx="160" ry="16" fill={theme.dark ? "#ffffff22" : "#00000014"} />
          <ellipse cx="170" cy="234" rx="150" ry="14" fill="#fff" />
          {/* bottom tier */}
          <rect x="35" y="140" width="270" height="92" rx="14" fill={tierB} />
          <path d="M35 150 q0-10 14-10 h242 q14 0 14 10 v14 q-12 12-24 0 t-27 0 t-27 0 t-27 0 t-27 0 t-27 0 t-27 0 t-27 0 t-27 0 t-24 0z" fill={tierA} />
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx={55 + i * 29} cy={200} r="4" fill={theme.balloons[i % theme.balloons.length]} />
          ))}
          {/* top tier */}
          <rect x="75" y="62" width="190" height="82" rx="12" fill={tierA} />
          <path d="M75 72 q0-10 12-10 h166 q12 0 12 10 v10 q-10 12-21 0 t-21 0 t-21 0 t-21 0 t-21 0 t-21 0 t-21 0 t-21 0 t-20 0z" fill="#fff" fillOpacity="0.9" />
          {age ? (
            <text x="170" y="122" textAnchor="middle" fontSize="34" fontStyle="italic" fontWeight="600" fill={theme.paperInk} style={display}>
              {age}
            </text>
          ) : (
            <text x="170" y="120" textAnchor="middle" fontSize="26" fill={theme.paperInk}>♥</text>
          )}
        </svg>
      </button>

      <div className="mt-8 min-h-24 text-center">
        {out ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-3xl sm:text-4xl italic" style={{ ...display, color: theme.ink }}>Your wish is on its way ✨</p>
            <p className="text-xs mt-2" style={{ color: theme.muted }}>We&rsquo;re praying it comes with every good gift from above.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={blow}
              className="px-7 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg hover:-translate-y-0.5 transition-transform"
              style={{ ...accent, background: theme.accent, color: theme.dark ? "#141B36" : "#fff" }}
            >
              Make a wish &amp; blow
            </button>
            <button
              type="button"
              onClick={listen}
              disabled={listening}
              className="px-7 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border-2 transition-colors"
              style={{ ...accent, borderColor: theme.accent, color: theme.ink }}
            >
              {listening ? "Listening… blow! 🌬️" : "🎤 Blow for real"}
            </button>
          </div>
        )}
        {micError && <p className="text-xs mt-3" style={{ color: theme.muted }}>{micError}</p>}
      </div>
    </div>
  );
}
