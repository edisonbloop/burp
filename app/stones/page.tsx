import { getPublicStones } from "@/lib/actions";
import StonesGrid from "@/components/StonesGrid";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

export const revalidate = 60;

export default async function StonesPage() {
  const stones = await getPublicStones();

  return (
    <div className="flex-1 flex flex-col">

      {/* Page hero */}
      <section
        className="py-16 px-4 text-center"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
        }}
      >
        <Link
          href="/100stones"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone hover:text-ink tracking-widest uppercase mb-8 transition-colors duration-140"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          ← Back to 100 Stones
        </Link>

        <div className="flex justify-center mb-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{
              background: "linear-gradient(135deg, var(--color-gold-wash), var(--color-gold-soft))",
              color: "var(--color-gold-deep)",
              boxShadow: "0 4px 16px rgba(184,146,74,0.15)",
            }}
          >
            ◎
          </div>
        </div>

        <h1
          className="text-3.5xl sm:text-4xl font-bold text-ink mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Wall of Remembrance
        </h1>
        <p className="text-stone-mid text-xs max-w-md mx-auto leading-relaxed mb-6">
          Each stone is a testimony — one thing God did in someone during 100 days in His Word.
        </p>

        {/* Stone count stat */}
        {stones.length > 0 && (
          <div className="inline-flex items-center gap-3 text-stone-light">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-stone-edge" />
            <span
              className="text-2xl font-light text-gold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {stones.length}
            </span>
            <span
              className="text-[10px] text-gold-deep font-semibold tracking-wider uppercase"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              stone{stones.length === 1 ? "" : "s"} set
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-stone-edge" />
          </div>
        )}
      </section>

      {/* Decorative divider */}
      <div className="flex items-center gap-0 overflow-hidden h-[1px] bg-stone-edge opacity-60">
      </div>

      {/* Stones */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12">
        {stones.length === 0 ? (
          <EmptyState
            title="The memorial is being built"
            description="No stones have been approved yet. Once participants submit and organizers approve them, they will appear here."
            icon="◎"
          />
        ) : (
          <StonesGrid stones={stones} />
        )}
      </div>

      {/* CTA footer */}
      <div
        className="border-t border-stone-edge py-12 px-4 text-center"
        style={{ background: "linear-gradient(to bottom, var(--color-parchment-soft), var(--color-vellum))" }}
      >
        <p
          className="text-[10px] font-bold tracking-widest uppercase text-gold-deep mb-2"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Your stone belongs here
        </p>
        <p
          className="text-2xl font-bold text-ink mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What did God do in you?
        </p>
        <p className="text-xs text-stone-mid mb-6 max-w-sm mx-auto leading-relaxed">
          Your remembrance matters. Add it to the memorial.
        </p>
        <Link
          href="/submit"
          className="inline-block px-8 py-3.5 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-xs tracking-wide transition-colors duration-200"
        >
          Submit Your Stone
        </Link>
      </div>
    </div>
  );
}

