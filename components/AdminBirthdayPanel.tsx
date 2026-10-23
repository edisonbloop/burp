"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteBirthdayCard } from "@/lib/birthday-actions";
import type { AdminBirthdayCard } from "@/types/birthday";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

function formatDate(iso: string | null, opts: Intl.DateTimeFormatOptions) {
  if (!iso) return null;
  return new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

/**
 * Every birthday card on the site. "Manage" opens the organiser's own manage
 * page (edit details, approve/hide/remove messages, seal the card).
 */
export default function AdminBirthdayPanel({ cards }: { cards: AdminBirthdayCard[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "waiting" | "open" | "sealed">("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const waitingTotal = cards.reduce((n, c) => n + c.waiting_count, 0);

  const filtered = cards.filter((c) => {
    if (filter === "waiting" && c.waiting_count === 0) return false;
    if (filter === "open" && !c.accepting_messages) return false;
    if (filter === "sealed" && c.accepting_messages) return false;
    const q = search.trim().toLowerCase();
    return !q || c.honoree_name.toLowerCase().includes(q) || c.organiser_name.toLowerCase().includes(q);
  });

  function remove(card: AdminBirthdayCard) {
    if (!confirm(`Delete ${card.honoree_name}'s card and all ${card.approved_count + card.waiting_count} messages? This can't be undone.`)) return;
    setError("");
    startTransition(async () => {
      const res = await adminDeleteBirthdayCard(card.id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-1 bg-parchment-soft rounded-xl p-1 border border-stone-edge w-fit">
          {(
            [
              ["all", `All (${cards.length})`],
              ["waiting", `Messages waiting (${cards.filter((c) => c.waiting_count).length})`],
              ["open", "Open"],
              ["sealed", "Sealed"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filter === id ? "bg-white text-ink shadow-sm border border-stone-edge" : "text-stone-mid hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or organiser…"
          className="w-full sm:w-72 bg-white border border-stone-edge rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
        />
      </div>

      {waitingTotal > 0 && (
        <p className="text-xs text-stone-mid">
          {`${waitingTotal} ${waitingTotal === 1 ? "message is" : "messages are"} waiting for organisers to approve. You can approve them too from a card’s Manage page.`}
        </p>
      )}
      {error && <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-center text-stone-mid bg-parchment-soft border border-dashed border-stone-edge rounded-2xl p-10">
          {cards.length === 0 ? "No birthday cards yet." : "No cards match."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <li key={c.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-stone-edge rounded-2xl p-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {c.photo_urls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photo_urls[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <span className="w-14 h-14 rounded-xl bg-gold-wash flex items-center justify-center text-2xl shrink-0">🎂</span>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-ink text-lg truncate" style={display}>
                    {c.honoree_name}
                    {c.turning_age ? <span className="text-stone-mid font-normal"> · {c.turning_age}</span> : null}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-mid">
                    {c.birthday && <span>🎂 {formatDate(c.birthday, { day: "numeric", month: "short", year: "numeric" })}</span>}
                    <span>by <strong className="text-ink">{c.organiser_name}</strong></span>
                    <span>started {formatDate(c.created_at, { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-success-earthen bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {c.approved_count} on card
                    </span>
                    {c.waiting_count > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {c.waiting_count} waiting
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-stone-mid bg-stone-edge/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {c.accepting_messages ? "Open" : "Sealed"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href={`/birthday/${c.slug}/manage?key=${c.manage_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3.5 py-2 rounded-lg border border-gold bg-gold-wash text-gold-deep hover:bg-gold hover:text-vellum font-bold uppercase tracking-wider transition-colors"
                  style={accent}
                >
                  Manage
                </a>
                <a
                  href={`/birthday/${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3.5 py-2 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink font-bold uppercase tracking-wider transition-colors"
                  style={accent}
                >
                  Open card
                </a>
                <button
                  onClick={() => remove(c)}
                  disabled={isPending}
                  className="text-xs px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  style={accent}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
