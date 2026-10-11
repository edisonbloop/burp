"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { getBurpItQuiz, type QuizMode, type QuizQuestion } from "@/lib/burpit-quiz-actions";

type Phase = "menu" | "loading" | "playing" | "answered" | "finished";

const MODES: { id: QuizMode; emoji: string; title: string; desc: string; count: string }[] = [
  { id: "today", emoji: "🌅", title: "Today's Reading", desc: "Verses from today's passages only.", count: "5 questions" },
  { id: "recent", emoji: "📖", title: "This Fortnight", desc: "Everything you've read in the last 14 days.", count: "10 questions" },
  { id: "journey", emoji: "🗺️", title: "The Whole Journey", desc: "Anywhere from Day 1 to today.", count: "10 questions" },
];

function tone(ok: boolean) {
  try {
    const ctx = new AudioContext();
    (ok ? [523.25, 659.25, 783.99] : [220, 165]).forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = ok ? "sine" : "triangle";
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.start(t);
      o.stop(t + 0.4);
    });
  } catch {
    /* audio blocked */
  }
}

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

/** Highlight the blanked/answer word inside the revealed verse. */
function RevealedVerse({ q }: { q: QuizQuestion }) {
  if (q.type !== "fill") return <>{q.fullVerse}</>;
  const i = q.fullVerse.toLowerCase().indexOf(q.answer.toLowerCase());
  if (i < 0) return <>{q.fullVerse}</>;
  return (
    <>
      {q.fullVerse.slice(0, i)}
      <mark className="bg-gold-wash text-gold-deep font-bold not-italic rounded px-1">{q.fullVerse.slice(i, i + q.answer.length)}</mark>
      {q.fullVerse.slice(i + q.answer.length)}
    </>
  );
}

export default function BurpItQuizPage() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [mode, setMode] = useState<QuizMode>("recent");
  const [qs, setQs] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [missed, setMissed] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function start(m: QuizMode) {
    setMode(m);
    setError("");
    setPhase("loading");
    startTransition(async () => {
      const res = await getBurpItQuiz(m);
      if (!res.questions.length) {
        setError(res.error ?? "Couldn't build a quiz right now.");
        setPhase("menu");
        return;
      }
      setQs(res.questions);
      setIndex(0);
      setPicked(null);
      setScore(0);
      setStreak(0);
      setBest(0);
      setMissed([]);
      setPhase("playing");
    });
  }

  const q = qs[index];
  const total = qs.length;

  function choose(opt: string) {
    if (phase !== "playing" || !q) return;
    setPicked(opt);
    setPhase("answered");
    if (opt === q.answer) {
      const s = streak + 1;
      setScore((x) => x + 1);
      setStreak(s);
      setBest((b) => Math.max(b, s));
      tone(true);
    } else {
      setStreak(0);
      setMissed((m) => [...m, q]);
      tone(false);
    }
  }

  function next() {
    if (index + 1 >= total) return setPhase("finished");
    setIndex((i) => i + 1);
    setPicked(null);
    setPhase("playing");
  }

  useEffect(() => {
    if (phase !== "finished" || !total) return;
    try {
      const key = "burp_game_burpitquiz";
      const prev = JSON.parse(localStorage.getItem(key) ?? "{}");
      localStorage.setItem(
        key,
        JSON.stringify({
          bestPct: Math.max(Math.round((score / total) * 100), prev.bestPct ?? 0),
          bestStreak: Math.max(best, prev.bestStreak ?? 0),
          gamesPlayed: (prev.gamesPlayed ?? 0) + 1,
        })
      );
    } catch {
      /* storage blocked */
    }
  }, [phase, score, total, best]);

  // Keyboard: 1-4 to answer, Enter for next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "playing" && q && /^[1-4]$/.test(e.key)) choose(q.options[Number(e.key) - 1]);
      else if (phase === "answered" && e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── Menu ───────────────────────────────────────────────────
  if (phase === "menu" || phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-vellum">
        <SiteNav />
        <section className="relative overflow-hidden bg-ink text-vellum">
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(55% 90% at 85% 0%, rgba(184,146,74,0.28), transparent 70%)" }} />
          <div className="relative max-w-3xl mx-auto px-6 py-14 sm:py-20 text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-soft mb-4" style={accent}>Bible Games · Burp It</p>
            <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05] mb-4" style={display}>
              Burp It <span className="italic text-gold-soft">Quiz</span>
            </h1>
            <p className="text-sm sm:text-base text-[#d4c4ae] max-w-md mx-auto leading-relaxed">
              Questions drawn straight from the verses in your daily readings. Fill in the missing word, or name the book — then jump into that day&rsquo;s discussion.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto w-full px-6 py-10">
          {error && <p className="mb-6 text-sm text-center text-danger-earthen bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-3">
            {MODES.map((m) => {
              const loading = phase === "loading" && mode === m.id;
              return (
                <button
                  key={m.id}
                  disabled={phase === "loading"}
                  onClick={() => start(m.id)}
                  className="group text-left bg-parchment-soft border-2 border-stone-edge rounded-3xl p-6 hover:border-gold hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <div className="text-5xl mb-3">{loading ? <span className="inline-block animate-pulse">📜</span> : m.emoji}</div>
                  <h2 className="text-xl font-bold text-ink mb-1" style={display}>{m.title}</h2>
                  <p className="text-xs text-stone-mid leading-relaxed mb-4">{m.desc}</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold-deep" style={accent}>
                    {loading ? "Preparing verses…" : `${m.count} →`}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-[11px] text-stone-light mt-8">Verses from the World English Bible · Tip: press 1–4 to answer</p>
        </div>
      </div>
    );
  }

  // ── Finished ───────────────────────────────────────────────
  if (phase === "finished") {
    const pct = Math.round((score / total) * 100);
    const medal = pct === 100 ? "🏆" : pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : pct >= 40 ? "🥉" : "📖";
    const msg = pct === 100 ? "Flawless — you've been feasting!" : pct >= 70 ? "Well read." : "Good start. The Word rewards a second look.";
    return (
      <div className="min-h-screen flex flex-col bg-vellum">
        <SiteNav />
        <div className="flex-1 max-w-xl w-full mx-auto px-6 py-14 text-center">
          <span className="text-7xl block mb-5">{medal}</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-2" style={display}>{msg}</h1>
          <p className="text-stone-mid mb-8">
            <span className="font-bold text-ink">{score} of {total}</span> correct
            {best > 2 && <> · best streak <span className="font-bold text-gold-deep">{best} 🔥</span></>}
          </p>

          {missed.length > 0 && (
            <div className="text-left bg-parchment-soft border border-stone-edge rounded-3xl p-5 mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-deep mb-3" style={accent}>Worth another read</p>
              <ul className="space-y-2">
                {missed.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={m.planId ? `/burp-it/${m.planId}` : "/burp-it"}
                      className="flex items-center justify-between gap-3 bg-white border border-stone-edge rounded-xl px-4 py-3 hover:border-gold transition-colors"
                    >
                      <span className="text-sm font-semibold text-ink">{m.reference}</span>
                      <span className="text-[10px] uppercase tracking-widest text-stone-light shrink-0" style={accent}>Day {m.dayNumber} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => start(mode)} className="px-8 py-3 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors" style={accent}>
              New Round
            </button>
            <button onClick={() => setPhase("menu")} className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors" style={accent}>
              Change Mode
            </button>
            <Link href="/games" className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors text-center" style={accent}>
              All Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing / answered ─────────────────────────────────────
  const correct = picked === q.answer;
  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />
      <div className="border-b border-stone-edge bg-parchment-soft">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => setPhase("menu")} aria-label="Quit quiz" className="text-stone-mid hover:text-ink transition-colors shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4l-6 6 6 6" /></svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-stone-light mb-1">
              <span style={accent}>{index + 1} / {total}</span>
              {streak >= 2 && <span className="text-gold-deep font-bold">🔥 {streak} streak</span>}
            </div>
            <div className="h-1.5 rounded-full bg-parchment-deep overflow-hidden">
              <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${(index / total) * 100}%` }} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-ink leading-none" style={display}>{score}</p>
            <p className="text-[10px] uppercase tracking-widest text-stone-light" style={accent}>pts</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-xl mx-auto w-full">
        <div className="w-full bg-parchment-soft border-2 border-stone-edge rounded-3xl px-7 py-8 mb-6 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-wash text-gold-deep border border-gold-soft" style={accent}>
              Day {q.dayNumber}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-light" style={accent}>
              {q.type === "fill" ? "Complete the verse" : "Which book is this from?"}
            </span>
          </div>
          <p className="text-xl sm:text-2xl text-ink leading-relaxed italic" style={display}>
            &ldquo;{phase === "answered" ? <RevealedVerse q={q} /> : q.verse}&rdquo;
          </p>
          {phase === "answered" && (
            <p className="mt-4 text-xs text-stone-mid" style={accent}>📖 {q.reference}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-5">
          {q.options.map((opt, i) => {
            const isAns = phase === "answered" && opt === q.answer;
            const isBad = phase === "answered" && opt === picked && opt !== q.answer;
            const dim = phase === "answered" && !isAns && !isBad;
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={phase === "answered"}
                className={`w-full px-5 py-4 rounded-2xl text-base font-semibold text-left transition-all border-2 flex items-center gap-3 ${
                  isAns
                    ? "bg-[#f0f7eb] border-[#5B7A4A] text-[#3a5a2a]"
                    : isBad
                    ? "bg-red-50 border-red-400 text-red-700"
                    : dim
                    ? "bg-vellum border-stone-edge text-stone-light opacity-60"
                    : "bg-white border-stone-edge text-ink hover:border-gold hover:bg-gold-wash hover:text-gold-deep cursor-pointer"
                }`}
                style={display}
              >
                <span className="w-6 h-6 shrink-0 rounded-full border border-current/30 text-[11px] flex items-center justify-center font-sans opacity-70">
                  {isAns ? "✓" : isBad ? "✗" : i + 1}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {phase === "answered" && (
          <div className="w-full space-y-3">
            <p className={`text-center text-sm font-semibold ${correct ? "text-[#5B7A4A]" : "text-[#9C3A2A]"}`}>
              {correct ? "✓ Correct!" : <>The answer was <strong>{q.answer}</strong></>}
            </p>
            <Link
              href={q.planId ? `/burp-it/${q.planId}` : "/burp-it"}
              target="_blank"
              className="block text-center text-[11px] font-bold uppercase tracking-widest text-gold-deep hover:text-ink transition-colors"
              style={accent}
            >
              Discuss Day {q.dayNumber} in Burp It ↗
            </Link>
            <button onClick={next} className="w-full px-5 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors" style={accent}>
              {index + 1 >= total ? "See Results →" : "Next Verse →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
