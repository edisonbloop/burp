import { getReadingPlans } from "@/lib/talk-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const plans = await getReadingPlans();

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#c4893a] mb-1">
          Welcome back
        </p>
        <h1
          className="text-4xl font-bold text-[#2d1f0e] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Your Dashboard
        </h1>
        <p className="text-[#7a5a3a]">
          Pick up where you left off in your reading and discussion.
        </p>
      </header>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <Link
          href="/stones"
          className="bg-white rounded-2xl border border-[#e8d4b0] p-5 hover:border-[#c4893a] hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">◉</div>
          <p className="font-semibold text-[#2d1f0e] group-hover:text-[#c4893a] transition-colors text-sm">
            Wall of Remembrance
          </p>
          <p className="text-xs text-[#7a5a3a] mt-1">View all stones</p>
        </Link>
        <Link
          href="/submit"
          className="bg-white rounded-2xl border border-[#e8d4b0] p-5 hover:border-[#c4893a] hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">🪨</div>
          <p className="font-semibold text-[#2d1f0e] group-hover:text-[#c4893a] transition-colors text-sm">
            Submit Your Stone
          </p>
          <p className="text-xs text-[#7a5a3a] mt-1">Add your remembrance</p>
        </Link>
      </div>

      {/* Reading plans */}
      <div>
        <h2
          className="text-2xl font-bold text-[#2d1f0e] mb-6"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Reading Plans
        </h2>

        {plans.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#e8d4b0] text-center">
            <p className="text-[#7a5a3a]">No reading plans yet.</p>
            <p className="text-sm text-[#c4b090] mt-1">
              An organizer will add one soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan: { id: string; title: string; description?: string }) => (
              <Link
                key={plan.id}
                href={`/talk-it-over/${plan.id}`}
                className="block bg-white p-6 rounded-2xl border border-[#e8d4b0] shadow-sm hover:border-[#c4893a] hover:shadow-md transition-all group"
              >
                <h3
                  className="text-xl font-semibold text-[#2d1f0e] mb-2 group-hover:text-[#c4893a] transition-colors"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {plan.title}
                </h3>
                {plan.description && (
                  <p className="text-sm text-[#7a5a3a] line-clamp-2">
                    {plan.description}
                  </p>
                )}
                <p className="text-xs text-[#c4893a] font-medium mt-4">
                  View discussions →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
