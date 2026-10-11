import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import LandingHeroSlider from "@/components/LandingHeroSlider";
import { getPlanByDayNumber } from "@/lib/talk-actions";
import { dayNumberToDate, getCurrentDayNumber } from "@/lib/day-number";
import { isWorshipEventPast } from "@/lib/worship-event";

export const revalidate = 0;

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

const pillars = [
  { num: "I", title: "Feast", desc: "Scripture as nourishment — slow, daily, satisfying. Let the Word dwell in us richly." },
  { num: "II", title: "Reflect", desc: "The \u201cburp\u201d — sharing what stood out, challenged, stirred, or confused us. Honest and humble." },
  { num: "III", title: "Question", desc: "Like the Bereans, we verify what we are taught and seek truth with readiness of mind." },
  { num: "IV", title: "Gather", desc: "Upper Room settings — small rooms, real people, presence over performance." },
  { num: "V", title: "Grow", desc: "A long arc of spiritual maturity, built with quiet consistency — not for the algorithm." },
];

const portals = [
  {
    eyebrow: "FEAST · REFLECT · BURP",
    title: "Burp It",
    desc: "Bible plans, open threads, and honest reflections. Read the day\u2019s passage, share what stood out, and burp what you found with your Upper Room.",
    href: "/burp-it",
    cta: "Enter Burp It",
    featured: true,
  },
  {
    eyebrow: "THE WORD, ANYWHERE",
    title: "Scripture",
    desc: "Look up any passage and compare translations side by side.",
    href: "/scripture",
    cta: "Search Scripture",
  },
  {
    eyebrow: "SPIRITUAL REPOSITORY",
    title: "Content Library",
    desc: "Poems, reflections, devotions, and teachings submitted by the Berean community.",
    href: "/library",
    cta: "Browse the library",
  },
  {
    eyebrow: "LIVING MEMORIAL",
    title: "100 & 200 Stones",
    desc: "Testimonies of what God has done over 100 and 200 days of feasting on His Word. Set yours in stone so others find courage.",
    href: "/100stones",
    cta: "Explore the memorial",
  },
  {
    eyebrow: "COMMUNITY CARE",
    title: "Sharehouse",
    desc: "Inspired by Acts 2:44\u201345 — share burdens openly or anonymously, and let the body carry them together.",
    href: "/sharehouse",
    cta: "Enter the sharehouse",
  },
  {
    eyebrow: "MEMBERS\u2019 BOARD",
    title: "Bulletin",
    desc: "Events, promotions, products, and services shared by members of the community.",
    href: "/bulletin",
    cta: "See the bulletin",
  },
  {
    eyebrow: "WHO\u2019S LEADING",
    title: "Timetable",
    desc: "The facilitating timetable — who leads each session, and when.",
    href: "/timetable",
    cta: "View the timetable",
  },
];

const footerLinks = [
  ["Home", "/"],
  ["Burp It", "/burp-it"],
  ["Scripture", "/scripture"],
  ["Library", "/library"],
  ["100 Stones", "/100stones"],
  ["200 Stones", "/200stones"],
  ["The Wall", "/stones"],
  ["Sharehouse", "/sharehouse"],
  ["Bulletin", "/bulletin"],
  ["Timetable", "/timetable"],
  ["Worship", "/worship"],
  ["Links", "/link"],
  ["Admin", "/admin"],
] as const;

function DotRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-stone-light ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
    </div>
  );
}

export default async function LandingPage() {
  const eventPast = isWorshipEventPast();
  const dayNumber = getCurrentDayNumber();
  const todayPlan = await getPlanByDayNumber(dayNumber);
  const todayDate = dayNumberToDate(dayNumber).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const progress = Math.round((dayNumber / 365) * 100);

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <SiteNav />

      <LandingHeroSlider eventPast={eventPast} />

      {/* Today's reading — the core of the platform, surfaced right under the hero */}
      <section className="px-4 sm:px-6 -mt-8 sm:-mt-10 relative z-10">
        <div className="relative overflow-hidden max-w-4xl mx-auto bg-white rounded-3xl border border-gold-soft/70 shadow-xl shadow-gold/15 p-6 sm:p-9 pl-8 sm:pl-12">
          <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-gold-soft via-gold to-gold-deep" />
          <span aria-hidden className="absolute -right-4 -top-10 text-[11rem] leading-none font-bold text-gold-wash/60 select-none pointer-events-none" style={display}>{dayNumber}</span>
          <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gold-deep mb-3" style={accent}>
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-60" />
                  <span className="relative w-2 h-2 rounded-full bg-gold" />
                </span>
                Today&rsquo;s Reading · Day {dayNumber} of 365
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-snug mb-2" style={display}>
                {todayDate}
              </h2>
              {todayPlan?.description ? (
                <p className="text-sm text-stone-mid leading-relaxed line-clamp-3">{todayPlan.description}</p>
              ) : (
                <p className="text-sm text-stone-mid leading-relaxed">
                  Read through the whole Bible in a year, in the order events happened — and talk it over with the room.
                </p>
              )}
            </div>
            <Link
              href={todayPlan ? `/burp-it/${todayPlan.id}` : "/burp-it"}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-ink hover:bg-stone text-vellum text-xs font-bold tracking-[0.15em] uppercase transition-colors whitespace-nowrap"
              style={accent}
            >
              Read &amp; Discuss <span className="text-sm font-sans">→</span>
            </Link>
          </div>

          <div className="relative mt-7">
            <div className="h-2 rounded-full bg-parchment-soft overflow-hidden" role="progressbar" aria-valuenow={dayNumber} aria-valuemin={1} aria-valuemax={365} aria-label="Progress through the year">
              <div className="h-full bg-gradient-to-r from-gold-soft to-gold-deep rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-stone-light uppercase tracking-wider mt-2" style={accent}>
              {progress}% of the way through
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-semibold tracking-[0.3em] text-gold-deep block uppercase mb-3" style={accent}>
              HOW WE GATHER
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight" style={display}>
              Study like the Bereans
            </h2>
            <p className="text-sm text-stone-mid leading-relaxed">
              We gather in small rooms of five to twelve. We stay in one passage for a week. We hold
              conversations that do not pretend to have tidy endings.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group relative overflow-hidden bg-parchment-soft p-6 pt-7 rounded-2xl border border-stone-edge border-t-2 border-t-gold-soft hover:border-t-gold hover:-translate-y-1 hover:shadow-lg transition-all duration-200 last:col-span-2 lg:last:col-span-1"
              >
                <span
                  className="absolute -top-2 right-3 text-7xl font-bold text-gold/15 group-hover:text-gold/30 transition-colors select-none leading-none"
                  style={display}
                  aria-hidden
                >
                  {pillar.num}
                </span>
                <h3 className="relative text-xl font-bold mb-2" style={display}>
                  {pillar.title}
                </h3>
                <p className="relative text-xs text-stone-mid leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is a Berean */}
      <section className="py-20 px-4 sm:px-6 bg-parchment-soft border-y border-stone-edge">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold tracking-widest text-gold-deep block uppercase mb-3" style={accent}>
              OUR NAMESAKE
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight" style={display}>
              Who is a Berean?
            </h2>
            <blockquote className="relative border-l-2 border-gold pl-6 py-2 italic text-ink/80 leading-relaxed text-lg mb-6" style={display}>
              &ldquo;These were more noble than those in Thessalonica, in that they received the word with all
              readiness of mind, and searched the scriptures daily, whether those things were so.&rdquo;
              <span className="block mt-2 not-italic font-semibold text-xs text-gold-deep uppercase tracking-widest">
                — Acts 17:11, KJV
              </span>
            </blockquote>
            <p className="text-xs text-stone leading-relaxed">
              We do not accept easy answers. We do not participate in performance-based religion. We believe in
              open books, shared tables, and the humility of seeking God&rsquo;s truth together, verifying everything
              by Scripture.
            </p>
          </div>

          <div className="bg-gradient-to-b from-white to-vellum p-10 rounded-3xl border border-stone-edge shadow-sm flex flex-col items-center text-center">
            <Image
              src="/logoicon.png"
              alt="BURP Logo Icon"
              width={80}
              height={80}
              className="h-20 w-auto object-contain opacity-80 mb-6"
            />
            <h3 className="text-xl font-bold text-ink mb-3" style={display}>
              Upper Rooms
            </h3>
            <p className="text-xs text-stone-mid leading-relaxed mb-6 max-w-sm">
              Not shallow Bible talk. A thoughtful friend after a long conversation. Our community is segmented into
              intimate groups to facilitate presence, trust, and deep growth.
            </p>
            <DotRow />
          </div>
        </div>
      </section>

      {/* Enter the platform */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold tracking-[0.3em] text-gold-deep block uppercase mb-3" style={accent}>
              EXPLORE
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-ink tracking-tight" style={display}>
              Enter the platform
            </h2>
            <DotRow className="mt-4" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portals.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className={`group p-7 rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gold ${
                  p.featured
                    ? "sm:col-span-2 bg-gradient-to-br from-gold-wash to-parchment-soft border-gold-soft"
                    : "bg-parchment-soft border-stone-edge lg:last:col-span-2"
                }`}
              >
                <div>
                  <span className="text-[10px] font-semibold tracking-widest text-gold-deep uppercase block mb-3" style={accent}>
                    {p.eyebrow}
                  </span>
                  <h3 className={`font-bold mb-3 ${p.featured ? "text-3xl" : "text-2xl"}`} style={display}>
                    {p.title}
                  </h3>
                  <p className="text-xs text-stone-mid leading-relaxed mb-6">{p.desc}</p>
                </div>
                <span
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-gold-deep group-hover:text-ink transition-colors tracking-wider"
                  style={accent}
                >
                  {p.cta}
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current text-xs font-sans transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Worship gathering */}
          <div className="mt-8 bg-[#0f0d0b] p-8 sm:p-10 rounded-3xl border border-gold/30 hover:border-gold transition-colors duration-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <Image src="/images/worship/worship_hero.png" alt="" fill sizes="100vw" className="object-cover" aria-hidden />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0b] via-[#0f0d0b]/90 to-[#0f0d0b]/70" />
            </div>
            <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3" style={accent}>
                  {eventPast ? "A BURP GATHERING" : "UPCOMING GATHERING"} · 14 AUG 2026
                </span>
                <h3 className="text-3xl font-bold mb-4 text-gold" style={display}>
                  From the Heart
                </h3>
                <p className="text-sm text-[#d4c4ae] leading-relaxed max-w-xl">
                  {eventPast
                    ? "A night of worship, testimony and ministration, hosted by BURP."
                    : "A night of worship, testimony and ministration. Join in person or reserve your spot for the livestream — RSVP required for remote access."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
                {!eventPast && (
                  <Link
                    href="/worship#rsvp"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gold hover:bg-gold-deep text-[#0f0d0b] font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                    style={accent}
                  >
                    RSVP to the Livestream
                  </Link>
                )}
                <Link
                  href="/worship"
                  className={
                    eventPast
                      ? "inline-flex items-center justify-center px-6 py-3 rounded-full bg-gold hover:bg-gold-deep text-[#0f0d0b] font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                      : "inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase text-[#a89885] hover:text-gold transition-colors tracking-wider"
                  }
                  style={accent}
                >
                  {eventPast ? "See the gathering" : <>Event details <span className="text-sm font-sans">→</span></>}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <Image src="/logoicon.png" alt="BURP Logo Icon" width={40} height={40} className="h-8 w-auto object-contain opacity-50 mb-6" />
          <span className="text-sm font-bold tracking-widest uppercase block text-stone mb-4" style={accent}>
            B U R P
          </span>
          <span className="text-[10px] tracking-widest uppercase text-stone-light block mb-6" style={accent}>
            FEAST · REFLECT · QUESTION · GROW
          </span>
          <DotRow className="mb-8" />

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-stone-mid mb-8 max-w-3xl">
            {footerLinks.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-ink transition-colors">
                {label}
              </Link>
            ))}
          </div>

          <p className="text-[10px] text-stone-light leading-relaxed">
            &copy; 2026 The Berean Upper Room Platform. Built with old-world weight.
          </p>
        </div>
      </footer>
    </main>
  );
}
