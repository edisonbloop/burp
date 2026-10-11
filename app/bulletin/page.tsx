import Link from "next/link";
import { getPublicBulletinPosts } from "@/lib/bulletin-actions";
import BulletinBoardClient from "@/components/BulletinBoardClient";
import AuthMenu from "@/components/AuthMenu";

export const revalidate = 0; // Always dynamic so new posts show immediately

export default async function BulletinPage() {
  const posts = await getPublicBulletinPosts();
  const stats: [string, string][] = [
    [String(posts.length), "posts"],
    [String(posts.filter((p) => p.category === "event").length), "events"],
    [String(posts.filter((p) => p.category === "service" || p.category === "product").length), "offerings"],
  ];

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      {/* Navigation Header */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← B U R P
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/bulletin/submit"
              className="px-4 py-2 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-xs tracking-widest transition-colors duration-140 uppercase"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Post to Bulletin
            </Link>
            <AuthMenu />
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-vellum border-b border-gold/20">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 90% at 90% 0%, rgba(184,146,74,0.28), transparent 70%), radial-gradient(40% 60% at 0% 100%, rgba(217,185,120,0.12), transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <span
              className="text-[10px] font-bold tracking-[0.3em] text-gold-soft uppercase block mb-4"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              The Members&rsquo; Board
            </span>
            <h1
              className="text-5xl sm:text-7xl font-bold mb-5 tracking-tight leading-[1.02]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              BURP <span className="italic text-gold-soft">Bulletin</span>
            </h1>
            <p className="text-sm sm:text-base text-[#d4c4ae] max-w-xl leading-relaxed mb-8">
              A community noticeboard for the body. Share your events, promotions, products and services — and
              discover what fellow members are building, hosting, and offering.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/bulletin/submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold hover:bg-gold-soft text-ink text-xs font-bold tracking-[0.15em] uppercase transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Post to the board <span aria-hidden>→</span>
              </Link>
              <a
                href="#board"
                className="px-8 py-3.5 rounded-full border border-white/25 hover:border-gold text-[#d4c4ae] hover:text-gold text-xs font-bold tracking-[0.15em] uppercase transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Browse posts
              </a>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/10 bg-white/10 text-center">
            {stats.map(([big, small]) => (
              <div key={small} className="bg-ink/60 px-5 sm:px-7 py-5">
                <dt className="text-2xl sm:text-3xl font-bold text-gold-soft" style={{ fontFamily: "var(--font-display)" }}>
                  {big}
                </dt>
                <dd className="text-[10px] uppercase tracking-widest text-[#d4c4ae] mt-1">{small}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Board */}
      <section id="board" className="flex-1 scroll-mt-4 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12">
        <BulletinBoardClient initialPosts={posts} />
      </section>

      {/* Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p
          className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          BURP Bulletin · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
