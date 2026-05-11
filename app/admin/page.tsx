import { cookies } from "next/headers";
import { getAdminStones } from "@/lib/actions";
import AdminLogin from "./AdminLogin";
import AdminStoneTable from "@/components/AdminStoneTable";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

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

  const stones = await getAdminStones();

  const pending = stones.filter((s) => !s.approved).length;
  const approved = stones.filter((s) => s.approved).length;
  const featured = stones.filter((s) => s.featured).length;

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Admin"
        subtitle="Review, approve, and manage stone submissions"
        backHref="/"
      />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: stones.length },
            { label: "Pending", value: pending, highlight: pending > 0 },
            { label: "Featured", value: featured },
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

        <AdminStoneTable stones={stones} />
      </div>
    </div>
  );
}
