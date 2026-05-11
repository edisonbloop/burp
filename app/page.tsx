import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #f0d9b0 0%, #faf6ef 70%)",
        }}
      >
        {/* Stone icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#e3be82] opacity-30 absolute inset-0 scale-150" />
            <div className="relative w-20 h-20 rounded-full border-2 border-[#c4893a] bg-[#fdf8f0] flex items-center justify-center text-3xl text-[#c4893a]">
              ◉
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold tracking-widest text-[#c4893a] uppercase mb-4">
          BURP · 100 Days
        </p>

        <h1
          className="text-4xl sm:text-6xl font-bold text-[#2d1f0e] mb-5 leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          100 Stones of
          <br className="hidden sm:block" /> Remembrance
        </h1>

        <p className="text-xl sm:text-2xl text-[#7a5a3a] mb-6 max-w-xl leading-relaxed">
          A living memorial of what God has done through 100 days in His Word.
        </p>

        <p className="text-[#a96e28] max-w-md text-sm leading-relaxed mb-10 italic">
          &ldquo;…so that this may be a sign among you. When your children ask in time to
          come, &lsquo;What do these stones mean?&rsquo; then you shall tell them…&rdquo;
          <span className="block mt-1 not-italic font-medium">— Joshua 4:6–7</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/submit"
            className="px-8 py-4 rounded-2xl bg-[#c4893a] hover:bg-[#a96e28] text-white font-semibold text-base transition-colors shadow-md shadow-[#c4893a]/20"
          >
            Submit Your Stone
          </Link>
          <Link
            href="/stones"
            className="px-8 py-4 rounded-2xl border-2 border-[#e3be82] hover:border-[#c4893a] text-[#7a5a3a] hover:text-[#4d2c11] font-semibold text-base transition-colors"
          >
            View the Stones
          </Link>
        </div>
      </section>

      {/* Explanation section */}
      <section className="bg-white border-t border-[#e8d4b0] py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-[#2d1f0e] mb-5"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            What is a Stone of Remembrance?
          </h2>
          <p className="text-[#7a5a3a] leading-relaxed mb-6">
            In Joshua 4, after Israel crossed the Jordan, God commanded them to take
            twelve stones from the riverbed and build a memorial — one stone per tribe.
            Not as decoration. As a covenant with memory.
          </p>
          <p className="text-[#7a5a3a] leading-relaxed mb-6">
            Your stone is one thing God did, revealed, healed, taught, restored, or
            awakened in you during these 100 days in His Word. It is your testimony
            set in stone — so you don&apos;t forget, and so others can find courage in it.
          </p>
          <p className="text-[#a96e28] italic font-medium">
            &ldquo;What stone of remembrance are you leaving from these 100 days?&rdquo;
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#fdf8f0] border-t border-[#e8d4b0] py-6 px-4 text-center">
        <p className="text-xs text-[#c4b090]">
          100 Stones of Remembrance · BURP ·{" "}
          <Link href="/admin" className="hover:text-[#7a5a3a] transition-colors">
            Admin
          </Link>
        </p>
      </footer>
    </main>
  );
}
