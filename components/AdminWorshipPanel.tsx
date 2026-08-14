"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminDeleteWorshipRsvp,
  adminSendWorshipLivestreamEmail,
} from "@/lib/worship-actions";
import type { WorshipRsvp, WorshipAttendance } from "@/types/worship";
import AdminWorshipAttendancePanel from "@/components/AdminWorshipAttendancePanel";

export default function AdminWorshipPanel({
  rsvps,
  attendance,
}: {
  rsvps: WorshipRsvp[];
  attendance: WorshipAttendance[];
}) {
  const [section, setSection] = useState<"livestream" | "venue">("livestream");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [linkUrl, setLinkUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sentInfo, setSentInfo] = useState("");

  const filtered = rsvps.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  const totalGuests = rsvps.reduce((sum, r) => sum + r.guest_count, 0);
  const notNotified = rsvps.filter((r) => !r.notified).length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    const allSelected = filtered.every((r) => selected.has(r.id));
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  }

  function selectNotNotified() {
    setSelected(new Set(rsvps.filter((r) => !r.notified).map((r) => r.id)));
  }

  function del(id: string) {
    if (!confirm("Delete this RSVP? This cannot be undone.")) return;
    setError("");
    startTransition(async () => {
      const result = await adminDeleteWorshipRsvp(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function sendLink() {
    setError("");
    setSentInfo("");
    if (!linkUrl.trim()) {
      setError("Enter a livestream link first.");
      return;
    }
    if (selected.size === 0) {
      setError("Select at least one recipient.");
      return;
    }
    startTransition(async () => {
      const result = await adminSendWorshipLivestreamEmail(
        Array.from(selected),
        linkUrl,
        message || undefined
      );
      if (result.error) setError(result.error);
      else {
        setSentInfo(`Sent to ${result.sent ?? 0} recipient${result.sent === 1 ? "" : "s"}.`);
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Livestream vs venue */}
      <div className="flex gap-1 mb-6 bg-parchment-soft rounded-xl p-1 border border-stone-edge w-fit">
        <button
          type="button"
          onClick={() => setSection("livestream")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            section === "livestream"
              ? "bg-white text-ink shadow-sm border border-stone-edge"
              : "text-stone-mid hover:text-ink"
          }`}
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Livestream RSVPs ({rsvps.length})
        </button>
        <button
          type="button"
          onClick={() => setSection("venue")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            section === "venue"
              ? "bg-white text-ink shadow-sm border border-stone-edge"
              : "text-stone-mid hover:text-ink"
          }`}
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Venue Attendance ({attendance.length})
        </button>
      </div>

      {section === "venue" ? (
        <AdminWorshipAttendancePanel records={attendance} />
      ) : (
        <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-stone-edge bg-white p-4 text-center">
          <div className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {rsvps.length}
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase mt-1 text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
            RSVPs
          </div>
        </div>
        <div className="rounded-2xl border border-stone-edge bg-white p-4 text-center">
          <div className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {totalGuests}
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase mt-1 text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
            Total Guests
          </div>
        </div>
        <div className={`rounded-2xl border p-4 text-center ${notNotified > 0 ? "border-amber-200 bg-amber-50" : "border-stone-edge bg-white"}`}>
          <div className={`text-2xl font-bold ${notNotified > 0 ? "text-amber-700" : "text-ink"}`} style={{ fontFamily: "var(--font-display)" }}>
            {notNotified}
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase mt-1 text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
            Awaiting Link
          </div>
        </div>
      </div>

      {/* Send livestream link */}
      <div className="rounded-2xl border border-stone-edge bg-white p-5 mb-6">
        <p className="text-sm font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Send livestream link
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            type="url"
            placeholder="https://your-livestream-link.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
          />
          <input
            type="text"
            placeholder="Optional extra message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={sendLink}
            disabled={isPending}
            className="text-xs px-4 py-2.5 rounded-lg bg-ink text-vellum font-bold uppercase tracking-wider hover:bg-stone transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Send to {selected.size} selected
          </button>
          <button
            onClick={selectNotNotified}
            disabled={isPending}
            className="text-xs px-4 py-2.5 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Select not-yet-notified ({notNotified})
          </button>
          {sentInfo && <span className="text-xs text-green-700 font-semibold">{sentInfo}</span>}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-sans font-medium">
          {error}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <button
          onClick={toggleAllFiltered}
          className="text-xs px-4 py-2 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink font-bold uppercase tracking-wider transition-colors"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {filtered.length > 0 && filtered.every((r) => selected.has(r.id)) ? "Deselect all" : "Select all"}
        </button>
      </div>

      <p className="text-sm text-stone-mid mb-4 font-medium font-sans">
        {filtered.length} RSVP{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm italic font-sans">
          No RSVPs yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-4 rounded-xl border bg-white p-4 ${
                selected.has(r.id) ? "border-gold-soft bg-gold-wash/20" : "border-stone-edge"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(r.id)}
                onChange={() => toggle(r.id)}
                className="w-4 h-4 accent-gold flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-ink text-sm" style={{ fontFamily: "var(--font-display)" }}>
                    {r.full_name}
                  </span>
                  {r.guest_count > 1 && (
                    <span className="text-[10px] font-bold text-stone-mid bg-stone-edge/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      +{r.guest_count - 1} guest{r.guest_count - 1 === 1 ? "" : "s"}
                    </span>
                  )}
                  {r.notified ? (
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Link Sent
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Awaiting Link
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs font-sans text-stone-mid">
                  <span className="font-mono">{r.email}</span>
                  <span>·</span>
                  <span>
                    {new Date(r.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {r.notes && <p className="mt-1 text-xs text-stone-mid font-sans italic">{r.notes}</p>}
              </div>
              <button
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
        </>
      )}
    </div>
  );
}
