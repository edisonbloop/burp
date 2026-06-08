"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildTrueFalseDeck, type TrueFalseStatement } from "@/lib/bible-true-false";
import SiteNav from "@/components/SiteNav";

type Phase = "playing" | "correct" | "wrong" | "timeout" | "finished";

const DIFF_BADGE = {
  easy:   "bg-[#e8f5e0] text-[#4a7a30] border border-[#b5d99a]",
  medium: "bg-gold-wash text-gold-deep border border-gold-soft",
  hard:   "bg-red-50 text-red-700 border border-red-200",
};

const TIME_LIMIT = 12; // seconds per question

// ── Sounds ────────────────────────────────────────────────────────────────
function playCorrect() {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.11;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    });
  } catch { /* blocked */ }
}
function playWrong() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  } catch { /* blocked */ }
}

export default function TrueOrFalsePage() {
  const [deck, setDeck]         = useState<TrueFalseStatement[]>([]);
  const [index, setIndex]       = useState(0);
  const [phase, setPhase]       = useState<Phase>("playing");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore]       = useState(0);
  const [streak, setStreak]     = useState(0);
  const [bestStreak, setBest]   = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setDeck(buildTrueFalseDeck()); }, []);

  const current  = deck[index] ?? null;
  const total    = deck.length;
  const progress = total ? Math.round((index / total) * 100) : 0;
  const diff     = current?.difficulty ?? "easy";

  // ── Timer ────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setPhase((p) => {
            if (p === "playing") { playWrong(); return "timeout"; }
            return p;
          });
          setStreak(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    if (deck.length > 0) startTimer();
    return stopTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, deck.length]);

  // ── Answer ────────────────────────────────────────────────────────────────
  const answer = (pick: boolean) => {
    if (phase !== "playing" || !current) return;
    stopTimer();
    const correct = pick === current.answer;
    if (correct) {
      const ns = streak + 1;
      setScore((s) => s + 1);
      setStreak(ns);
      if (ns > bestStreak) setBest(ns);
      setPhase("correct");
      playCorrect();
    } else {
      setStreak(0);
      setPhase("wrong");
      playWrong();
    }
  };

  const next = useCallback(() => {
    if (index + 1 >= total) { setPhase("finished"); return; }
    setIndex((i) => i + 1);
    setPhase("playing");
  }, [index, total]);

  // Auto-advance after 2.2s when answered
  useEffect(() => {
    if (phase !== "correct" && phase !== "wrong" && phase !== "timeout") return;
    const t = setTimeout(next, 2200);
    return () => clearTimeout(t);
  }, [phase, next]);

  const restart = () => {
    setDeck(buildTrueFalseDeck());
    setIndex(0); setPhase("playing");
    setScore(0); setStreak(0);
  };

  useEffect(() => {
    if (phase !== "finished" || total === 0) return;
    const key = "burp_game_trueorfalse";
    const prev = JSON.parse(localStorage.getItem(key) ?? "{}");
    const pct = Math.round((score / total) * 100);
    localStorage.setItem(key, JSON.stringify({
      bestPct: Math.max(pct, prev.bestPct ?? 0),
      bestStreak: Math.max(bestStreak, prev.bestStreak ?? 0),
      gamesPlayed: (prev.gamesPlayed ?? 0) + 1,
      lastPlayed: new Date().toISOString(),
    }));
  }, [phase, score, total, bestStreak]);

  // ── Finished ─────────────────────────────────────────────────────────────
  if (phase === "finished") {
    const pct = Math.round((score / total) * 100);
    const medal = pct === 100 ? "🏆" : pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : pct >= 40 ? "🥉" : "📖";
    return (
      <div className="min-h-screen flex flex-col bg-vellum">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="text-7xl mb-6 block">{medal}</span>
          <h1 className="text-5xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>Well played!</h1>
          <p className="text-stone-mid text-lg mb-8">
            You got <span className="font-bold text-ink">{score} out of {total}</span> correct
            {bestStreak > 2 && <> · best streak <span className="font-bold text-gold-deep">{bestStreak} 🔥</span></>}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-xs">
            {[
              { label: "Correct", value: score,          color: "text-[#5B7A4A]" },
              { label: "Missed",  value: total - score,   color: "text-[#9C3A2A]" },
              { label: "Score",   value: `${pct}%`,       color: "text-ink" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-parchment-soft border border-stone-edge rounded-2xl p-4">
                <p className={`text-2xl font-bold ${color}`} style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-stone-light mt-1" style={{ fontFamily: "var(--font-accent)" }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={restart} className="px-8 py-3 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors" style={{ fontFamily: "var(--font-accent)" }}>
              Play Again
            </button>
            <Link href="/games" className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors text-center" style={{ fontFamily: "var(--font-accent)" }}>
              All Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return <div className="min-h-screen flex items-center justify-center bg-vellum"><p className="text-stone-light text-sm animate-pulse">Loading…</p></div>;
  }

  const answered  = phase !== "playing";
  const wasCorrect = phase === "correct";
  const timerPct  = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timerPct > 50 ? "bg-[#5B7A4A]" : timerPct > 25 ? "bg-gold" : "bg-[#9C3A2A]";

  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />

      {/* Header */}
      <div className="border-b border-stone-edge bg-parchment-soft">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/games" className="text-stone-mid hover:text-ink transition-colors flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4l-6 6 6 6" /></svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>{index + 1} / {total}</span>
              {streak >= 2 && <span className="text-gold-deep font-bold">🔥 {streak} streak</span>}
            </div>
            {/* Progress */}
            <div className="h-1.5 rounded-full bg-parchment-deep overflow-hidden">
              <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${DIFF_BADGE[diff]}`} style={{ fontFamily: "var(--font-accent)" }}>
            {diff}
          </span>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-ink leading-none" style={{ fontFamily: "var(--font-display)" }}>{score}</p>
            <p className="text-[10px] uppercase tracking-widest text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>pts</p>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-parchment-deep w-full">
        <div
          className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
          style={{ width: answered ? "0%" : `${timerPct}%` }}
        />
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-xl mx-auto w-full">

        {/* Statement card */}
        <div
          className={`w-full rounded-3xl border-2 px-7 py-8 mb-8 text-center transition-all duration-300 ${
            answered
              ? wasCorrect
                ? "bg-[#f0f7eb] border-[#5B7A4A]"
                : phase === "timeout"
                ? "bg-amber-50 border-amber-300"
                : "bg-red-50 border-red-300"
              : "bg-parchment-soft border-stone-edge"
          }`}
        >
          {/* Timer countdown (visible while playing) */}
          {!answered && (
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <span className={`text-xs font-bold tabular-nums ${timeLeft <= 3 ? "text-[#9C3A2A] animate-pulse" : "text-stone-light"}`} style={{ fontFamily: "var(--font-accent)" }}>
                ⏱ {timeLeft}s
              </span>
            </div>
          )}

          {/* Result icon */}
          {answered && (
            <div className="mb-4">
              {wasCorrect   && <span className="text-4xl block">✅</span>}
              {phase === "wrong"   && <span className="text-4xl block">❌</span>}
              {phase === "timeout" && <span className="text-4xl block">⏰</span>}
            </div>
          )}

          <p
            className="text-xl sm:text-2xl text-ink leading-relaxed font-medium"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {current.statement}
          </p>

          {/* Answer reveal */}
          {answered && (
            <div className="mt-5 pt-4 border-t border-stone-edge/40">
              <p className={`text-sm font-bold mb-1 ${wasCorrect ? "text-[#5B7A4A]" : "text-[#9C3A2A]"}`}>
                {wasCorrect
                  ? "Correct!"
                  : phase === "timeout"
                  ? `Time's up — the answer was ${current.answer ? "TRUE" : "FALSE"}`
                  : `The answer was ${current.answer ? "TRUE" : "FALSE"}`}
              </p>
              <p className="text-sm text-stone-mid leading-relaxed italic" style={{ fontFamily: "var(--font-display)" }}>
                {current.explanation}
              </p>
            </div>
          )}
        </div>

        {/* True / False buttons */}
        {!answered ? (
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={() => answer(true)}
              className="py-6 rounded-3xl border-2 border-[#5B7A4A] bg-[#f0f7eb] text-[#3a5a2a] text-xl font-bold hover:bg-[#5B7A4A] hover:text-white transition-all active:scale-95"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              ✓ TRUE
            </button>
            <button
              onClick={() => answer(false)}
              className="py-6 rounded-3xl border-2 border-[#9C3A2A] bg-red-50 text-[#7a2a1a] text-xl font-bold hover:bg-[#9C3A2A] hover:text-white transition-all active:scale-95"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              ✗ FALSE
            </button>
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-xs text-stone-light italic" style={{ fontFamily: "var(--font-display)" }}>
              Next question loading…
            </p>
            <button
              onClick={next}
              className="mt-3 text-xs font-bold text-gold hover:text-gold-deep uppercase tracking-widest transition-colors"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Skip wait →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
