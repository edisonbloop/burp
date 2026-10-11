import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import TalkItOverPlansClient from "@/components/TalkItOverPlansClient";
import TalkItOverSidebar from "@/components/TalkItOverSidebar";
import { getReadingPlansWithStats } from "@/lib/talk-actions";
import { getCurrentDayNumber } from "@/lib/day-number";
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
  const currentDayNumber = getCurrentDayNumber();
  const todayPlan = plans.find((p) => p.day_number === currentDayNumber) ?? null;
  const totalDiscussions = plans.reduce((sum, p) => sum + p.discussion_count, 0);
  const stats: [string, string][] = [
    [`Day ${currentDayNumber}`, "of 365"],
    [String(plans.length), "plans"],
    [String(totalDiscussions), "reflections"],
  ];

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <PageHeader title="Burp It" subtitle="Feast on the Word together, then burp what you found." />

      <section className="relative overflow-hidden bg-ink text-vellum">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 80% at 85% 0%, rgba(184,146,74,0.28), transparent 70%), radial-gradient(40% 60% at 0% 100%, rgba(217,185,120,0.12), transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <p
              className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-soft mb-4"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Daily Scripture · Honest Reflection
            </p>
            <h2
              className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Feast on the Word.
              <br />
              <span className="italic text-gold-soft">Then burp what you found.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#d4c4ae] leading-relaxed max-w-xl mb-8">
              Read the day&apos;s passage, then share what challenged, confused, or stirred you. Every day has its own open thread.
            </p>
            {todayPlan && (
              <Link
                href={`/burp-it/${todayPlan.id}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold hover:bg-gold-soft text-ink text-xs font-bold tracking-[0.15em] uppercase transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Read &amp; discuss today <span aria-hidden>→</span>
              </Link>
            )}
          </div>

          <dl className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/10 bg-white/10 text-center">
            {stats.map(([big, small]) => (
              <div key={small} className="bg-ink/60 backdrop-blur px-5 sm:px-7 py-5">
                <dt className="text-2xl sm:text-3xl font-bold text-gold-soft" style={{ fontFamily: "var(--font-display)" }}>
                  {big}
                </dt>
                <dd className="text-[10px] uppercase tracking-widest text-[#d4c4ae] mt-1">{small}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12 items-start">
          <TalkItOverPlansClient plans={plans} currentDayNumber={currentDayNumber} />
          <TalkItOverSidebar plans={plans} currentDayNumber={currentDayNumber} />
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
