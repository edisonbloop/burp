import TalkItOverBackHeader from "@/components/TalkItOverBackHeader";
import TalkItOverPlansClient from "@/components/TalkItOverPlansClient";
import TalkItOverSidebar from "@/components/TalkItOverSidebar";
import { getReadingPlansWithStats } from "@/lib/talk-actions";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Burp It — BURP",
  description:
    "Bible plans, open threads, and honest reflections — feast on the Word together, then burp what you found.",
  openGraph: {
    title: "Burp It — BURP",
    description:
      "Share thoughts, questions, and reflections on Bible plans and devotional threads.",
    url: "https://www.burp.ink/burp-it",
    siteName: "BURP — Berean Upper Room Platform",
    type: "website",
  },
  alternates: { canonical: "https://www.burp.ink/burp-it" },
};

export default async function BurpItPage() {
  const plans = await getReadingPlansWithStats();

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <TalkItOverBackHeader />

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
            Acts 17:11 · Feast · Reflect · Burp
          </span>
          <h1
            className="text-4xl sm:text-6xl font-bold text-ink mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Burp It
          </h1>
          <p className="text-stone-mid text-sm max-w-xl mx-auto leading-relaxed mb-4">
            Bible plans, open threads, and honest reflections — feast on the Word together,
            then burp what you found.
          </p>
          <div className="flex items-center justify-center gap-2 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        </div>
      </section>

      <section className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12 items-start">
          <TalkItOverPlansClient plans={plans} />
          <TalkItOverSidebar plans={plans} />
        </div>
      </section>

      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p
          className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          BURP · Burp It · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
