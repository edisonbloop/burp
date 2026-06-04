import Link from "next/link";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { BIBLE_CHARACTERS } from "@/lib/bible-characters";
import { BIBLE_QUOTES } from "@/lib/bible-quotes";
import { TRUE_FALSE_STATEMENTS } from "@/lib/bible-true-false";

export const metadata: Metadata = {
  title: "Bible Games — BURP",
  description: "Fun Bible quizzes and games for the BURP community.",
};

const AVAILABLE = [
  {
    href: "/games/guess-the-character",
    emoji: "🎭",
    title: "Guess the Character",
    tagline: "Emoji clues. Bible figures.",
    description: "Four emoji clues are all you get. Can you name the Bible character?",
    stat: `${BIBLE_CHARACTERS.length}`,
    statLabel: "characters",
    color: "bg-gold-wash",
    border: "border-gold-soft",
    titleColor: "text-gold-deep",
    badgeColor: "bg-gold text-vellum",
  },
  {
    href: "/games/who-said-it",
    emoji: "💬",
    title: "Who Said It?",
    tagline: "Famous quotes. Real speakers.",
    description: "A Bible quote appears. Four names to choose from. One is right — are you sure which?",
    stat: `${BIBLE_QUOTES.length}`,
    statLabel: "quotes",
    color: "bg-parchment-soft",
    border: "border-stone-edge",
    titleColor: "text-ink",
    badgeColor: "bg-ink text-vellum",
  },
  {
    href: "/games/true-or-false",
    emoji: "⚡",
    title: "True or False",
    tagline: "Fast-fire. Timer ticking.",
    description: "Bible statements flash up. Is it TRUE or FALSE? You have 12 seconds. Some will surprise you.",
    stat: `${TRUE_FALSE_STATEMENTS.length}`,
    statLabel: "statements",
    color: "bg-[#fff8f0]",
    border: "border-orange-200",
    titleColor: "text-orange-900",
    badgeColor: "bg-orange-500 text-white",
  },
];

const COMING_SOON = [
  {
    emoji: "📜",
    title: "Complete the Verse",
    description: "Fill in the missing word from famous Scripture passages.",
  },
  {
    emoji: "🔗",
    title: "Bible Connections",
    description: "Group 16 Bible items into 4 hidden categories. Think carefully.",
  },
  {
    emoji: "⏱️",
    title: "Speed Round",
    description: "60 seconds. As many Bible facts as you can answer.",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />

      {/* ── Hero ── */}
      <section className="bg-parchment-soft border-b-2 border-gold-soft px-6 py-14 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-gold-wash border border-gold-soft rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm">🎮</span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest text-gold-deep"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Bible Games
          </span>
        </div>
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-ink mb-4 leading-tight"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Play the Word
        </h1>
        <p
          className="text-xl sm:text-2xl text-stone-mid italic font-light max-w-md mx-auto"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Test your Scripture knowledge. Have fun. Learn something.
        </p>
      </section>

      {/* ── Available games ── */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-4 w-full">
        <p
          className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-light mb-5"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Play Now
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AVAILABLE.map(({ href, emoji, title, tagline, description, stat, statLabel, color, border, titleColor, badgeColor }) => (
            <Link
              key={title}
              href={href}
              className={`group relative ${color} border-2 ${border} rounded-3xl overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-200`}
            >
              {/* Top accent strip */}
              <div className="h-1.5 w-full bg-gold" />

              <div className="p-7">
                {/* Badge */}
                <span
                  className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeColor} mb-5`}
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  ● Live
                </span>

                {/* Emoji */}
                <div className="text-6xl mb-4">{emoji}</div>

                {/* Title */}
                <h2
                  className={`text-2xl font-bold ${titleColor} mb-1 leading-snug`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h2>
                <p
                  className="text-xs font-bold uppercase tracking-widest text-gold-deep/60 mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {tagline}
                </p>
                <p className="text-sm text-stone-mid leading-relaxed mb-6">
                  {description}
                </p>

                {/* Stats row */}
                <div className="flex items-center justify-between pt-4 border-t border-gold-soft">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl font-bold text-ink leading-none"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {stat}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-widest text-stone-light font-bold"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {statLabel}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold text-gold-deep uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Play →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Coming soon cards inline with available */}
          {COMING_SOON.map(({ emoji, title, description }) => (
            <div
              key={title}
              className="relative bg-parchment-soft border-2 border-dashed border-stone-edge rounded-3xl overflow-hidden opacity-70"
            >
              <div className="h-1.5 w-full bg-stone-edge" />
              <div className="p-7">
                <span
                  className="inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-vellum text-stone-light border border-stone-edge mb-5"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Coming Soon
                </span>
                <div className="text-6xl mb-4 grayscale">{emoji}</div>
                <h3
                  className="text-2xl font-bold text-stone-mid mb-3 leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-stone-light leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fun stat banner ── */}
      <section className="max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="bg-parchment-soft border border-stone-edge rounded-3xl px-8 py-7 grid grid-cols-3 divide-x divide-stone-edge text-center">
          {[
            { value: BIBLE_CHARACTERS.length, label: "Characters" },
            { value: "2", label: "Testaments" },
            { value: "∞", label: "Replays" },
          ].map(({ value, label }) => (
            <div key={label} className="px-4">
              <p
                className="text-4xl font-bold text-ink leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value}
              </p>
              <p
                className="text-[10px] uppercase tracking-widest text-stone-light mt-2 font-bold"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
