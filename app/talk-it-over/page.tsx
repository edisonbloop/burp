import Link from "next/link";
import { getReadingPlans } from "@/lib/talk-actions";

export const revalidate = 0;

export default async function TalkItOverPage() {
  const plans = await getReadingPlans();

  return (
    <main className="flex-1 min-h-screen bg-vellum text-ink pb-20">
      {/* Header */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← B U R P
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <span
            className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Community Discussion
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold text-ink mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Talk It Over
          </h1>
          <p className="text-stone-mid text-sm max-w-md mx-auto leading-relaxed">
            Bible reading plans and devotional threads — feast on the Word together.
          </p>
        </div>
      </section>

      {/* Plans grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {plans.length === 0 ? (
          <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge">
            <p className="text-stone-mid text-sm italic mb-2">No discussion plans yet.</p>
            <p className="text-xs text-stone-light">Check back soon — new plans are coming!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {plans.map((plan: { id: string; title: string; description?: string | null }) => (
              <Link
                key={plan.id}
                href={`/talk-it-over/${plan.id}`}
                className="group bg-parchment-soft p-8 rounded-3xl border border-stone-edge hover:border-gold hover:shadow-md transition-all duration-220 flex flex-col justify-between"
              >
                <div>
                  <span
                    className="text-[9px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Reading Plan
                  </span>
                  <h3
                    className="text-2xl font-bold text-ink mb-3 group-hover:text-gold-deep transition-colors tracking-tight leading-snug"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {plan.title}
                  </h3>
                  {plan.description && (
                    <p className="text-sm text-stone-mid leading-relaxed line-clamp-3">
                      {plan.description}
                    </p>
                  )}
                </div>
                <div
                  className="mt-8 flex items-center gap-1 text-[10px] font-bold tracking-wider text-stone group-hover:text-ink uppercase transition-colors"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  <span>View Discussions</span>
                  <span className="text-sm font-sans leading-none transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
