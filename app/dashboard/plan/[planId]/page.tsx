import Link from "next/link";
import { getDiscussionsForPlan } from "@/lib/talk-actions";

export default async function DashboardPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const discussions = await getDiscussionsForPlan(planId);

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto">
      <div className="mb-10">
        <Link href="/dashboard" className="text-sm font-semibold tracking-widest text-[#c4893a] uppercase mb-4 inline-block hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-[#2d1f0e] mt-2" style={{ fontFamily: "var(--font-playfair)" }}>
          Plan Discussions
        </h1>
        <p className="text-[#7a5a3a] text-lg mt-2">Select a day to start reading and talking it over.</p>
      </div>

      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#e8d4b0] shadow-sm text-center">
            <h3 className="text-xl text-[#7a5a3a] font-medium mb-2">No discussions yet for this plan.</h3>
          </div>
        ) : (
          discussions.map((disc: any) => (
            <Link 
              key={disc.id} 
              href={`/dashboard/discussion/${disc.id}`}
              className="flex items-center justify-between bg-white p-6 rounded-xl border border-[#e8d4b0] shadow-sm hover:border-[#c4893a] transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                {disc.day_number && (
                  <span className="text-sm font-bold text-[#c4893a] bg-[#fdf8f0] px-4 py-1.5 rounded-full whitespace-nowrap">
                    Day {disc.day_number}
                  </span>
                )}
                <h3 className="text-xl font-semibold text-[#2d1f0e] group-hover:text-[#c4893a] transition-colors" style={{ fontFamily: "var(--font-playfair)" }}>
                  {disc.title}
                </h3>
              </div>
              <span className="text-[#c4893a] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all font-medium">
                Talk it over →
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
