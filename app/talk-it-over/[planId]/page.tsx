import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussionsForPlan, getPlan } from "@/lib/talk-actions";

export const revalidate = 0;

export default async function PlanDiscussionsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const [plan, discussions] = await Promise.all([
    getPlan(planId),
    getDiscussionsForPlan(planId),
  ]);

  if (!plan) notFound();

  return (
    <main className="flex-1 min-h-screen bg-vellum text-ink pb-20">
      {/* Header */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/talk-it-over"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← Back to Plans
          </Link>
        </div>
      </div>

      {/* Plan hero */}
      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
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
            Reading Plan
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold text-ink mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {plan.title}
          </h1>
          {plan.description && (
            <p className="text-stone-mid text-sm max-w-xl mx-auto leading-relaxed">
              {plan.description}
            </p>
          )}
        </div>
      </section>

      {/* Discussions list */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-3">
        {discussions.length === 0 ? (
          <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge">
            <p className="text-stone-mid text-sm italic">No discussions yet for this plan.</p>
          </div>
        ) : (
          discussions.map((disc: { id: string; day_number?: number | null; title: string; content?: string | null }) => (
            <Link
              key={disc.id}
              href={`/talk-it-over/discussion/${disc.id}`}
              className="flex items-center justify-between bg-parchment-soft px-6 py-5 rounded-2xl border border-stone-edge hover:border-gold hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 min-w-0">
                {disc.day_number && (
                  <span
                    className="text-[10px] font-bold text-gold-deep bg-gold-wash px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Day {disc.day_number}
                  </span>
                )}
                <h3
                  className="text-lg font-semibold text-ink group-hover:text-gold-deep transition-colors truncate"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {disc.title}
                </h3>
              </div>
              <span className="text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4">
                →
              </span>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
