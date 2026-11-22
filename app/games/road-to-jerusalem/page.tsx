"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import { ALL_QUESTIONS, QUIZ_PARTS, WRAP_UP_PROMPTS } from "@/lib/road-to-jerusalem";

type Phase = "intro" | "part" | "think" | "selfcheck" | "question" | "answered" | "finished";

const STORAGE_KEY = "burp_game_road_to_jerusalem";
const LETTERS = ["A", "B", "C", "D"];
const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

// -- Sounds ----------------------------------------------------------------
function tone(freqs: number[], type: OscillatorType, step: number, len: number, vol: number) {
  try {
    const ctx = new AudioContext();
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + i * step;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + len);
      osc.start(t);
      osc.stop(t + len);
    });
  } catch {
    /* audio blocked */
  }
}
const playCorrect = () => tone([523.25, 659.25, 783.99], "sine", 0.12, 0.4, 0.25);
const playWrong = () => tone([196, 164.81], "triangle", 0.14, 0.3, 0.2);
const playFanfare = () => tone([523.25, 659.25, 783.99, 1046.5], "sine", 0.15, 0.6, 0.22);

function shuffledIndexes(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));

/** recall = answered from memory (2 pts), choice = right with options shown (1 pt), miss = 0 */
type Outcome = "recall" | "choice" | "miss";
const POINTS: Record<Outcome, number> = { recall: 2, choice: 1, miss: 0 };
const SQUARE: Record<Outcome, string> = { recall: "🟩", choice: "🟨", miss: "🟥" };

export default function RoadToJerusalemPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [guess, setGuess] = useState("");
  const [viaChoices, setViaChoices] = useState(false);
  const [results, setResults] = useState<Outcome[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [takeaway, setTakeaway] = useState("");
  const [copied, setCopied] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  const total = ALL_QUESTIONS.length;
  const maxPoints = total * POINTS.recall;
  const current = ALL_QUESTIONS[index];
  const part = QUIZ_PARTS.find((p) => p.id === current.partId)!;
  const isMulti = current.answers.length > 1;
  const points = results.reduce((sum, o) => sum + (o ? POINTS[o] : 0), 0);
  const correctCount = results.filter((o) => o && o !== "miss").length;
  const recallCount = results.filter((o) => o === "recall").length;
  const lastOutcome = results[index];
  const answerText = current.answers.map((i) => current.options[i]).join(" + ");

  const openQuestion = useCallback((i: number) => {
    setIndex(i);
    setOrder(shuffledIndexes(ALL_QUESTIONS[i].options.length));
    setSelected([]);
    setGuess("");
    setViaChoices(false);
    setPhase("think");
  }, []);

  const start = () => {
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setIndex(0);
    setPhase("part");
  };

  const record = useCallback(
    (outcome: Outcome) => {
      setResults((r) => {
        const next = [...r];
        next[index] = outcome;
        return next;
      });
      if (outcome !== "miss") {
        const s = streak + 1;
        setStreak(s);
        setBestStreak((b) => Math.max(b, s));
        playCorrect();
      } else {
        setStreak(0);
        playWrong();
      }
      setPhase("answered");
    },
    [index, streak],
  );

  const showChoices = () => {
    if (phase !== "think") return;
    setViaChoices(true);
    setPhase("question");
  };
  const revealRecall = () => phase === "think" && setPhase("selfcheck");

  const submit = useCallback(
    (picks: number[]) => {
      if (phase !== "question" || picks.length === 0) return;
      setSelected(picks);
      record(sameSet(picks, current.answers) ? "choice" : "miss");
    },
    [phase, current, record],
  );

  const pick = useCallback(
    (optIdx: number) => {
      if (phase !== "question") return;
      if (isMulti) {
        setSelected((s) => (s.includes(optIdx) ? s.filter((x) => x !== optIdx) : [...s, optIdx]));
      } else {
        submit([optIdx]);
      }
    },
    [phase, isMulti, submit],
  );

  const next = useCallback(() => {
    if (index + 1 >= total) {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
        const prevBest = typeof saved.bestPoints === "number" ? saved.bestPoints : 0;
        const newBest = Math.max(points, prevBest);
        setBest(newBest);
        if (typeof saved.takeaway === "string") setTakeaway(saved.takeaway);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...saved, bestPoints: newBest, gamesPlayed: (saved.gamesPlayed ?? 0) + 1, lastPlayed: new Date().toISOString() }),
        );
      } catch {
        /* storage unavailable */
      }
      playFanfare();
      setPhase("finished");
      return;
    }
    const nextQ = ALL_QUESTIONS[index + 1];
    if (nextQ.partId !== current.partId) {
      setIndex(index + 1);
      setPhase("part");
    } else {
      openQuestion(index + 1);
    }
  }, [index, total, current, openQuestion, points]);

  // Keyboard: Enter = "I know it" / continue, C = show choices, 1–4 / A–D = pick, Y / N = self-mark
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      const k = e.key.toLowerCase();
      if (phase === "think") {
        if (k === "enter") revealRecall();
        if (k === "c") showChoices();
      } else if (phase === "selfcheck") {
        if (k === "y") record("recall");
        if (k === "n") record("miss");
      } else if (phase === "question") {
        const n = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "abcd".indexOf(k);
        if (n >= 0 && n < order.length) pick(order[n]);
        if (k === "enter" && isMulti) submit(selected);
      } else if (k === "enter") {
        if (phase === "answered") next();
        else if (phase === "part") openQuestion(index);
        else if (phase === "intro") start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // re-bind every render so handlers see fresh state

  const saveTakeaway = (v: string) => {
    setTakeaway(v);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, takeaway: v }));
    } catch {
      /* storage unavailable */
    }
  };

  const share = async () => {
    const squares = QUIZ_PARTS.map((p) =>
      p.questions.map((q) => SQUARE[results[ALL_QUESTIONS.findIndex((x) => x.id === q.id)] ?? "miss"]).join(""),
    ).join(" ");
    const text = [
      `🌿 Road to Jerusalem Quiz: ${points}/${maxPoints} pts`,
      `${recallCount} from memory · ${correctCount}/${total} correct`,
      squares,
      takeaway.trim() ? `\nWhat stood out to me: “${takeaway.trim()}”` : "",
      `\n${window.location.href}`,
    ].join("\n");
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

  // -- Intro ---------------------------------------------------------------
  if (phase === "intro") {
    return (
      <Shell>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-14 text-center max-w-2xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-gold-wash border border-gold-soft rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm">📖</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-deep" style={accent}>
                Gospel Scripture Quiz
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-ink mb-4 leading-tight" style={accent}>
              Road to Jerusalem
            </h1>
            <p className="text-xl text-stone-mid italic font-light mb-10" style={display}>
              From a jar of perfume in Bethany to a voice from heaven. How closely did you read?
            </p>
          </motion.div>

          <div className="grid gap-3 w-full mb-10 text-left">
            {QUIZ_PARTS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="flex items-center gap-4 bg-parchment-soft border border-stone-edge rounded-2xl px-5 py-4"
              >
                <span className="text-3xl flex-shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-stone-light font-bold" style={accent}>
                    Part {p.id} · {p.questions.length} questions
                  </p>
                  <p className="text-lg font-bold text-ink leading-snug" style={display}>
                    {p.title}
                  </p>
                  <p className="text-xs text-stone-mid">{p.passages}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 w-full mb-10 text-left">
            <div className="bg-[#f0f7eb] border border-[#b5d99a] rounded-2xl px-5 py-4">
              <p className="text-2xl mb-1">🧠</p>
              <p className="font-bold text-[#3a5a2a]" style={display}>Answer from memory · 2 pts</p>
              <p className="text-sm text-stone-mid">Say it, think it or type it, then check yourself against the verse.</p>
            </div>
            <div className="bg-gold-wash border border-gold-soft rounded-2xl px-5 py-4">
              <p className="text-2xl mb-1">🔤</p>
              <p className="font-bold text-gold-deep" style={display}>Need a hint? · 1 pt</p>
              <p className="text-sm text-stone-mid">Stuck? Reveal four choices and pick the right one.</p>
            </div>
          </div>

          <button
            onClick={start}
            className="px-10 py-4 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
            style={accent}
          >
            Begin the Journey →
          </button>
          <p className="text-xs text-stone-light mt-4">
            {total} questions · {maxPoints} points to play for · see the verse after each one
          </p>
        </div>
      </Shell>
    );
  }

  // -- Part title card -----------------------------------------------------
  if (phase === "part") {
    return (
      <Shell progress={index / total} index={index} total={total} score={points} streak={streak}>
        <div className="flex-1 flex items-center justify-center px-6 py-14">
          <motion.div
            key={part.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold-deep mb-4" style={accent}>
              Part {part.id} of {QUIZ_PARTS.length}
            </p>
            <div className="text-7xl mb-5">{part.emoji}</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-ink mb-3 leading-tight" style={display}>
              {part.title}
            </h2>
            <p className="text-lg text-stone-mid italic mb-6" style={display}>
              {part.subtitle}
            </p>
            <p className="text-xs text-stone-light mb-10" style={accent}>
              📖 {part.passages}
            </p>
            <button
              onClick={() => openQuestion(index)}
              className="px-10 py-3.5 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
              style={accent}
            >
              Let&rsquo;s go →
            </button>
          </motion.div>
        </div>
      </Shell>
    );
  }

  // -- Finished ------------------------------------------------------------
  if (phase === "finished") {
    const pct = Math.round((points / maxPoints) * 100);
    const [medal, verdict] =
      pct === 100
        ? ["🏆", "Flawless. You read every word."]
        : pct >= 80
          ? ["🥇", "You were really paying attention."]
          : pct >= 60
            ? ["🥈", "Solid reading, with a few details to revisit."]
            : pct >= 40
              ? ["🥉", "A good start. These passages reward a second read."]
              : ["📖", "Time to read John 12 again. You'll be surprised what you find."];

    return (
      <Shell>
        <div className="flex-1 px-6 py-14 max-w-2xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              className="text-7xl mb-5 block"
            >
              {medal}
            </motion.span>
            <h1 className="text-5xl font-bold text-ink mb-2" style={display}>
              {points} <span className="text-2xl text-stone-light">/ {maxPoints} pts</span>
            </h1>
            <p className="text-sm text-stone-mid mb-3" style={accent}>
              {correctCount}/{total} correct · {recallCount} from memory
            </p>
            <p className="text-stone-mid text-lg">{verdict}</p>
            {best !== null && best > points && <p className="text-xs text-stone-light mt-1">Your best: {best}/{maxPoints} pts</p>}
            {bestStreak > 2 && (
              <p className="text-sm text-gold-deep font-bold mt-2">Best streak: {bestStreak} 🔥</p>
            )}
          </motion.div>

          {/* Per-part breakdown */}
          <div className="grid gap-3 mb-10">
            {QUIZ_PARTS.map((p) => {
              const idxs = p.questions.map((q) => ALL_QUESTIONS.findIndex((x) => x.id === q.id));
              const got = idxs.reduce((sum, i) => sum + (results[i] ? POINTS[results[i]] : 0), 0);
              return (
                <div key={p.id} className="flex items-center gap-4 bg-parchment-soft border border-stone-edge rounded-2xl px-5 py-4">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink leading-snug" style={display}>
                      {p.title}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      {idxs.map((i) => (
                        <span
                          key={i}
                          title={ALL_QUESTIONS[i].title}
                          className={`h-2.5 flex-1 max-w-8 rounded-full ${
                            results[i] === "recall" ? "bg-[#5B7A4A]" : results[i] === "choice" ? "bg-gold" : "bg-[#d9a99f]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-ink" style={display}>
                    {got}/{idxs.length * POINTS.recall}
                  </span>
                </div>
              );
            })}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-stone-light pt-1">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5B7A4A] mr-1.5 align-middle" />From memory</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-gold mr-1.5 align-middle" />With choices</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#d9a99f] mr-1.5 align-middle" />Missed</span>
            </div>
          </div>

          {/* Reflection */}
          <div className="bg-ink text-vellum rounded-3xl px-7 py-8 mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold mb-2" style={accent}>
              Before you go
            </p>
            <h2 className="text-2xl font-bold mb-6" style={display}>
              Talk it over
            </h2>
            <div className="grid gap-4 mb-7">
              {WRAP_UP_PROMPTS.map((w) => (
                <div key={w.title} className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{w.emoji}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gold" style={accent}>
                      {w.title}
                    </p>
                    <p className="text-vellum/85 leading-relaxed">{w.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
            <label className="block text-xs font-bold uppercase tracking-widest text-vellum/60 mb-2" style={accent}>
              What stood out to you?
            </label>
            <textarea
              value={takeaway}
              onChange={(e) => saveTakeaway(e.target.value)}
              rows={3}
              placeholder="One line is enough…"
              className="w-full rounded-2xl bg-vellum/10 border border-vellum/20 px-4 py-3 text-vellum placeholder:text-vellum/40 focus:outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={share}
              className="px-8 py-3 rounded-full bg-gold text-vellum text-xs font-bold uppercase tracking-widest hover:bg-gold-deep transition-colors"
              style={accent}
            >
              {copied ? "Copied ✓" : "Share Result"}
            </button>
            <button
              onClick={start}
              className="px-8 py-3 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
              style={accent}
            >
              Play Again
            </button>
            <Link
              href="/games"
              className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors text-center"
              style={accent}
            >
              All Games
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // -- Question / Answered ---------------------------------------------------
  const answered = phase === "answered";
  const progress = (index + (answered ? 1 : 0)) / total;

  return (
    <Shell progress={progress} index={index} total={total} score={points} streak={streak} partLabel={`${part.emoji} ${part.title}`}>
      <div className="flex-1 flex flex-col items-center px-5 py-8 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {/* Question card */}
            <div className="w-full bg-parchment-soft border-2 border-stone-edge rounded-3xl px-6 sm:px-7 py-7 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-deep mb-2" style={accent}>
                Question {index + 1} · {current.title}
              </p>
              <p className="text-xl sm:text-2xl text-ink leading-snug" style={display}>
                {current.question}
              </p>
              {isMulti && phase === "question" && (
                <p className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-wash text-gold-deep border border-gold-soft" style={accent}>
                  Select all that apply
                </p>
              )}
            </div>

            {/* Think first */}
            {phase === "think" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <p className="text-center text-sm text-stone-mid mb-3">
                  🧠 Answer from memory first.
                  {isMulti && <span className="block text-xs text-stone-light mt-0.5">This answer has more than one part.</span>}
                </p>
                <input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && revealRecall()}
                  placeholder="Type your answer (optional)"
                  aria-label="Your answer"
                  className="w-full rounded-2xl bg-white border-2 border-stone-edge px-4 py-3.5 text-ink placeholder:text-stone-light focus:outline-none focus:border-gold mb-3"
                  style={display}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={revealRecall}
                    className="px-5 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
                    style={accent}
                  >
                    Reveal answer · 2 pts
                  </button>
                  <button
                    onClick={showChoices}
                    className="px-5 py-3.5 rounded-2xl border-2 border-gold-soft bg-gold-wash text-gold-deep text-xs font-bold uppercase tracking-widest hover:border-gold transition-colors"
                    style={accent}
                  >
                    Show choices · 1 pt
                  </button>
                </div>
              </motion.div>
            )}

            {/* The answer, for players who went from memory */}
            {(phase === "selfcheck" || (answered && !viaChoices)) && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full mb-6">
                {guess.trim() && (
                  <div className="bg-white border border-stone-edge rounded-2xl px-5 py-3 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-light mb-0.5" style={accent}>
                      You said
                    </p>
                    <p className="text-ink" style={display}>{guess.trim()}</p>
                  </div>
                )}
                <div className="bg-[#f0f7eb] border-2 border-[#5B7A4A] rounded-2xl px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5B7A4A] mb-0.5" style={accent}>
                    The answer
                  </p>
                  <p className="text-lg font-bold text-[#3a5a2a] leading-snug" style={display}>{answerText}</p>
                </div>
              </motion.div>
            )}

            {phase === "selfcheck" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full">
                <p className="text-center font-bold text-ink mb-1" style={display}>Did you get it?</p>
                <p className="text-center text-xs text-stone-light mb-4">Be honest. If you had the heart of it, it counts.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => record("recall")}
                    className="px-5 py-3.5 rounded-2xl bg-[#5B7A4A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#4a6a3a] transition-colors"
                    style={accent}
                  >
                    ✓ Got it · +2
                  </button>
                  <button
                    onClick={() => record("miss")}
                    className="px-5 py-3.5 rounded-2xl border-2 border-stone-edge bg-white text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-red-300 hover:text-red-700 transition-colors"
                    style={accent}
                  >
                    ✗ Missed it
                  </button>
                </div>
              </motion.div>
            )}

            {/* Options */}
            {viaChoices && (
            <div className="grid gap-3 w-full mb-6">
              {order.map((optIdx, pos) => {
                const isAnswer = current.answers.includes(optIdx);
                const isPicked = selected.includes(optIdx);
                const showRight = answered && isAnswer;
                const showWrong = answered && isPicked && !isAnswer;
                const missed = answered && isMulti && isAnswer && !isPicked;
                const dim = answered && !isAnswer && !isPicked;
                return (
                  <motion.button
                    key={optIdx}
                    onClick={() => pick(optIdx)}
                    disabled={answered}
                    whileTap={answered ? undefined : { scale: 0.98 }}
                    animate={showWrong ? { x: [0, -6, 6, -4, 4, 0] } : showRight && isPicked ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 0.35 }}
                    className={`w-full px-4 py-3.5 rounded-2xl text-left transition-colors border-2 flex items-center gap-3 ${
                      showRight
                        ? "bg-[#f0f7eb] border-[#5B7A4A] text-[#3a5a2a]"
                        : showWrong
                          ? "bg-red-50 border-red-400 text-red-700"
                          : dim
                            ? "bg-vellum border-stone-edge text-stone-light opacity-60"
                            : isPicked
                              ? "bg-gold-wash border-gold text-gold-deep"
                              : "bg-white border-stone-edge text-ink hover:border-gold hover:bg-gold-wash cursor-pointer"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                        showRight
                          ? "bg-[#5B7A4A] border-[#5B7A4A] text-white"
                          : showWrong
                            ? "bg-red-500 border-red-500 text-white"
                            : isPicked
                              ? "bg-gold border-gold text-vellum"
                              : "border-stone-edge text-stone-mid"
                      }`}
                      style={accent}
                    >
                      {showRight ? "✓" : showWrong ? "✗" : LETTERS[pos]}
                    </span>
                    <span className="text-base font-semibold leading-snug" style={display}>
                      {current.options[optIdx]}
                      {missed && <span className="block text-xs font-normal text-[#5B7A4A] mt-0.5">You missed this one</span>}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            )}

            {isMulti && phase === "question" && (
              <button
                onClick={() => submit(selected)}
                disabled={selected.length === 0}
                className="w-full px-5 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={accent}
              >
                Check Answer
              </button>
            )}

            {/* Reveal */}
            {answered && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full">
                <p className={`text-center text-lg font-bold mb-4 ${lastOutcome === "miss" ? "text-[#9C3A2A]" : "text-[#5B7A4A]"}`} style={display}>
                  {lastOutcome === "miss"
                    ? viaChoices && isMulti
                      ? "Not quite. Look at the full answer."
                      : "Not this time. Here's the verse."
                    : `${lastOutcome === "recall" ? "From memory! +2" : "Correct! +1"}${streak >= 3 ? ` · ${streak} in a row 🔥` : ""}`}
                </p>

                <blockquote className="border-l-4 border-gold bg-white rounded-r-2xl px-5 py-4 mb-3">
                  <p className="text-ink italic leading-relaxed" style={display}>
                    &ldquo;{current.verse}&rdquo;
                  </p>
                  <p className="text-xs text-gold-deep font-bold mt-2" style={accent}>
                    📖 {current.reference}
                  </p>
                </blockquote>

                <div className="bg-gold-wash border border-gold-soft rounded-2xl px-5 py-4 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold-deep mb-1" style={accent}>
                    ✨ What stands out
                  </p>
                  <p className="text-ink leading-relaxed">{current.standsOut}</p>
                </div>

                {current.didYouKnow && (
                  <div className="bg-parchment-soft border border-stone-edge rounded-2xl px-5 py-4 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-mid mb-1" style={accent}>
                      💡 Did you know?
                    </p>
                    <p className="text-stone-mid leading-relaxed text-sm">{current.didYouKnow}</p>
                  </div>
                )}

                {current.reflect && (
                  <div className="bg-ink text-vellum rounded-2xl px-5 py-4 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1" style={accent}>
                      🪞 Reflect
                    </p>
                    <p className="leading-relaxed">{current.reflect}</p>
                  </div>
                )}

                <button
                  onClick={next}
                  className="w-full mt-3 px-5 py-3.5 rounded-2xl bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
                  style={accent}
                >
                  {index + 1 >= total
                    ? "See Results →"
                    : ALL_QUESTIONS[index + 1].partId !== current.partId
                      ? "Next Part →"
                      : "Next Question →"}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Shell>
  );
}

function Shell({
  children,
  progress,
  index,
  total,
  score,
  streak,
  partLabel,
}: {
  children: React.ReactNode;
  progress?: number;
  index?: number;
  total?: number;
  score?: number;
  streak?: number;
  partLabel?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />
      {progress !== undefined && (
        <div className="border-b border-stone-edge bg-parchment-soft sticky top-0 z-10">
          <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/games" aria-label="Back to games" className="text-stone-mid hover:text-ink transition-colors flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 4l-6 6 6 6" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 text-xs text-stone-light mb-1">
                <span className="truncate" style={accent}>
                  {(index ?? 0) + 1} / {total}
                  {partLabel && <span className="hidden sm:inline"> · {partLabel}</span>}
                </span>
                {(streak ?? 0) >= 2 && <span className="text-gold-deep font-bold flex-shrink-0">🔥 {streak}</span>}
              </div>
              <div className="h-1.5 rounded-full bg-parchment-deep overflow-hidden">
                <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-ink leading-none" style={display}>
                {score}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-stone-light" style={accent}>
                pts
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
