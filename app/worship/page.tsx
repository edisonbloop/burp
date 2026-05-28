import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "From the Heart — BURP",
  description:
    "A night of worship, testimony and ministration. Hosted by the Berean Upper Room Platform. Friday, 14th August 2026.",
  openGraph: {
    title: "From the Heart — A Night of Worship",
    description:
      "Worship. Testimony. Ministration. An unhurried night hosted by BURP — Friday, 14th August 2026.",
  },
};

const DARK    = "bg-[#0f0d0b]";
const DARK_MID = "bg-[#16120e]";

export default function WorshipPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Site nav ────────────────────────────────────────────────────────── */}
      <SiteNav />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className={`${DARK} relative flex flex-col items-center justify-center text-center px-6 py-28 sm:py-36 md:py-44 min-h-[85vh] sm:min-h-screen overflow-hidden`}
      >
        {/* Background Image with soft opacity and scaling */}
        <Image
          src="/images/worship/worship_hero.png"
          alt="A large congregation of beautiful Black people gathered in deep, passionate candlelit worship inside an old-world chapel."
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20 select-none scale-105 pointer-events-none"
        />
        {/* Deep, rich old-world gradient overlays to ensure full contrast and smooth integration */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0b] via-[#0f0d0b]/80 to-transparent" />
        <div className="absolute inset-0 bg-[#0f0d0b]/40" />

        {/* Hero Content Container */}
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          <p
            className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-[#a89885] mb-10 drop-shadow-sm"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            A BURP Gathering · 14th August 2026
          </p>

          <h1
            className="text-[3.5rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[8rem] font-bold leading-[0.95] tracking-wide text-gold mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            From the<br />Heart
          </h1>

          <div className="w-12 h-px bg-gold/30 mb-8" />

          <p
            className="text-xl sm:text-2xl text-[#d4c4ae] italic font-light max-w-md leading-relaxed drop-shadow-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A Night of Worship, Testimony<br />& Ministration
          </p>

          <div className="mt-14 flex flex-col items-center gap-2">
            <p
              className="text-[10px] tracking-[0.4em] uppercase text-[#a89885] drop-shadow-sm"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Friday
            </p>
            <p
              className="text-2xl sm:text-3xl font-bold text-[#d4c4ae] drop-shadow-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              14th August 2026
            </p>
          </div>
        </div>
      </section>

      {/* ── Vision pull quote ───────────────────────────────────────────────── */}
      <section className="bg-vellum px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span
            className="text-5xl text-gold/20 leading-none block mb-4"
            aria-hidden="true"
            style={{ fontFamily: "var(--font-display)" }}
          >
            "
          </span>
          <p
            className="text-2xl sm:text-3xl md:text-4xl text-ink font-light italic leading-relaxed"
            style={{ fontFamily: "var(--font-display)" }}
          >
            There is a kind of worship that is rehearsed for an audience.
            And there is a kind that comes from somewhere deeper —
            unpolished, unperformed, and entirely meant for God.
          </p>
          <span
            className="text-5xl text-gold/20 leading-none block mt-4"
            aria-hidden="true"
            style={{ fontFamily: "var(--font-display)" }}
          >
            "
          </span>
          <p
            className="mt-8 text-sm text-stone-light tracking-widest uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            From the Heart is the second kind.
          </p>
        </div>
      </section>

      {/* ── Vision visual breakout ─────────────────────────────────────────── */}
      <section className="relative h-[300px] sm:h-[450px] md:h-[600px] w-full overflow-hidden bg-black border-t border-b border-white/5">
        <Image
          src="/images/worship/worship_group.png"
          alt="A sincere community gathering in deep, intimate worship inside a warm, candlelit room."
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80 select-none transition-transform duration-[10s] ease-out hover:scale-105"
        />
        {/* Deep, old-world gradient overlays to blend nicely */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#16120e]" />
        
        {/* Subtle, elegant artistic credit */}
        <div className="absolute bottom-6 right-6 text-right z-10 hidden sm:block">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/40" style={{ fontFamily: "var(--font-accent)" }}>
            The Atmosphere
          </p>
          <p className="text-xs italic text-[#c4aa88] font-light mt-1" style={{ fontFamily: "var(--font-display)" }}>
            Presence over performance
          </p>
        </div>
      </section>

      {/* ── Programme ───────────────────────────────────────────────────────── */}
      <section className={`${DARK_MID} px-6 py-20 sm:py-28`}>
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[10px] tracking-[0.4em] uppercase text-[#7a6a58] mb-3 text-center"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Programme
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-gold text-center mb-16"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Three Rhythms
          </h2>

          <div className="grid gap-0 divide-y divide-white/5">
            {[
              {
                numeral: "I",
                title: "Worship",
                body: "Live corporate worship opens and anchors the night. Songs the community knows. The room settles into something honest. There is no rush.",
              },
              {
                numeral: "II",
                title: "Testimony",
                body: "Members of the BURP community share what God has done — not polished stage stories, just real accounts. Answered prayers. Moments where the Word broke something open. Voices from the Upper Rooms.",
              },
              {
                numeral: "III",
                title: "Ministration",
                body: "The literary heart of the night. Community members deliver spoken word pieces and short essays — reflections on faith, Scripture, doubt, grace, and the journey. Thoughtful. Personal. Given room to breathe.",
              },
            ].map(({ numeral, title, body }) => (
              <div
                key={numeral}
                className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10 py-10"
              >
                <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 sm:w-28 sm:text-right">
                  <span
                    className="text-4xl sm:text-5xl font-bold text-gold/20 leading-none"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {numeral}
                  </span>
                  <span
                    className="text-[10px] tracking-[0.35em] uppercase text-[#7a6a58]"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {title}
                  </span>
                </div>
                <div className="flex-1 sm:border-l sm:border-white/5 sm:pl-10">
                  <h3
                    className="text-2xl sm:text-3xl font-bold text-[#c4aa88] mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-lg text-[#c8b898] leading-relaxed"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            className="mt-10 text-center text-base text-[#8a7a65] italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The night closes in worship.
          </p>
        </div>
      </section>

      {/* ── Ethos ───────────────────────────────────────────────────────────── */}
      <section className="bg-parchment-soft px-6 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[10px] tracking-[0.4em] uppercase text-stone-light mb-3 text-center"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Ethos
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-ink text-center mb-16"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What we hold
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Sincerity as the standard",
                body: "Everything on this night — the worship, the testimonies, the words — must be genuinely felt before it is shared.",
              },
              {
                title: "Simplicity as intention",
                body: "The programme is lean on purpose. Space is not dead air — it is room for something real.",
              },
              {
                title: "The literary voice matters",
                body: "Spoken word and essays are not fillers between songs. They are ministration. They carry weight.",
              },
              {
                title: "Scripture as foundation",
                body: "Every element of the night is tethered to the Word.",
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="bg-vellum border border-stone-edge rounded-2xl p-7"
              >
                <div className="w-6 h-px bg-gold mb-5" />
                <h3
                  className="text-2xl font-bold text-ink mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-base text-ink leading-relaxed"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Details ─────────────────────────────────────────────────────────── */}
      <section className="bg-vellum px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <p
            className="text-[10px] tracking-[0.4em] uppercase text-stone-light mb-3 text-center"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Details
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-ink text-center mb-14"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Particulars
          </h2>

          <div className="divide-y divide-stone-edge border border-stone-edge rounded-2xl overflow-hidden">
            {[
              { label: "Date",      value: "Friday, 14th August 2026" },
              { label: "Format",   value: "In-person · Livestream (TBC)" },
              { label: "Duration", value: "2.5 – 3 hours" },
              { label: "Admission",value: "Free / Love Offering" },
              { label: "Host",     value: "The Berean Upper Room Platform" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-6 px-6 sm:px-8 py-5 bg-parchment-soft"
              >
                <span
                  className="text-xs font-bold tracking-[0.25em] uppercase text-stone-mid flex-shrink-0"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {label}
                </span>
                <span
                  className="text-lg text-ink font-semibold text-right"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Audience note */}
          <div className="mt-10 bg-gold-wash border border-gold-soft rounded-2xl px-7 py-6">
            <p
              className="text-[10px] tracking-[0.35em] uppercase text-gold-deep mb-3"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Who this night is for
            </p>
            <ul
              className="space-y-3 text-base text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5 flex-shrink-0">—</span>
                The active BURP community across all Upper Rooms
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5 flex-shrink-0">—</span>
                Christians in the wider network who are hungry for something honest and unhurried
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5 flex-shrink-0">—</span>
                Writers, spoken word artists, and thinkers who want a room where their craft serves something bigger than themselves
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Atmosphere ──────────────────────────────────────────────────────── */}
      <section className={`${DARK} px-6 py-20 sm:py-28 md:py-36 overflow-hidden`}>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text description */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-6">
            <p
              className="text-[10px] tracking-[0.4em] uppercase text-[#7a6a58]"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Atmosphere
            </p>
            
            <h2 
              className="text-3xl sm:text-4xl font-bold text-gold leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sacred Space
            </h2>
            
            <div className="w-12 h-px bg-gold/30 my-4 mx-auto lg:mx-0" />
            
            <p
              className="text-lg sm:text-xl text-[#9a8870] leading-relaxed italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Low light. Live music. Chairs arranged for community, not audience.
              A room where a spoken word piece lands the same way a song does.
              The kind of night people leave quietly —
            </p>
            
            <p
              className="text-3xl sm:text-4xl font-bold text-gold pt-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              full, not hyped.
            </p>
          </div>

          {/* Right Column: Staggered, visual portrait gallery */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6 relative mt-8 lg:mt-0">
            {/* Ambient Background Gold Wash/Glow */}
            <div className="absolute -inset-4 bg-gold/5 blur-3xl rounded-full pointer-events-none" />

            {/* Portrait 1: Woman */}
            <div className="group relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 hover:border-gold/40 hover:shadow-gold/5 hover:translate-y-[-4px]">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/images/worship/worship_woman.png"
                  alt="A Black woman lost in deep, intimate worship with eyes closed and hand gently raised in prayer."
                  fill
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                <p 
                  className="text-[9px] tracking-[0.2em] uppercase text-gold/80" 
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Sincerity
                </p>
                <p 
                  className="text-xs text-white/90 font-light mt-0.5" 
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Closed to the world, open to God.
                </p>
              </div>
            </div>

            {/* Portrait 2: Man - Staggered slightly down */}
            <div className="group relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 hover:border-gold/40 hover:shadow-gold/5 hover:translate-y-[-4px] translate-y-4 sm:translate-y-8">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/images/worship/worship_man.png"
                  alt="A Black man worshipping with deep devotion, eyes closed in profound prayer."
                  fill
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                <p 
                  className="text-[9px] tracking-[0.2em] uppercase text-gold/80" 
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Devotion
                </p>
                <p 
                  className="text-xs text-white/90 font-light mt-0.5" 
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  An honest, unpolished prayer.
                </p>
              </div>
            </div>
            
          </div>
          
        </div>
      </section>

      {/* ── Closing ─────────────────────────────────────────────────────────── */}
      <section className={`${DARK_MID} border-t border-white/5 px-6 py-24 sm:py-32`}>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <p
            className="text-lg sm:text-xl text-[#c8b898] leading-relaxed italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BURP was built with old-world weight and quiet consistency.{" "}
            <em>From the Heart</em> carries that same spirit.
            Not an event to be marketed. A moment to be kept.
          </p>
          <div className="w-10 h-px bg-gold/20 mx-auto" />
          <p
            className="text-2xl sm:text-3xl font-bold text-[#c4aa88] italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We have been feasting.<br />August 14th is what comes out.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className={`${DARK} border-t border-white/5 px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
        <Link
          href="/"
          className="text-xs font-bold tracking-[0.3em] uppercase text-[#8a7a65] hover:text-gold transition-colors"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          ← Back to BURP
        </Link>
        <p
          className="text-[10px] tracking-widest uppercase text-[#6a5e50]"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          burp.ink · The Berean Upper Room Platform
        </p>
      </footer>

    </div>
  );
}
