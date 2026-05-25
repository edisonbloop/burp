import Link from "next/link";
import { getPublicSharehouseNeeds } from "@/lib/sharehouse-actions";
import SharehousePortalClient from "@/components/SharehousePortalClient";

export const revalidate = 0; // Always dynamic to display new needs & testimonies

export default async function SharehousePage() {
  const needs = await getPublicSharehouseNeeds();

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
              href="/sharehouse/submit"
              className="px-4 py-2 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-xs tracking-wide transition-colors duration-140 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Share a Need
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
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
            Acts 2:44-45 · Galatians 6:2
          </span>
          <h1
            className="text-4xl sm:text-6xl font-bold text-ink mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BURP Sharehouse
          </h1>
          <p className="text-stone-mid text-sm max-w-xl mx-auto leading-relaxed mb-4">
            A sacred space for the Berean community to lay down tangible, physical, and emotional burdens. Here, we practice the radical generosity of the early church — caring for one another openly or anonymously.
          </p>
          <div className="flex items-center justify-center gap-2 mb-2 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        </div>
      </section>

      {/* Interactive Portal Wrapper */}
      <section className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12">
        <SharehousePortalClient initialNeeds={needs} />
      </section>

      {/* Brand Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
          BURP Sharehouse · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
