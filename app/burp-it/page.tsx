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

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <PageHeader title="Burp It" subtitle="Feast on the Word together, then burp what you found." />

      <section className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
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
