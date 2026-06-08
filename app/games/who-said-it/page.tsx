"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildQuoteDeck, getWrongAnswers, type BibleQuote, type Difficulty } from "@/lib/bible-quotes";
import SiteNav from "@/components/SiteNav";

type Phase = "playing" | "answered" | "finished";

const DIFF_BADGE: Record<Difficulty, string> = {
  easy:   "bg-[#e8f5e0] text-[#4a7a30] border border-[#b5d99a]",
  medium: "bg-gold-wash text-gold-deep border border-gold-soft",
  hard:   "bg-red-50 text-red-700 border border-red-200",
};

// ── Sounds ────────────────────────────────────────────────────────────────
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

export default function WhoSaidItPage() {
  const [deck, setDeck]       = useState<BibleQuote[]>([]);
  const [index, setIndex]     = useState(0);
  const [phase, setPhase]     = useState<Phase>("playing");
  const [picked, setPicked]   = useState<string | null>(null);
  const [score, setScore]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [bestStreak, setBest] = useState(0);

  useEffect(() => { setDeck(buildQuoteDeck()); }, []);

  const current = deck[index] ?? null;

  // Generate options once per card — reshuffle when index changes
  const options = useMemo(() => {
    if (!current) return [];
    const wrong = getWrongAnswers(current.speaker);
    const all = [current.speaker, ...wrong];
    // Shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [current]);  // eslint-disable-line react-hooks/exhaustive-deps

  const total    = deck.length;
  const progress = total ? Math.round((index / total) * 100) : 0;
  const diff     = current?.difficulty ?? "easy";

  const handlePick = (option: string) => {
    if (phase !== "playing" || !current) return;
    setPicked(option);
    setPhase("answered");

    if (option === current.speaker) {
      const ns = streak + 1;
      setScore((s) => s + 1);
      setStreak(ns);
      if (ns > bestStreak) setBest(ns);
      playCorrect();
    } else {
      setStreak(0);
      playWrong();
    }
  };

  const next = () => {
    if (index + 1 >= total) { setPhase("finished"); return; }
    setIndex((i) => i + 1);
    setPicked(null);
    setPhase("playing");
  };

  const restart = () => {
    setDeck(buildQuoteDeck());
    setIndex(0); setPicked(null);
    setPhase("playing"); setScore(0); setStreak(0);
  };

  useEffect(() => {
    if (phase !== "finished" || total === 0) return;
    const key = "burp_game_whosaidit";
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
              { label: "Correct", value: score,         color: "text-[#5B7A4A]" },
              { label: "Missed",  value: total - score,  color: "text-[#9C3A2A]" },
              { label: "Score",   value: `${pct}%`,      color: "text-ink" },
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

  const isCorrect  = (opt: string) => phase === "answered" && opt === current.speaker;
  const isWrongPick = (opt: string) => phase === "answered" && opt === picked && opt !== current.speaker;

  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />

      {/* Progress bar */}
      <div className="border-b border-stone-edge bg-parchment-soft">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/games" className="text-stone-mid hover:text-ink transition-colors flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4l-6 6 6 6" /></svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-stone-light mb-1">
              <span style={{ fontFamily: "var(--font-accent)" }}>{index + 1} / {total}</span>
              {streak >= 2 && <span className="text-gold-deep font-bold">🔥 {streak} streak</span>}
            </div>
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

      {/* Game */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-xl mx-auto w-full">

        {/* Quote card */}
        <div className="w-full bg-parchment-soft border-2 border-stone-edge rounded-3xl px-7 py-8 mb-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-light mb-5" style={{ fontFamily: "var(--font-accent)" }}>
            Who said this?
          </p>
          <p
            className="text-xl sm:text-2xl text-ink leading-relaxed italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            &ldquo;{current.quote}&rdquo;
          </p>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
          {options.map((opt) => {
            const correct  = isCorrect(opt);
            const wrongPick = isWrongPick(opt);
            const neutral  = phase === "answered" && !correct && !wrongPick;

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

        {/* Next button */}
        {phase === "answered" && (
          <button
            onClick={next}
            className="w-full px-5 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {index + 1 >= total ? "See Results →" : "Next Quote →"}
          </button>
        )}

      </div>
    </div>
  );
}
