import { cookies } from "next/headers";
import { getAdminStones } from "@/lib/actions";
import { getSupabase } from "@/lib/supabase";
import { getLibraryItems } from "@/lib/library-actions";
import { getAdminSharehouseNeeds } from "@/lib/sharehouse-actions";
import { adminGetAttributes, adminGetReferences } from "@/lib/admin-attribute-actions";
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

  const [
    stones,
    plans,
    libraryItems,
    sharehouseNeeds,
    godAttributes,
    godReferences,
  ] = await Promise.all([
    getAdminStones(),
    getPlansWithDiscussions(),
    getLibraryItems(undefined, undefined, undefined, true),
    getAdminSharehouseNeeds(),
    adminGetAttributes(),
    adminGetReferences(),
  ]);

  const pendingStones = stones.filter((s) => !s.approved).length;
  const totalDiscs = plans.reduce(
    (sum: number, p: { discussions: unknown[] }) => sum + p.discussions.length,
    0
  );
  const pendingLibrary = libraryItems.filter((i) => !i.approved).length;
  const pendingSharehouse = sharehouseNeeds.filter((n) => !n.approved).length;
  const pendingAttributes =
    godAttributes.filter((a) => !a.approved).length +
    godReferences.filter((r) => !r.approved).length;

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Admin"
        subtitle="Manage remembrance stones, reading plans, libraries, care requests, and attributes"
        backHref="/"
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Responsive Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Stones", value: stones.length },
            { label: "Pending Stones", value: pendingStones, highlight: pendingStones > 0 },
            { label: "Plans", value: plans.length },
            { label: "Discussions", value: totalDiscs },
            { label: "Library Items", value: libraryItems.length },
            { label: "Pending Library", value: pendingLibrary, highlight: pendingLibrary > 0 },
            { label: "Care Needs", value: sharehouseNeeds.length },
            { label: "Pending Needs", value: pendingSharehouse, highlight: pendingSharehouse > 0 },
            { label: "God Attributes", value: godAttributes.length },
            { label: "Pending Attributes", value: pendingAttributes, highlight: pendingAttributes > 0 },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`rounded-2xl border p-4 text-center ${
                highlight ? "border-amber-200 bg-amber-50" : "border-stone-edge bg-white"
              }`}
            >
              <div
                className={`text-3xl font-bold tracking-tight ${highlight ? "text-amber-700" : "text-ink"}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value}
              </div>
              <div
                className="text-[10px] font-bold tracking-widest uppercase mt-1 text-stone-light"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        <AdminTabs
          stones={stones}
          plans={plans}
          libraryItems={libraryItems}
          sharehouseNeeds={sharehouseNeeds}
          godAttributes={godAttributes}
          godReferences={godReferences}
        />
      </div>
    </div>
  );
}
