import type { Metadata } from "next";
import Link from "next/link";
import { getTopics } from "@/lib/library-actions";
import LibrarySubmitForm from "@/components/LibrarySubmitForm";
import PageHeader from "@/components/PageHeader";

export const revalidate = 0; // Fresh dynamic queries on every load

export const metadata: Metadata = {
  title: "Submit Content — BURP Library",
  description: "Contribute poems, write-ups, devotionals, and long teachings to the Berean Upper Room Platform's spiritual content library.",
};

interface PageProps {
  searchParams: Promise<{ type?: string; topic?: string }>;
}

export default async function LibrarySubmitPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const type = resolvedSearchParams.type || "";
  const topic = resolvedSearchParams.topic || "";

  // Pre-fetch all available topic categories in alphabetical order
  const topics = await getTopics();

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      {/* Page Header Component */}
      <PageHeader
        title="Submit Content"
        subtitle="Contribute to the spiritual archive"
        backHref="/library"
        backLabel="Return to Library"
      />

      <section className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span
            className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            CONTRIBUTION GATEWAY
          </span>
          <h2
            className="text-3.5xl sm:text-4.5xl font-bold text-ink mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Offerings of the mind & heart
          </h2>
          <p className="text-stone-mid text-xs leading-relaxed">
            Every poem, reflection, devotional outline, or sermon contributes to our collective feast.
            Verify your findings by Scripture, sit with your reflection, and set it down.
          </p>

          {/* Signature Dot-Divider */}
          <div className="flex items-center justify-center gap-2 mt-6 text-stone-light">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
        </div>

        {/* Dynamic Interactive Submission Form */}
        <LibrarySubmitForm
          initialTopics={topics}
          initialType={type}
          initialTopic={topic}
        />
      </section>

      {/* Brand Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center mt-20">
        <p className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
          BURP Content Library · Submit Spiritual Material
        </p>
      </footer>
    </main>
  );
}
