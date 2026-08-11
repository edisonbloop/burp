import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import LandingHeroSlider from "@/components/LandingHeroSlider";

export default function RedesignedLandingPage() {
  const pillars = [
    {
      num: "I",
      title: "Feast",
      desc: "Scripture as nourishment — slow, daily, satisfying. We believe in taking the time to let the Word dwell in us richly.",
    },
    {
      num: "II",
      title: "Reflect",
      desc: "The 'burp' — sharing what stood out, what challenged us, what stirred us, or what confused us. Honest and humble.",
    },
    {
      num: "III",
      title: "Question",
      desc: "Like the Bereans, we verify what we are taught. We study deeply and seek truth with authentic readiness of mind.",
    },
    {
      num: "IV",
      title: "Gather",
      desc: "Upper Room settings — small rooms, real people, presence over performance. Small group discussions with no tidy endings.",
    },
    {
      num: "V",
      title: "Grow",
      desc: "A long arc of spiritual maturity. Built with old-world weight and quiet consistency, not for the algorithm.",
    },
  ];

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <SiteNav />

      <LandingHeroSlider />

      {/* Brand Story and Pillars */}
      <section className="bg-parchment-soft border-t border-b border-stone-edge py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Study like the Bereans
            </h2>
            <p className="text-sm text-stone-mid leading-relaxed">
              We gather in small rooms of five to twelve. We stay in one passage for a week.
              We hold conversations that do not pretend to have tidy endings.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-vellum p-8 rounded-3xl border border-stone-edge shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span
                    className="text-xs font-semibold tracking-widest text-gold block mb-4"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    PILLAR {pillar.num}
                  </span>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-stone-mid leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive into Berean scripture study */}
      <section className="py-20 px-4 sm:px-6 bg-vellum">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span
              className="text-xs font-semibold tracking-widest text-gold-deep block uppercase mb-3"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              OUR NAMESAKE
            </span>
            <h2
              className="text-3xl font-bold mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Who is a Berean?
            </h2>
            <blockquote className="border-l-2 border-gold pl-6 py-2 italic text-stone-mid leading-relaxed text-sm mb-6">
              &ldquo;These were more noble than those in Thessalonica, in that they received
              the word with all readiness of mind, and searched the scriptures daily, whether
              those things were so.&rdquo;
              <span className="block mt-2 not-italic font-semibold text-xs text-gold-deep uppercase tracking-widest">
                — Acts 17:11, KJV
              </span>
            </blockquote>
            <p className="text-xs text-stone leading-relaxed">
              We do not accept easy answers. We do not participate in performance-based religion.
              We believe in open books, shared tables, and the humility of seeking God's truth
              together, verifying everything by Scripture.
            </p>
          </div>

          {/* Visual representation card */}
          <div className="bg-parchment-soft p-8 rounded-3xl border border-stone-edge flex flex-col items-center text-center">
            <Image
              src="/logoicon.png"
              alt="BURP Logo Icon"
              width={80}
              height={80}
              className="h-20 w-auto object-contain opacity-80 mb-6"
            />
            <h3
              className="text-xl font-bold text-ink mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Upper Rooms
            </h3>
            <p className="text-xs text-stone-mid leading-relaxed mb-6 max-w-sm">
              Not shallow Bible talk. A thoughtful friend after a long conversation.
              Our community is segmented into intimate groups to facilitate presence,
              trust, and deep growth.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-stone-light">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
          </div>
        </div>
      </section>

      {/* Portal grid */}
      <section className="bg-parchment-soft border-t border-stone-edge py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Enter the platform
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4 text-stone-light">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Worship Night Portal — featured upcoming event */}
            <div className="bg-[#0f0d0b] p-8 rounded-3xl border border-gold/30 hover:border-gold transition-all duration-220 flex flex-col justify-between md:col-span-2 lg:col-span-3 relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <Image
                  src="/images/worship/worship_hero.png"
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0b] via-[#0f0d0b]/90 to-[#0f0d0b]/70" />
              </div>
              <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-6 items-end">
                <div>
                  <span
                    className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    UPCOMING GATHERING · 14 AUG 2026
                  </span>
                  <h3
                    className="text-3xl font-bold mb-4 text-gold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    From the Heart
                  </h3>
                  <p className="text-sm text-[#d4c4ae] leading-relaxed mb-0 max-w-xl">
                    A night of worship, testimony and ministration. Join in person or
                    reserve your spot for the livestream — RSVP required for remote access.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
                  <Link
                    href="/worship#rsvp"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gold hover:bg-gold-deep text-[#0f0d0b] font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    RSVP to the Livestream
                  </Link>
                  <Link
                    href="/worship"
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase text-[#a89885] hover:text-gold transition-colors tracking-wider"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Event details <span className="text-sm font-sans">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Burp It Portal */}
            <div className="bg-vellum p-8 rounded-3xl border border-stone-edge hover:border-gold transition-all duration-220 flex flex-col justify-between">
              <div>
                <span
                  className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  FEAST · REFLECT · BURP
                </span>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Burp It
                </h3>
                <p className="text-xs text-stone-mid leading-relaxed mb-6">
                  Bible plans, open threads, and honest reflections. Share what stood out,
                  ask questions, and burp what you found with your Upper Room.
                </p>
              </div>
              <Link
                href="/burp-it"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-gold-deep hover:text-gold transition-colors duration-140 tracking-wider"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Enter Burp It <span className="text-sm font-sans">→</span>
              </Link>
            </div>

            {/* Content Library Portal */}
            <div className="bg-vellum p-8 rounded-3xl border border-stone-edge hover:border-gold transition-all duration-220 flex flex-col justify-between">
              <div>
                <span
                  className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  SPIRITUAL REPOSITORY
                </span>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Content Library
                </h3>
                <p className="text-xs text-stone-mid leading-relaxed mb-6">
                  Browse a curated collection of spiritual poems, reflections, devotions, and deep theological teachings submitted by the Berean community.
                </p>
              </div>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-gold-deep hover:text-gold transition-colors duration-140 tracking-wider"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Browse the library <span className="text-sm font-sans">→</span>
              </Link>
            </div>

            {/* 100 Stones Portal */}
            <div className="bg-vellum p-8 rounded-3xl border border-stone-edge hover:border-gold transition-all duration-220 flex flex-col justify-between">
              <div>
                <span
                  className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  LIVING MEMORIAL
                </span>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  100 Stones of Remembrance
                </h3>
                <p className="text-xs text-stone-mid leading-relaxed mb-6">
                  A sacred space detailing testimonies of what God has done over 100 days of feasting on His Word. Set your testimony in stone so others find courage.
                </p>
              </div>
              <Link
                href="/100stones"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-gold-deep hover:text-gold transition-colors duration-140 tracking-wider"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Explore the memorial <span className="text-sm font-sans">→</span>
              </Link>
            </div>

            {/* Sharehouse Portal */}
            <div className="bg-vellum p-8 rounded-3xl border border-stone-edge hover:border-gold transition-all duration-220 flex flex-col justify-between">
              <div>
                <span
                  className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  COMMUNITY CARE
                </span>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sharehouse
                </h3>
                <p className="text-xs text-stone-mid leading-relaxed mb-6">
                  Inspired by Acts 2:44-45, share tangible burdens openly or anonymously, and let the church body carry and meet these needs in mutual support.
                </p>
              </div>
              <Link
                href="/sharehouse"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-gold-deep hover:text-gold transition-colors duration-140 tracking-wider"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Enter the sharehouse <span className="text-sm font-sans">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="mb-6">
            <Image
              src="/logoicon.png"
              alt="BURP Logo Icon"
              width={40}
              height={40}
              className="h-8 w-auto object-contain opacity-50"
            />
          </div>
          <span
            className="text-sm font-bold tracking-widest uppercase block text-stone mb-4"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            B U R P
          </span>
          <span
            className="text-[10px] tracking-widest uppercase text-stone-light block mb-6"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            FEAST · REFLECT · QUESTION · GROW
          </span>
          
          <div className="flex items-center justify-center gap-2 mb-8 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-medium text-stone-mid mb-8">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <Link href="/burp-it" className="hover:text-ink transition-colors">
              Burp It
            </Link>
            <Link href="/library" className="hover:text-ink transition-colors">
              Library
            </Link>
            <Link href="/100stones" className="hover:text-ink transition-colors">
              100 Stones
            </Link>
            <Link href="/sharehouse" className="hover:text-ink transition-colors">
              Sharehouse
            </Link>
            <Link href="/stones" className="hover:text-ink transition-colors">
              The Wall
            </Link>
            <Link href="/submit" className="hover:text-ink transition-colors">
              Submit Stone
            </Link>
            <Link href="/link" className="hover:text-ink transition-colors">
              Links
            </Link>
            <Link href="/worship" className="hover:text-ink transition-colors">
              Worship
            </Link>
            <Link href="/admin" className="hover:text-ink transition-colors">
              Admin
            </Link>
          </div>

          <p className="text-[10px] text-stone-light leading-relaxed">
            &copy; 2026 The Berean Upper Room Platform. Built with old-world weight.
          </p>
        </div>
      </footer>
    </main>
  );
}
