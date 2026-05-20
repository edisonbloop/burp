import Link from "next/link";

export default function StonesRemembranceHome() {
  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum">
      {/* Top Banner with back to BURP link */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-stone uppercase hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← B U R P
          </Link>
          <span
            className="text-xs font-semibold tracking-wider text-gold-deep uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            100 Stones
          </span>
        </div>
      </div>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center flex-1 px-4 py-20 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)",
        }}
      >
        {/* Stone icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gold-soft opacity-30 absolute inset-0 scale-150" />
            <div className="relative w-16 h-16 rounded-full border-2 border-gold bg-vellum flex items-center justify-center text-3xl text-gold">
              ◎
            </div>
          </div>
        </div>

        <p
          className="text-xs font-semibold tracking-widest text-gold uppercase mb-3"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          BURP · 100 Days
        </p>

        <h1
          className="text-4xl sm:text-5xl font-bold text-ink mb-5 leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          100 Stones of
          <br className="hidden sm:block" /> Remembrance
        </h1>

        <p className="text-lg sm:text-xl text-stone-mid mb-6 max-w-xl leading-relaxed">
          A living memorial of what God has done through 100 days in His Word.
        </p>

        {/* Brand Dot-Divider */}
        <div className="flex items-center justify-center gap-2 mb-8 text-stone-light">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>

        <div className="max-w-md mx-auto mb-10">
          <blockquote className="text-stone text-sm leading-relaxed italic">
            &ldquo;…so that this may be a sign among you. When your children ask in time to
            come, &lsquo;What do these stones mean?&rsquo; then you shall tell them…&rdquo;
          </blockquote>
          <cite
            className="block mt-2 not-italic font-semibold text-xs tracking-wider uppercase text-gold-deep"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            — Joshua 4:6–7
          </cite>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link
            href="/submit"
            className="px-8 py-3.5 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors duration-200"
          >
            Submit Your Stone
          </Link>
          <Link
            href="/stones"
            className="px-8 py-3.5 rounded-full border border-stone-edge hover:border-gold text-stone hover:text-ink font-semibold text-sm tracking-wide transition-colors duration-200"
          >
            View the Stones
          </Link>
          <Link
            href="/talk-it-over"
            className="px-8 py-3.5 rounded-full border border-stone-edge hover:border-gold text-stone hover:text-ink font-semibold text-sm tracking-wide transition-colors duration-200"
          >
            Talk It Over
          </Link>
        </div>
      </section>

      {/* Explanation section */}
      <section className="bg-parchment-soft border-t border-stone-edge py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-ink mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What is a Stone of Remembrance?
          </h2>
          <p className="text-stone-mid text-sm leading-relaxed mb-6">
            In Joshua 4, after Israel crossed the Jordan, God commanded them to take
            twelve stones from the riverbed and build a memorial — one stone per tribe.
            Not as decoration. As a covenant with memory.
          </p>
          <p className="text-stone-mid text-sm leading-relaxed mb-6">
            Your stone is one thing God did, revealed, healed, taught, restored, or
            awakened in you during these 100 days in His Word. It is your testimony
            set in stone — so you don&apos;t forget, and so others can find courage in it.
          </p>
          
          <div className="flex items-center justify-center gap-2 my-6 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>

          <p
            className="text-sm font-semibold tracking-wider text-gold-deep uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            &ldquo;What stone of remembrance are you leaving from these 100 days?&rdquo;
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-6 px-4 text-center">
        <p className="text-xs text-stone">
          100 Stones of Remembrance · BURP ·{" "}
          <Link href="/admin" className="hover:text-ink transition-colors font-medium">
            Admin
          </Link>
        </p>
      </footer>
    </main>
  );
}
