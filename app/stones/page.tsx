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
            "radial-gradient(ellipse 100% 80% at 50% 0%, #f0d9b0 0%, #faf6ef 65%)",
        }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a96e28] hover:text-[#8a5420] tracking-wide uppercase mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: "linear-gradient(135deg, #f0d9b0, #e3be82)",
              color: "#8a5420",
              boxShadow: "0 4px 16px rgba(196,137,58,0.2)",
            }}
          >
            ◉
          </div>
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold text-[#2d1f0e] mb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          The Wall of Remembrance
        </h1>
        <p className="text-[#7a5a3a] max-w-md mx-auto leading-relaxed mb-6">
          Each stone is a testimony — one thing God did in someone during 100 days in His Word.
        </p>

        {/* Stone count stat */}
        {stones.length > 0 && (
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#e3be82]" />
            <span
              className="text-3xl font-bold text-[#c4893a]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {stones.length}
            </span>
            <span className="text-sm text-[#a96e28] font-medium">
              stone{stones.length === 1 ? "" : "s"} set
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#e3be82]" />
          </div>
        )}
      </section>

      {/* Decorative divider */}
      <div className="flex items-center gap-0 overflow-hidden h-[2px]">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #faf6ef, #e3be82)" }} />
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, #faf6ef, #e3be82)" }} />
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
        className="border-t border-[#e8d4b0] py-12 px-4 text-center"
        style={{ background: "linear-gradient(to bottom, #fdf8f0, #faf6ef)" }}
      >
        <p
          className="text-sm font-semibold tracking-widest uppercase text-[#c4893a] mb-2"
        >
          Your stone belongs here
        </p>
        <p
          className="text-2xl font-bold text-[#2d1f0e] mb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          What did God do in you?
        </p>
        <p className="text-sm text-[#7a5a3a] mb-6 max-w-sm mx-auto">
          Your remembrance matters. Add it to the memorial.
        </p>
        <Link
          href="/submit"
          className="inline-block px-8 py-3.5 rounded-2xl font-semibold text-white transition-colors"
          style={{ background: "linear-gradient(135deg, #c4893a, #a96e28)" }}
        >
          Submit Your Stone
        </Link>
      </div>
    </div>
  );
}
