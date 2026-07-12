import Link from "next/link";
import { getPublicBulletinPosts } from "@/lib/bulletin-actions";
import BulletinBoardClient from "@/components/BulletinBoardClient";
import AuthMenu from "@/components/AuthMenu";

export const revalidate = 0; // Always dynamic so new posts show immediately

export default async function BulletinPage() {
  const posts = await getPublicBulletinPosts();

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
      <section
        className="py-16 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <span
            className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            The Members&rsquo; Board
          </span>
          <h1
            className="text-4xl sm:text-6xl font-bold text-ink mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BURP Bulletin
          </h1>
          <p className="text-stone-mid text-sm max-w-xl mx-auto leading-relaxed mb-4">
            A community noticeboard for the body. Share your events, promotions,
            products and services — and discover what fellow members are
            building, hosting, and offering.
          </p>
          <div className="flex items-center justify-center gap-2 mb-2 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        </div>
      </section>

      {/* Board */}
      <section className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12">
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
