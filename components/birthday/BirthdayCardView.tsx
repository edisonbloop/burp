"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { BirthdayCard, BirthdayMessage } from "@/types/birthday";
import Balloons from "./Balloons";
import Cake from "./Cake";
import Confetti, { type ConfettiHandle } from "./Confetti";
import Envelope, { Sparkles } from "./Envelope";
import MessageNote from "./MessageNote";
import { THEMES } from "./themes";
import { playBlow, playCheer, playChime, playPop, playSong, playWhoosh, setMuted, stopSong, unlockAudio } from "./sound";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };
const MUTE_KEY = "burp-bday-muted";

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function formatDay(iso: string | null) {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

export default function BirthdayCardView({
  card,
  messages,
}: {
  card: BirthdayCard;
  messages: BirthdayMessage[];
}) {
  const theme = THEMES[card.theme] ?? THEMES.gold;
  const [stage, setStage] = useState<"sealed" | "opening" | "open">("sealed");
  const storedMuted = useSyncExternalStore(() => () => {}, readMuted, () => false);
  const [mutedChoice, setMutedChoice] = useState<boolean | null>(null);
  const muted = mutedChoice ?? storedMuted;
  const [singing, setSinging] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const confetti = useRef<ConfettiHandle>(null);

  const people = [card.organiser_name, ...messages.map((m) => m.author_name)];
  const uniquePeople = Array.from(new Set(people.map((p) => p.trim())));
  const cover = card.photo_urls[0];
  const moments = card.photo_urls.slice(1);
  const day = formatDay(card.birthday);
  const headline = card.headline || "Happy Birthday";

  useEffect(() => setMuted(muted), [muted]);
  useEffect(() => () => stopSong(), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const sing = useCallback(() => {
    setSinging(true);
    playSong(() => setSinging(false));
  }, []);

  function toggleMute() {
    const m = !muted;
    setMutedChoice(m);
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {
      /* storage blocked */
    }
  }

  function open() {
    unlockAudio();
    playWhoosh();
    setTimeout(playChime, 500);
    setStage("opening");
  }

  function opened() {
    setStage("open");
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      playPop();
      confetti.current?.burst({ y: window.innerHeight * 0.55, count: 180, power: 16 });
      confetti.current?.rain(4000);
      sing();
    }, 250);
  }

  function replay() {
    stopSong();
    setSinging(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStage("sealed");
  }

  return (
    <div className="min-h-screen relative" style={{ background: theme.bg, color: theme.ink }}>
      <Confetti ref={confetti} colors={theme.confetti} />

      <AnimatePresence>
        {stage !== "open" && (
          <Envelope
            key="envelope"
            theme={theme}
            name={card.honoree_name}
            from={uniquePeople.length}
            opening={stage === "opening"}
            onOpen={open}
            onOpened={opened}
          />
        )}
      </AnimatePresence>

      {/* controls */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        <button
          type="button"
          onClick={() => (singing ? (stopSong(), setSinging(false)) : (unlockAudio(), sing()))}
          className="h-10 px-4 rounded-full backdrop-blur-md shadow-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105"
          style={{ ...accent, background: theme.dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.75)", color: theme.ink }}
        >
          <span className={singing ? "animate-bounce" : ""}>♪</span> {singing ? "Stop" : "Play song"}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="w-10 h-10 rounded-full backdrop-blur-md shadow-md flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: theme.dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.75)" }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden" style={{ color: theme.ink }}>
        {theme.dark && <Sparkles color={theme.accentSoft} count={40} />}
        <Balloons
          colors={theme.balloons}
          onPop={(x, y) => {
            playPop();
            confetti.current?.burst({ x, y, count: 40, spread: 180, power: 7 });
          }}
        />

        {card.turning_age && (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-bold leading-none"
            style={{ ...display, fontSize: "min(70vw, 34rem)", color: "transparent", WebkitTextStroke: `2px ${theme.accent}`, opacity: 0.16 }}
          >
            {card.turning_age}
          </span>
        )}

        <div className="relative text-center max-w-3xl pointer-events-none">
          {cover && (
            <motion.button
              type="button"
              onClick={() => setLightbox(cover)}
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={stage === "open" ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
              className="relative mx-auto mb-10 block w-44 h-56 sm:w-56 sm:h-72 pointer-events-auto cursor-zoom-in"
            >
              <span
                aria-hidden
                className="absolute -inset-3 rounded-t-full rounded-b-[2.4rem] border"
                style={{ borderColor: theme.accent, opacity: 0.45 }}
              />
              <span aria-hidden className="absolute -top-2 -left-5 text-2xl animate-[bday-twinkle_2.6s_ease-in-out_infinite]" style={{ color: theme.accent }}>✦</span>
              <span aria-hidden className="absolute top-10 -right-6 text-lg animate-[bday-twinkle_3.1s_ease-in-out_infinite]" style={{ color: theme.accent, animationDelay: "-1.2s" }}>✦</span>
              <span className="absolute inset-0 rounded-t-full rounded-b-[2rem] p-1.5 shadow-2xl" style={{ background: `linear-gradient(160deg, ${theme.accentSoft}, ${theme.accent})` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={card.honoree_name} className="w-full h-full object-cover rounded-t-full rounded-b-[1.6rem]" />
              </span>
              <span className="absolute -bottom-3 -right-3 text-4xl drop-shadow">🎉</span>
            </motion.button>
          )}

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={stage === "open" ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="text-[11px] sm:text-sm font-bold tracking-[0.4em] uppercase mb-4"
            style={{ ...accent, color: theme.accent }}
          >
            {headline}
          </motion.p>

          <h1 className="text-6xl sm:text-8xl md:text-9xl font-semibold italic leading-[0.95] mb-6" style={display} aria-label={card.honoree_name}>
            {Array.from(card.honoree_name).map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="inline-block"
                initial={{ opacity: 0, y: 60, rotate: -12 }}
                animate={stage === "open" ? { opacity: 1, y: 0, rotate: 0 } : {}}
                transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.7 + i * 0.06 }}
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={stage === "open" ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 + card.honoree_name.length * 0.06 }}
            className="space-y-2"
          >
            {(card.turning_age || day) && (
              <p className="text-lg sm:text-xl italic" style={{ ...display, color: theme.muted }}>
                {card.turning_age ? <>Celebrating{" "}<strong className="not-italic" style={{ color: theme.ink }}>{card.turning_age}</strong>{" "}wonderful years</> : null}
                {card.turning_age && day ? " · " : ""}
                {day}
              </p>
            )}
            <p className="text-sm" style={{ color: theme.muted }}>
              {uniquePeople.length} {uniquePeople.length === 1 ? "person" : "people"} made this for you
            </p>
          </motion.div>
        </div>

        <motion.a
          href="#wish"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-2"
          style={{ ...accent, color: theme.muted }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll for more
          <span className="text-lg">↓</span>
        </motion.a>
      </section>

      {/* ── Make a wish ──────────────────────────────────────── */}
      <section id="wish" className="relative px-6 py-24 flex flex-col items-center">
        <SectionTitle theme={theme} kicker="First things first" title="Make a wish" />
        <Cake
          theme={theme}
          age={card.turning_age}
          onBlownOut={() => {
            playBlow();
            setTimeout(() => {
              playCheer();
              confetti.current?.burst({ count: 220, power: 17 });
              confetti.current?.rain(2500);
            }, 650);
          }}
        />
      </section>

      {/* ── Moments ──────────────────────────────────────────── */}
      {moments.length > 0 && (
        <section className="relative px-6 py-20 overflow-hidden">
          <SectionTitle theme={theme} kicker="Some favourites" title="Moments" />
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-8">
            {moments.map((url, i) => {
              const tilt = ((i * 53) % 13) - 6;
              return (
                <motion.button
                  key={url}
                  type="button"
                  onClick={() => setLightbox(url)}
                  initial={{ opacity: 0, y: 50, rotate: tilt * 2, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
                  whileHover={{ rotate: 0, scale: 1.06, zIndex: 10 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 110, damping: 14, delay: (i % 4) * 0.08 }}
                  className="relative bg-white p-2.5 pb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] w-40 sm:w-52 cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" loading="lazy" className="w-full aspect-square object-cover" />
                  <span aria-hidden className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow" style={{ background: theme.balloons[i % theme.balloons.length] }} />
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Messages ─────────────────────────────────────────── */}
      <section className="relative px-5 sm:px-8 py-24">
        <SectionTitle
          theme={theme}
          kicker={`${messages.length + (card.organiser_note ? 1 : 0)} messages`}
          title="From all of us"
        />
        {card.organiser_note && (
          <div className="max-w-2xl mx-auto mb-14">
            <MessageNote theme={theme} index={0} author={card.organiser_name} message={card.organiser_note} featured />
          </div>
        )}
        {messages.length > 0 ? (
          <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-8">
            {messages.map((m, i) => (
              <MessageNote
                key={m.id}
                theme={theme}
                index={i + 1}
                author={m.author_name}
                message={m.message}
                photo={m.photo_url}
                onPhoto={setLightbox}
                onHeart={(x, y) => confetti.current?.burst({ x, y, count: 18, spread: 120, power: 6 })}
              />
            ))}
          </div>
        ) : (
          !card.organiser_note && (
            <p className="text-center italic text-xl" style={{ ...display, color: theme.muted }}>
              The messages are on their way…
            </p>
          )
        )}
      </section>

      {/* ── Finale ───────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-28 text-center overflow-hidden">
        {theme.dark && <Sparkles color={theme.accent} count={18} />}
        <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-5" style={{ ...accent, color: theme.accent }}>With love from</p>
        <p className="max-w-3xl mx-auto text-2xl sm:text-4xl italic leading-snug mb-12" style={display}>
          {uniquePeople.map((p, i) => (
            <span key={p}>
              {p}
              {i < uniquePeople.length - 2 ? ", " : i === uniquePeople.length - 2 ? " & " : ""}
            </span>
          ))}
        </p>
        <p className="text-sm max-w-md mx-auto mb-10" style={{ color: theme.muted }}>
          &ldquo;The Lord bless you and keep you; the Lord make his face shine on you.&rdquo; — Numbers 6:24–25
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={replay}
            className="px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg hover:-translate-y-0.5 transition-transform"
            style={{ ...accent, background: theme.accent, color: theme.dark ? "#141B36" : "#fff" }}
          >
            ↺ Open it again
          </button>
          {card.accepting_messages && (
            <Link
              href={`/birthday/${card.slug}/sign`}
              className="px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border-2 hover:-translate-y-0.5 transition-transform"
              style={{ ...accent, borderColor: theme.accent, color: theme.ink }}
            >
              ✍️ Add your message
            </Link>
          )}
        </div>
        <Link href="/birthday" className="inline-block mt-14 text-[10px] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity" style={accent}>
          Made with love on BURP · Make your own card
        </Link>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox}
              alt=""
              initial={{ scale: 0.85, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-full max-h-[88vh] rounded-lg shadow-2xl bg-white p-2"
            />
            <button type="button" aria-label="Close" className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 text-white text-lg">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTitle({ theme, kicker, title }: { theme: (typeof THEMES)[keyof typeof THEMES]; kicker: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="text-center mb-12"
    >
      <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ ...accent, color: theme.accent }}>{kicker}</p>
      <h2 className="text-5xl sm:text-6xl italic font-semibold" style={display}>{title}</h2>
      <div aria-hidden className="flex items-center justify-center gap-3 mt-4" style={{ color: theme.accent }}>
        <span className="h-px w-12" style={{ background: theme.accent, opacity: 0.5 }} />
        <span>✦</span>
        <span className="h-px w-12" style={{ background: theme.accent, opacity: 0.5 }} />
      </div>
    </motion.div>
  );
}
