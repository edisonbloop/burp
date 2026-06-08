"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildDeck, type BibleCharacter, type Difficulty } from "@/lib/bible-characters";
import SiteNav from "@/components/SiteNav";

type Phase = "playing" | "wrong" | "correct" | "revealed" | "finished";

// ── Difficulty config ─────────────────────────────────────────────────────
const DIFF_CONFIG: Record<Difficulty, {
  label: string;
  color: string;       // badge bg + text
  ring: string;        // input ring color on correct
  inputBorder: string;
}> = {
  easy:   { label: "Easy",   color: "bg-[#e8f5e0] text-[#4a7a30] border border-[#b5d99a]", ring: "focus:border-[#5B7A4A] focus:ring-[#5B7A4A]", inputBorder: "border-stone-edge" },
  medium: { label: "Medium", color: "bg-gold-wash text-gold-deep border border-gold-soft",  ring: "focus:border-gold focus:ring-gold",            inputBorder: "border-stone-edge" },
  hard:   { label: "Hard",   color: "bg-red-50 text-red-700 border border-red-200",         ring: "focus:border-red-400 focus:ring-red-400",       inputBorder: "border-stone-edge" },
};

// ── Web Audio sound effects ────────────────────────────────────────────────
function playCorrect() {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
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

// ── Result icon ────────────────────────────────────────────────────────────
function ResultIcon({ phase }: { phase: Phase }) {
  if (phase !== "correct" && phase !== "wrong") return null;
  const ok = phase === "correct";
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div className={`animate-pop-in w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${ok ? "bg-[#5B7A4A]" : "bg-[#9C3A2A]"}`}>
        {ok ? (
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 24l10 10 18-20" />
          </svg>
        ) : (
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round">
            <path d="M14 14l20 20M34 14L14 34" />
          </svg>
        )}
      </div>
    </div>
  );
}

export default function GuessTheCharacterPage() {
  const [deck, setDeck] = useState<BibleCharacter[]>([]);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [phase, setPhase] = useState<Phase>("playing");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDeck(buildDeck()); }, []);

  const current = deck[index] ?? null;
  const total = deck.length;
  const progress = total ? Math.round((index / total) * 100) : 0;
  const diff = current?.difficulty ?? "easy";
  const diffCfg = DIFF_CONFIG[diff];

  // Reset hint when moving to new card
  useEffect(() => { setHintShown(false); }, [index]);

  const checkGuess = useCallback(() => {
    if (!current || phase !== "playing") return;
    const normalised = guess.trim().toLowerCase();
    if (!normalised) return;

    if (current.acceptedAnswers.includes(normalised)) {
      const newStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setPhase("correct");
      playCorrect();
    } else {
      setPhase("wrong");
      setShakeKey((k) => k + 1);
      playWrong();
      setTimeout(() => { setGuess(""); setPhase("playing"); inputRef.current?.focus(); }, 700);
    }
  }, [current, guess, phase, streak, bestStreak]);

  const reveal = () => { setStreak(0); setPhase("revealed"); };

  const next = () => {
    if (index + 1 >= total) { setPhase("finished"); return; }
    setIndex((i) => i + 1);
    setGuess("");
    setPhase("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const restart = () => {
    setDeck(buildDeck());
    setIndex(0); setGuess(""); setPhase("playing");
    setScore(0); setStreak(0);
  };

  useEffect(() => {
    if (phase !== "finished" || total === 0) return;
    const key = "burp_game_guess";
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
              { label: "Correct", value: score,           color: "text-[#5B7A4A]" },
              { label: "Missed",  value: total - score,   color: "text-[#9C3A2A]" },
              { label: "Score",   value: `${pct}%`,       color: "text-ink"       },
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

  const isAnswered = phase === "correct" || phase === "revealed";
  const isWrong    = phase === "wrong";
  const showAutoHint   = false; // hints are always opt-in
  const showHintButton = diff !== "hard" && current.hint && !hintShown && !isAnswered;

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

          {/* Difficulty badge */}
          <span
            className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${diffCfg.color}`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {diffCfg.label}
          </span>

          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-ink leading-none" style={{ fontFamily: "var(--font-display)" }}>{score}</p>
            <p className="text-[10px] uppercase tracking-widest text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>pts</p>
          </div>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-xl mx-auto w-full">

        {/* Emojis + result icon */}
        <div className="relative text-center mb-6 w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-light mb-6" style={{ fontFamily: "var(--font-accent)" }}>
            Who am I?
          </p>
          <div className={`flex items-center justify-center gap-3 sm:gap-5 flex-wrap transition-opacity duration-200 ${isWrong ? "opacity-30" : "opacity-100"}`}>
            {current.emojis.map((emoji, i) => (
              <span key={i} className="text-5xl sm:text-6xl select-none" role="img">{emoji}</span>
            ))}
          </div>
          <ResultIcon phase={phase} />
        </div>

        {/* Auto hint — easy only */}
        {showAutoHint && !isAnswered && (
          <p className="text-sm text-stone-mid italic text-center mb-6 max-w-xs leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
            💡 {current.hint}
          </p>
        )}

        {/* Hint button — medium only */}
        {showHintButton && (
          <button
            type="button"
            onClick={() => setHintShown(true)}
            className="mb-5 text-xs font-bold text-gold-deep hover:text-gold uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            💡 Need a hint?
          </button>
        )}
        {diff !== "hard" && hintShown && current.hint && !isAnswered && (
          <p className="text-sm text-stone-mid italic text-center mb-5 max-w-xs leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
            💡 {current.hint}
          </p>
        )}

        {/* No hint — hard */}
        {diff === "hard" && !isAnswered && (
          <p className="text-xs text-stone-light text-center mb-5 italic" style={{ fontFamily: "var(--font-display)" }}>
            No hints on hard — just the emojis.
          </p>
        )}

        {/* Answer card */}
        {isAnswered ? (
          <div className={`w-full rounded-3xl border-2 px-7 py-6 text-center mb-6 ${
            phase === "correct" ? "bg-[#f0f7eb] border-[#5B7A4A]/40" : "bg-parchment-soft border-stone-edge"
          }`}>
            {phase === "correct" && <p className="text-[#5B7A4A] text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-accent)" }}>✓ Correct!</p>}
            {phase === "revealed" && <p className="text-stone-light text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-accent)" }}>The answer was</p>}
            <h2 className="text-4xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>{current.name}</h2>
            <p className="text-base text-stone-mid italic leading-relaxed mb-3" style={{ fontFamily: "var(--font-display)" }}>{current.clue}</p>
            <p className="text-xs font-bold text-gold-deep uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>📖 {current.passage}</p>
          </div>
        ) : (
          <div className="w-full mb-6">
            <div key={shakeKey} className={`flex gap-2 ${isWrong ? "animate-shake" : ""}`}>
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") checkGuess(); }}
                placeholder="Type the character's name…"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck={false}
                disabled={isWrong}
                className={`flex-1 px-5 py-3.5 rounded-2xl border-2 text-ink placeholder:text-stone-light text-base focus:outline-none transition-all ${
                  isWrong
                    ? "border-[#9C3A2A] bg-[#fdf3f2] text-[#9C3A2A]"
                    : `${diffCfg.inputBorder} bg-white ${diffCfg.ring} focus:ring-1`
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              />
              <button
                onClick={checkGuess}
                disabled={!guess.trim() || isWrong}
                className="px-6 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors disabled:opacity-30 flex-shrink-0"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Guess
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          {!isAnswered && !isWrong && (
            <button
              onClick={reveal}
              className="flex-1 px-5 py-3 rounded-2xl border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold-soft hover:text-ink transition-colors"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Reveal
            </button>
          )}
          {isAnswered && (
            <button
              onClick={next}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {index + 1 >= total ? "See Results →" : "Next →"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
