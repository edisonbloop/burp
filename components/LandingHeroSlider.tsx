"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AUTO_ADVANCE_MS = 8000;

type Slide = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  body: string;
  primaryCta: { label: string; href: string; variant: "ink" | "gold" };
  secondaryCta?: { label: string; href: string };
  dark?: boolean;
  bgImage?: string;
};

const slides: Slide[] = [
  {
    id: "worship",
    eyebrow: "A BURP Gathering · 14th August 2026",
    title: (
      <>
        From the
        <br />
        Heart
      </>
    ),
    body: "A night of worship, testimony & ministration. An unhurried gathering hosted by BURP — Friday, 14th August 2026. Can't make it in person? RSVP for the livestream.",
    primaryCta: { label: "RSVP to the Livestream", href: "/worship#rsvp", variant: "gold" },
    secondaryCta: { label: "Learn more", href: "/worship" },
    dark: true,
    bgImage: "/images/worship/worship_hero.png",
  },
  {
    id: "platform",
    eyebrow: "THE BEREAN UPPER ROOM PLATFORM",
    title: (
      <>
        A room to feast on Scripture —
        <br />
        and to honestly say what you found.
      </>
    ),
    body: "A faith-centered community for Christians who love God's Word, study it deeply, and gather to reflect honestly. We feast on Scripture daily, then come together to \"burp\" — sharing what challenged, confused, or stirred us.",
    primaryCta: { label: "Share a reflection", href: "/burp-it", variant: "ink" },
    secondaryCta: { label: "100 Stones of remembrance", href: "/100stones" },
  },
];

function DotDivider({ light }: { light?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 mb-10 ${
        light ? "text-white/30" : "text-stone-light"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
    </div>
  );
}

export default function LandingHeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActive((index + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

  const slide = slides[active];

  return (
    <section
      className="relative overflow-hidden py-24 px-4 sm:px-6 text-center min-h-[620px] sm:min-h-[680px] flex items-center"
      style={
        slide.dark
          ? undefined
          : {
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)",
            }
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slide.dark && slide.bgImage && (
        <>
          <Image
            src={slide.bgImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25 select-none pointer-events-none"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0b] via-[#0f0d0b]/85 to-[#0f0d0b]/60" />
        </>
      )}

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center w-full">
        {/* Platform logo — only on first slide */}
        <AnimatePresence mode="wait">
          {!slide.dark && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Image
                src="/logosquare.png"
                alt="BURP Icon"
                width={100}
                height={100}
                priority
                className="h-24 w-auto object-contain drop-shadow-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <p
              className={`text-xs font-semibold tracking-widest uppercase mb-4 ${
                slide.dark ? "text-[#a89885]" : "text-gold-deep"
              }`}
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {slide.eyebrow}
            </p>

            <h1
              className={`text-4xl sm:text-6xl font-bold leading-tight tracking-tight mb-6 ${
                slide.dark ? "text-gold" : ""
              }`}
              style={{ fontFamily: slide.dark ? "var(--font-accent)" : "var(--font-display)" }}
            >
              {slide.title}
            </h1>

            <p
              className={`text-base sm:text-lg max-w-2xl leading-relaxed mb-8 ${
                slide.dark ? "text-[#d4c4ae] italic" : "text-stone-mid"
              }`}
              style={{ fontFamily: slide.dark ? "var(--font-display)" : undefined }}
            >
              {slide.body}
            </p>

            <DotDivider light={slide.dark} />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={slide.primaryCta.href}
                className={
                  slide.primaryCta.variant === "gold"
                    ? "px-8 py-3.5 rounded-full bg-gold hover:bg-gold-deep text-[#0f0d0b] font-bold text-xs tracking-[0.2em] uppercase transition-colors duration-200"
                    : "px-8 py-3.5 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors duration-200"
                }
                style={
                  slide.primaryCta.variant === "gold"
                    ? { fontFamily: "var(--font-accent)" }
                    : undefined
                }
              >
                {slide.primaryCta.label}
              </Link>
              {slide.secondaryCta && (
                <Link
                  href={slide.secondaryCta.href}
                  className={`px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-colors duration-200 ${
                    slide.dark
                      ? "border border-white/20 hover:border-gold text-[#d4c4ae] hover:text-gold"
                      : "border border-stone-edge hover:border-gold text-stone hover:text-ink"
                  }`}
                >
                  {slide.secondaryCta.label}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider controls */}
        <div className="mt-14 flex items-center gap-6">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              slide.dark
                ? "border border-white/15 text-[#a89885] hover:border-gold hover:text-gold"
                : "border border-stone-edge text-stone hover:border-gold hover:text-ink"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${s.id}`}
                aria-current={i === active ? "true" : undefined}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? slide.dark
                      ? "w-6 h-2 bg-gold"
                      : "w-6 h-2 bg-gold-deep"
                    : slide.dark
                      ? "w-2 h-2 bg-white/25 hover:bg-white/40"
                      : "w-2 h-2 bg-stone-light hover:bg-stone"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              slide.dark
                ? "border border-white/15 text-[#a89885] hover:border-gold hover:text-gold"
                : "border border-stone-edge text-stone hover:border-gold hover:text-ink"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
