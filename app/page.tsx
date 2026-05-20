import Image from "next/image";
import Link from "next/link";

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
      {/* Brand Navigation Bar */}
      <header className="border-b border-stone-edge bg-parchment-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logomain.png"
              alt="BURP Logo"
              width={160}
              height={40}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/talk-it-over"
              className="text-xs font-semibold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Talk It Over
            </Link>
            <Link
              href="/library"
              className="text-xs font-semibold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Library
            </Link>
            <Link
              href="/100stones"
              className="text-xs font-semibold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              100 Stones
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-24 px-4 sm:px-6 text-center"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)",
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Square stacked logo / Avatar */}
          <div className="mb-8">
            <Image
              src="/logosquare.png"
              alt="BURP Icon"
              width={100}
              height={100}
              priority
              className="h-24 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <p
            className="text-xs font-semibold tracking-widest text-gold-deep uppercase mb-4"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            THE BEREAN UPPER ROOM PLATFORM
          </p>

          <h1
            className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A room to feast on Scripture —
            <br />
            and to honestly say what you found.
          </h1>

          <p className="text-base sm:text-lg text-stone-mid max-w-2xl leading-relaxed mb-8">
            A faith-centered community for Christians who love God's Word, study it
            deeply, and gather to reflect honestly. We feast on Scripture daily,
            then come together to &ldquo;burp&rdquo; — sharing what challenged,
            confused, or stirred us.
          </p>

          {/* Signature Dot-Divider */}
          <div className="flex items-center justify-center gap-2 mb-10 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/talk-it-over"
              className="px-8 py-3.5 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors duration-200"
            >
              Share a reflection
            </Link>
            <Link
              href="/100stones"
              className="px-8 py-3.5 rounded-full border border-stone-edge hover:border-gold text-stone hover:text-ink font-semibold text-sm tracking-wide transition-colors duration-200"
            >
              100 Stones of remembrance
            </Link>
          </div>
        </div>
      </section>

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

      {/* Dual Portals (Talk It Over vs 100 Stones) */}
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

          <div className="grid md:grid-cols-3 gap-8">
            {/* Talk It Over Portal */}
            <div className="bg-vellum p-8 rounded-3xl border border-stone-edge hover:border-gold transition-all duration-220 flex flex-col justify-between">
              <div>
                <span
                  className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  COMMUNITY DISCUSSION
                </span>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Talk It Over
                </h3>
                <p className="text-xs text-stone-mid leading-relaxed mb-6">
                  Engage with Bible reading plans and devotional threads. Share what stood out,
                  discuss with other readers in your Upper Room, and ask honest questions.
                </p>
              </div>
              <Link
                href="/talk-it-over"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-gold-deep hover:text-gold transition-colors duration-140 tracking-wider"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Join discussion plans <span className="text-sm font-sans">→</span>
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
            <Link href="/talk-it-over" className="hover:text-ink transition-colors">
              Talk It Over
            </Link>
            <Link href="/library" className="hover:text-ink transition-colors">
              Library
            </Link>
            <Link href="/100stones" className="hover:text-ink transition-colors">
              100 Stones
            </Link>
            <Link href="/stones" className="hover:text-ink transition-colors">
              The Wall
            </Link>
            <Link href="/submit" className="hover:text-ink transition-colors">
              Submit Stone
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
