"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signBirthdayCard } from "@/lib/birthday-actions";
import type { BirthdayCard } from "@/types/birthday";
import Confetti, { type ConfettiHandle } from "./Confetti";
import { Label, inputCls } from "./CardDetailsFields";
import MessageIdeas from "./MessageIdeas";
import PhotoPicker from "./PhotoPicker";
import { THEMES } from "./themes";
import { playChime } from "./sound";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

const PROMPTS = [
  "My favourite memory with you is…",
  "Something I admire about you…",
  "This year I'm praying for you…",
  "A verse for your new year…",
];
const EMOJI = ["🎉", "🎂", "❤️", "🙏", "✨", "🥳", "🎈", "😂", "🌸", "👑"];

export default function SignCardClient({ card, signers }: { card: BirthdayCard; signers: string[] }) {
  const theme = THEMES[card.theme] ?? THEMES.gold;
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const confetti = useRef<ConfettiHandle>(null);
  const others = Array.from(new Set(signers.map((s) => s.trim())));

  function insert(text: string) {
    const el = textRef.current;
    const start = el?.selectionStart ?? message.length;
    const end = el?.selectionEnd ?? message.length;
    const next = (message.slice(0, start) + text + message.slice(end)).slice(0, 1500);
    setMessage(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + text.length, start + text.length);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await signBirthdayCard(card.slug, { author_name: name, message, photo_url: photo[0] ?? null });
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(true);
      playChime();
      confetti.current?.burst({ count: 160 });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <>
      <Confetti ref={confetti} colors={theme.confetti} />

      <section className="relative overflow-hidden" style={{ background: theme.bg, color: theme.ink }}>
        <div className="relative max-w-3xl mx-auto px-6 py-14 sm:py-20 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
          {card.photo_urls[0] && (
            <motion.div
              initial={{ rotate: -10, opacity: 0, y: 20 }}
              animate={{ rotate: -4, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="bg-white p-2.5 pb-9 shadow-xl w-40 shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.photo_urls[0]} alt={card.honoree_name} className="w-full aspect-square object-cover" />
              <p className="text-center text-sm italic mt-2 text-ink" style={display}>{card.honoree_name} 🎂</p>
            </motion.div>
          )}
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ ...accent, color: theme.accent }}>
              {card.organiser_name} is making a card
            </p>
            <h1 className="text-5xl sm:text-6xl font-semibold leading-[1.02] mb-3" style={display}>
              Sign <span className="italic">{card.honoree_name}&rsquo;s</span> birthday card
            </h1>
            <p className="text-sm" style={{ color: theme.muted }}>
              {others.length} {others.length === 1 ? "person has" : "people have"} signed so far — {others.slice(0, 5).join(", ")}
              {others.length > 5 ? ` & ${others.length - 5} more` : ""}.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto w-full px-5 py-12">
        {!card.accepting_messages ? (
          <div className="text-center bg-parchment-soft border border-stone-edge rounded-3xl p-10">
            <p className="text-5xl mb-4">🔒</p>
            <h2 className="text-3xl font-bold text-ink mb-2" style={display}>This card has been sealed</h2>
            <p className="text-stone-mid">The organiser has closed it to new messages. Thanks for thinking of {card.honoree_name}!</p>
          </div>
        ) : done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white border border-stone-edge rounded-[2rem] p-10 shadow-sm">
            <p className="text-6xl mb-4">💌</p>
            <h2 className="text-4xl font-bold text-ink mb-3" style={display}>Signed, sealed, delivered</h2>
            <p className="text-stone-mid mb-8 max-w-sm mx-auto">
              Your message is tucked inside {card.honoree_name}&rsquo;s card. They&rsquo;ll see it when they open it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/birthday/${card.slug}`} className="px-8 py-3 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors" style={accent}>
                Peek at the card
              </Link>
              <Link href="/birthday" className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors" style={accent}>
                Start a card
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="bg-white/70 border border-stone-edge rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-7">
            <label className="block">
              <Label>Your name</Label>
              <input className={inputCls} maxLength={60} placeholder="How they know you" value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <div>
              <Label hint={`${message.length}/1500`}>Your message</Label>
              <MessageIdeas name={card.honoree_name} value={message} onChange={setMessage} />
              <div className="flex flex-wrap gap-2 mb-3">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => insert(message ? `\n${p} ` : `${p} `)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-gold-wash text-gold-deep hover:bg-gold-glow transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <textarea
                ref={textRef}
                className={`${inputCls} min-h-44 resize-y text-xl leading-relaxed`}
                style={{ ...display, backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgba(0,0,0,0.04) 31px 32px)", backgroundAttachment: "local" }}
                maxLength={1500}
                placeholder={`Happy birthday, ${card.honoree_name}!`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {EMOJI.map((em) => (
                  <button key={em} type="button" onClick={() => insert(em)} className="w-9 h-9 rounded-full hover:bg-parchment-deep text-lg transition-colors" aria-label={`Add ${em}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label hint="optional">Add a photo</Label>
              <PhotoPicker max={1} value={photo} onChange={setPhoto} onBusyChange={setBusy} slug={card.slug} />
              <p className="text-[11px] text-stone-light mt-3">A picture of the two of you, a memory, or something that made you think of them.</p>
            </div>

            {error && <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={pending || busy}
              className="w-full py-4 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-[0.25em] hover:bg-stone transition-colors disabled:opacity-60"
              style={accent}
            >
              {busy ? "Uploading photo…" : pending ? "Tucking it in…" : "Sign the card ✍️"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
