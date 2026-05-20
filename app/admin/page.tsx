import { cookies } from "next/headers";
import { getAdminStones } from "@/lib/actions";
import { getSupabase } from "@/lib/supabase";
import { getLibraryItems } from "@/lib/library-actions";
import AdminLogin from "./AdminLogin";
import AdminTabs from "./AdminTabs";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

async function getPlansWithDiscussions() {
  try {
    const supabase = getSupabase();
    const { data: plans, error } = await supabase
      .from("reading_plans")
      .select("*, discussions(*)")
      .order("created_at", { ascending: true });

    if (error) return [];

    // Sort discussions within each plan by day_number
    return (plans ?? []).map((plan) => ({
      ...plan,
      discussions: (plan.discussions ?? []).sort(
        (a: { day_number: number | null }, b: { day_number: number | null }) =>
          (a.day_number ?? 9999) - (b.day_number ?? 9999)
      ),
    }));
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated =
    cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col">
        <PageHeader title="Admin" backHref="/" />
        <AdminLogin />
      </div>
    );
  }

  const [stones, plans, libraryItems] = await Promise.all([
    getAdminStones(),
    getPlansWithDiscussions(),
    getLibraryItems(undefined, undefined, undefined, true),
  ]);

  const pending = stones.filter((s) => !s.approved).length;
  const featured = stones.filter((s) => s.featured).length;
  const totalDiscs = plans.reduce(
    (sum: number, p: { discussions: unknown[] }) => sum + p.discussions.length,
    0
  );
  const pendingLibrary = libraryItems.filter((i) => !i.approved).length;

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Admin"
        subtitle="Manage stones, reading plans, and discussions"
        backHref="/"
      />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: "Stones", value: stones.length },
            { label: "Pending Stones", value: pending, highlight: pending > 0 },
            { label: "Plans", value: plans.length },
            { label: "Discussions", value: totalDiscs },
            { label: "Library Items", value: libraryItems.length },
            { label: "Pending Library", value: pendingLibrary, highlight: pendingLibrary > 0 },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`rounded-xl border p-4 text-center ${
                highlight
                  ? "border-amber-200 bg-amber-50"
                  : "border-[#e8d4b0] bg-white"
              }`}
            >
              <div
                className={`text-2xl font-bold ${
                  highlight ? "text-amber-700" : "text-[#2d1f0e]"
                }`}
              >
                {value}
              </div>
              <div className="text-xs text-[#7a5a3a] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <AdminTabs stones={stones} plans={plans} libraryItems={libraryItems} />
      </div>
    </div>
  );
}
