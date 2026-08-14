"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteWorshipAttendance } from "@/lib/worship-actions";
import type { WorshipAttendance } from "@/types/worship";

export default function AdminWorshipAttendancePanel({
  records,
}: {
  records: WorshipAttendance[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      (r.email?.toLowerCase().includes(q) ?? false) ||
      (r.phone?.toLowerCase().includes(q) ?? false)
    );
  });

  const totalHeadcount = records.reduce((sum, r) => sum + r.guest_count, 0);

  function del(id: string) {
    if (!confirm("Delete this attendance record?")) return;
    setError("");
    startTransition(async () => {
      const result = await adminDeleteWorshipAttendance(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function exportCsv() {
    const headers = ["Name", "Email", "Phone", "Guests", "Notes", "Checked in"];
    const rows = filtered.map((r) => [
      r.full_name,
      r.email ?? "",
      r.phone ?? "",
      String(r.guest_count),
      (r.notes ?? "").replace(/"/g, '""'),
      new Date(r.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worship-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-stone-edge bg-white p-4 text-center">
          <div className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {records.length}
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase mt-1 text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
            Check-ins
          </div>
        </div>
        <div className="rounded-2xl border border-stone-edge bg-white p-4 text-center">
          <div className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {totalHeadcount}
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase mt-1 text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
            Total Headcount
          </div>
        </div>
        <div className="rounded-2xl border border-gold-soft bg-gold-wash/30 p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-stone-mid leading-relaxed">
            Venue form:{" "}
            <a href="/worship/attend" target="_blank" rel="noopener noreferrer" className="text-gold-deep font-semibold hover:underline">
              burp.ink/worship/attend
            </a>
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="text-xs px-4 py-2.5 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Export CSV
        </button>
      </div>

      <p className="text-sm text-stone-mid mb-4 font-medium">
        {filtered.length} record{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm italic">
          No venue check-ins yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 rounded-xl border border-stone-edge bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-ink text-sm" style={{ fontFamily: "var(--font-display)" }}>
                    {r.full_name}
                  </span>
                  {r.guest_count > 1 && (
                    <span className="text-[10px] font-bold text-stone-mid bg-stone-edge/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      party of {r.guest_count}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-stone-mid">
                  {r.email && <span className="font-mono">{r.email}</span>}
                  {r.phone && (
                    <>
                      {r.email && <span>·</span>}
                      <span>{r.phone}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>
                    {new Date(r.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {r.notes && <p className="mt-1 text-xs text-stone-mid italic">{r.notes}</p>}
              </div>
              <button
                type="button"
                onClick={() => del(r.id)}
                disabled={isPending}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex-shrink-0"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
