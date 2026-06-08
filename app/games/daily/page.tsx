"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import {
  getDailyQuotes,
  getDailyOptions,
  getDailyKey,
  getToday,
  formatDailyDate,
  hoursUntilTomorrow,
  DAILY_TOTAL,
  type DailyResult,
} from "@/lib/daily-challenge";
import type { Difficulty } from "@/lib/bible-quotes";

type Phase = "loading" | "playing" | "answered" | "finished" | "already_done";

const DIFF_BADGE: Record<Difficulty, string> = {
  easy:   "bg-[#e8f5e0] text-[#4a7a30] border border-[#b5d99a]",
  medium: "bg-gold-wash text-gold-deep border border-gold-soft",
  hard:   "bg-red-50 text-red-700 border border-red-200",
};

function playCorrect() {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t); osc.stop(t + 0.4);
    });
  } catch { /* blocked */ }
}

function playWrong() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  } catch { /* blocked */ }
}

export default function DailyChallengePage() {
  const today  = useMemo(() => getToday(), []);
  const quotes = useMemo(() => getDailyQuotes(today), [today]);

  const [phase,  setPhase]  = useState<Phase>("loading");
  const [index,  setIndex]  = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score,  setScore]  = useState(0);
  const [prevResult, setPrevResult] = useState<DailyResult | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(getDailyKey(today));
    if (stored) {
      const result = JSON.parse(stored) as DailyResult;
      if (result.completed) {
        setPrevResult(result);
        setPhase("already_done");
        return;
      }
    }
    setPhase("playing");
  }, [today]);

  // Save to localStorage when finished
  useEffect(() => {
    if (phase !== "finished") return;
    const result: DailyResult = {
      completed: true,
      score,
      total: DAILY_TOTAL,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(getDailyKey(today), JSON.stringify(result));
  }, [phase, score, today]);

  const current = quotes[index] ?? null;
  const options = useMemo(
    () => (current ? getDailyOptions(current, index, today) : []),
    [current, index, today],
  );

  const handlePick = (option: string) => {
    if (phase !== "playing" || !current) return;
    setPicked(option);
    setPhase("answered");
    if (option === current.speaker) { setScore((s) => s + 1); playCorrect(); }
    else playWrong();
  };

  const next = () => {
    if (index + 1 >= DAILY_TOTAL) { setPhase("finished"); return; }
    setIndex((i) => i + 1);
    setPicked(null);
    setPhase("playing");
  };

  // ── Already completed today ───────────────────────────────────────────────
  if (phase === "already_done" && prevResult) {
    const pct   = Math.round((prevResult.score / prevResult.total) * 100);
    const medal = pct === 100 ? "🏆" : pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : "📖";
    const hours = hoursUntilTomorrow();
    return (
      <div className="min-h-screen flex flex-col bg-vellum">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-md mx-auto">
          <div className="bg-gold-wash border-2 border-gold-soft rounded-full px-5 py-2 mb-8 inline-flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-deep" style={{ fontFamily: "var(--font-accent)" }}>
              {formatDailyDate(today)}
            </span>
          </div>

          <span className="text-7xl mb-4 block">{medal}</span>
          <h1 className="text-4xl font-bold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Already done!
          </h1>
          <p className="text-stone-mid text-lg mb-6">
            You scored <span className="font-bold text-ink">{prevResult.score}/{prevResult.total}</span> on today&rsquo;s challenge.
          </p>

          <div className="w-full bg-parchment-soft border border-stone-edge rounded-2xl p-5 mb-8">
            <p className="text-xs text-stone-light uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-accent)" }}>
              Next challenge in
            </p>
            <p className="text-5xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
              {hours}h
            </p>
            <p className="text-xs text-stone-light mt-1">A new challenge drops at midnight</p>
          </div>

          <Link
            href="/games"
            className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Play Other Games
          </Link>
        </div>
      </div>
    );
  }

  // ── Finished (just completed) ─────────────────────────────────────────────
  if (phase === "finished") {
    const pct   = Math.round((score / DAILY_TOTAL) * 100);
    const medal = pct === 100 ? "🏆" : pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : "📖";
    const hours = hoursUntilTomorrow();
    return (
      <div className="min-h-screen flex flex-col bg-vellum">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-md mx-auto">
          <div className="bg-gold-wash border-2 border-gold-soft rounded-full px-5 py-2 mb-8 inline-flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-deep" style={{ fontFamily: "var(--font-accent)" }}>
              {formatDailyDate(today)}
            </span>
          </div>

          <span className="text-7xl mb-4 block">{medal}</span>
          <h1 className="text-4xl font-bold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Challenge Complete!
          </h1>
          <p className="text-stone-mid text-lg mb-8">
            You got <span className="font-bold text-ink">{score} out of {DAILY_TOTAL}</span> correct
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 w-full">
            {[
              { label: "Correct", value: score,             color: "text-[#5B7A4A]" },
              { label: "Missed",  value: DAILY_TOTAL - score, color: "text-[#9C3A2A]" },
              { label: "Score",   value: `${pct}%`,          color: "text-ink"       },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-parchment-soft border border-stone-edge rounded-2xl p-4">
                <p className={`text-2xl font-bold ${color}`} style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-stone-light mt-1" style={{ fontFamily: "var(--font-accent)" }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="w-full bg-parchment-soft border border-stone-edge rounded-2xl p-5 mb-8">
            <p className="text-xs text-stone-light uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-accent)" }}>
              Next challenge in
            </p>
            <p className="text-4xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>{hours}h</p>
          </div>

          <Link
            href="/games"
            className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Play Other Games
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === "loading" || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vellum">
        <p className="text-stone-light text-sm animate-pulse">Loading today&rsquo;s challenge…</p>
      </div>
    );
  }

  const diff = current.difficulty;
  const progress = Math.round((index / DAILY_TOTAL) * 100);
  const isCorrect   = (opt: string) => phase === "answered" && opt === current.speaker;
  const isWrongPick = (opt: string) => phase === "answered" && opt === picked && opt !== current.speaker;

  // ── Playing ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />

      {/* Progress bar */}
      <div className="border-b border-stone-edge bg-parchment-soft">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/games" className="text-stone-mid hover:text-ink transition-colors flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-stone-light mb-1">
              <span style={{ fontFamily: "var(--font-accent)" }}>
                Question {index + 1} of {DAILY_TOTAL}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-deep" style={{ fontFamily: "var(--font-accent)" }}>
                Daily Challenge
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-parchment-deep overflow-hidden">
              <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span
            className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${DIFF_BADGE[diff]}`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {diff}
          </span>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-ink leading-none" style={{ fontFamily: "var(--font-display)" }}>{score}</p>
            <p className="text-[10px] uppercase tracking-widest text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>pts</p>
          </div>
        </div>
      </div>

      {/* Game */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-xl mx-auto w-full">

        {/* Date badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm">📅</span>
          <span className="text-xs font-bold text-stone-light uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
            {formatDailyDate(today)}
          </span>
        </div>

        {/* Quote card */}
        <div className="w-full bg-parchment-soft border-2 border-gold-soft rounded-3xl px-7 py-8 mb-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-light mb-5" style={{ fontFamily: "var(--font-accent)" }}>
            Who said this?
          </p>
          <p className="text-xl sm:text-2xl text-ink leading-relaxed italic" style={{ fontFamily: "var(--font-display)" }}>
            &ldquo;{current.quote}&rdquo;
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
          {options.map((opt) => {
            const correct   = isCorrect(opt);
            const wrongPick = isWrongPick(opt);
            const neutral   = phase === "answered" && !correct && !wrongPick;
            return (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={phase === "answered"}
                className={`w-full px-5 py-4 rounded-2xl text-base font-semibold text-left transition-all border-2 ${
                  correct
                    ? "bg-[#f0f7eb] border-[#5B7A4A] text-[#3a5a2a]"
                    : wrongPick
                    ? "bg-red-50 border-red-400 text-red-700"
                    : neutral
                    ? "bg-vellum border-stone-edge text-stone-light opacity-60"
                    : "bg-white border-stone-edge text-ink hover:border-gold hover:bg-gold-wash hover:text-gold-deep cursor-pointer"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="flex items-center gap-3">
                  {correct   && <span className="text-[#5B7A4A] flex-shrink-0">✓</span>}
                  {wrongPick && <span className="text-red-500 flex-shrink-0">✗</span>}
                  {!correct && !wrongPick && phase === "answered" && <span className="w-4 flex-shrink-0" />}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result + reference */}
        {phase === "answered" && (
          <div className="w-full text-center mb-6">
            {picked === current.speaker ? (
              <p className="text-sm text-[#5B7A4A] font-semibold mb-1">✓ Correct!</p>
            ) : (
              <p className="text-sm text-[#9C3A2A] font-semibold mb-1">
                The answer was <strong>{current.speaker}</strong>
              </p>
            )}
            <p className="text-xs text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
              📖 {current.reference}
            </p>
          </div>
        )}

        {/* Next */}
        {phase === "answered" && (
          <button
            onClick={next}
            className="w-full px-5 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {index + 1 >= DAILY_TOTAL ? "See Results →" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
