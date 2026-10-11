"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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

function buildSlides(eventPast: boolean): Slide[] {
  return [
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
      secondaryCta: { label: "Go to Burp It", href: "/burp-it" },
    },
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
      body: eventPast
        ? "A night of worship, testimony & ministration. An unhurried gathering hosted by BURP — Friday, 14th August 2026."
        : "A night of worship, testimony & ministration. An unhurried gathering hosted by BURP — Friday, 14th August 2026. Can't make it in person? RSVP for the livestream.",
      primaryCta: eventPast
        ? { label: "See the gathering", href: "/worship", variant: "gold" }
        : { label: "RSVP to the Livestream", href: "/worship#rsvp", variant: "gold" },
      secondaryCta: eventPast ? undefined : { label: "Learn more", href: "/worship" },
      dark: true,
      bgImage: "/images/worship/worship_hero.png",
    },
  ];
}

function DotDivider({ light }: { light?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-2 mb-9 ${light ? "text-white/30" : "text-gold/60"}`}>
      <span className="h-px w-10 bg-current opacity-60" />
      <span className="w-1.5 h-1.5 rotate-45 bg-current" />
      <span className="h-px w-10 bg-current opacity-60" />
    </div>
  );
}

const arrow = {
  prev: <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />,
  next: <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />,
};

export default function LandingHeroSlider({ eventPast = false }: { eventPast?: boolean }) {
  const slides = useMemo(() => buildSlides(eventPast), [eventPast]);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const goTo = useCallback(
    (index: number) => setActive((index + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const autoPlay = !paused && !reduceMotion;
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [next, autoPlay, active]);

  const slide = slides[active];
  const dark = !!slide.dark;
  const ease = [0.22, 1, 0.36, 1] as const;
  const item = (i: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.08 * i, ease },
  });
  const ctrl = dark
    ? "border border-white/15 text-[#a89885] hover:border-gold hover:text-gold"
    : "border border-stone-edge text-stone hover:border-gold hover:text-ink";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="BURP highlights"
      tabIndex={0}
      className="relative overflow-hidden pt-16 sm:pt-24 pb-28 sm:pb-32 px-4 sm:px-6 text-center min-h-[600px] sm:min-h-[680px] flex items-center bg-vellum outline-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart == null) return;
        const dx = e.changedTouches[0].clientX - touchStart;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        setTouchStart(null);
      }}
    >
      {/* Light backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: dark ? 0 : 1,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 72%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46rem] h-[46rem] max-w-[140vw] rounded-full border border-gold/15 transition-opacity duration-700 pointer-events-none"
        style={{ opacity: dark ? 0 : 1 }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] max-w-[100vw] rounded-full border border-gold/20 transition-opacity duration-700 pointer-events-none"
        style={{ opacity: dark ? 0 : 1 }}
      />

      {/* Dark backdrop (cross-fades) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#0f0d0b] transition-opacity duration-700"
        style={{ opacity: dark ? 1 : 0 }}
      >
        {slides.map(
          (sl) =>
            sl.bgImage && (
              <Image
                key={sl.id}
                src={sl.bgImage}
                alt=""
                fill
                sizes="100vw"
                className={`object-cover opacity-30 select-none pointer-events-none ${
                  reduceMotion ? "" : "animate-[heroZoom_18s_ease-out_forwards]"
                }`}
              />
            )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0b] via-[#0f0d0b]/80 to-[#0f0d0b]/50" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 50% at 50% 30%, rgba(184,146,74,0.18), transparent 70%)" }}
        />
      </div>

      <style>{`@keyframes heroZoom{from{transform:scale(1)}to{transform:scale(1.08)}}`}</style>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center w-full" aria-live={paused ? "polite" : "off"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12, transition: { duration: 0.25 } }}
            className="flex flex-col items-center w-full"
          >
            {!dark && (
              <motion.div {...item(0)} className="mb-8">
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

            <motion.p
              {...item(1)}
              className={`text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-5 ${
                dark ? "text-gold-soft" : "text-gold-deep"
              }`}
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {slide.eyebrow}
            </motion.p>

            <motion.h1
              {...item(2)}
              className={`text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6 ${
                dark ? "text-gold" : "text-ink"
              }`}
              style={{ fontFamily: dark ? "var(--font-accent)" : "var(--font-display)" }}
            >
              {slide.title}
            </motion.h1>

            <motion.p
              {...item(3)}
              className={`text-base sm:text-lg max-w-2xl leading-relaxed mb-8 ${
                dark ? "text-[#d4c4ae] italic" : "text-stone-mid"
              }`}
              style={{ fontFamily: dark ? "var(--font-display)" : undefined }}
            >
              {slide.body}
            </motion.p>

            <motion.div {...item(4)} className="w-full">
              <DotDivider light={dark} />
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={slide.primaryCta.href}
                  className={
                    slide.primaryCta.variant === "gold"
                      ? "px-9 py-4 rounded-full bg-gold hover:bg-gold-soft text-[#0f0d0b] font-bold text-xs tracking-[0.2em] uppercase shadow-lg shadow-gold/20 transition-colors duration-200"
                      : "px-9 py-4 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide shadow-lg shadow-ink/15 transition-colors duration-200"
                  }
                  style={slide.primaryCta.variant === "gold" ? { fontFamily: "var(--font-accent)" } : undefined}
                >
                  {slide.primaryCta.label}
                </Link>
                {slide.secondaryCta && (
                  <Link
                    href={slide.secondaryCta.href}
                    className={`px-9 py-4 rounded-full font-semibold text-sm tracking-wide transition-colors duration-200 ${
                      dark
                        ? "border border-white/25 hover:border-gold text-[#d4c4ae] hover:text-gold"
                        : "border border-stone-edge bg-white/60 hover:border-gold text-stone hover:text-ink"
                    }`}
                  >
                    {slide.secondaryCta.label}
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-14 flex items-center gap-5">
          <button type="button" onClick={prev} aria-label="Previous slide" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${ctrl}`}>
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">{arrow.prev}</svg>
          </button>

          <div className="flex items-center gap-2.5">
            {slides.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.id}`}
                  aria-current={on ? "true" : undefined}
                  className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-300 ${
                    on ? "w-12" : "w-6"
                  } ${dark ? "bg-white/20 hover:bg-white/35" : "bg-stone-edge hover:bg-stone-light"}`}
                >
                  {on && (
                    <span
                      key={active}
                      className={`absolute inset-y-0 left-0 rounded-full ${dark ? "bg-gold" : "bg-gold-deep"}`}
                      style={
                        reduceMotion
                          ? { width: "100%" }
                          : { width: "100%", animation: `heroProgress ${AUTO_ADVANCE_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button type="button" onClick={next} aria-label="Next slide" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${ctrl}`}>
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">{arrow.next}</svg>
          </button>
        </div>
        <style>{`@keyframes heroProgress{from{transform:scaleX(0);transform-origin:left}to{transform:scaleX(1);transform-origin:left}}`}</style>
      </div>
    </section>
  );
}
