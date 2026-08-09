"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReadingPlanWithStats } from "@/lib/talk-actions";
import { anyTextMatchesQuery } from "@/lib/search-utils";

function formatActivityDate(dateStr: string | null): string {
  if (!dateStr) return "No activity yet";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Active today";
  if (diffDays === 1) return "Active yesterday";
  if (diffDays < 7) return `Active ${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TalkItOverPlansClient({
  plans,
}: {
  plans: ReadingPlanWithStats[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    return plans.filter((plan) =>
      anyTextMatchesQuery(searchQuery, plan.title, plan.description, plan.search_text)
    );
  }, [plans, searchQuery]);

  return (
    <div className="space-y-8">
      <div>
        <p
          className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-1"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Reading Plans
        </p>
        <p className="text-xs text-stone-mid leading-relaxed">
          Browse all plans — use search to find a passage, topic, or thread.
        </p>
      </div>

      {/* Search toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-stone-edge pb-6">
        <p className="text-xs text-stone-mid">
          {plans.length} reading plan{plans.length !== 1 ? "s" : ""}
          {searchQuery.trim() && filteredPlans.length !== plans.length && (
            <span className="text-stone-light"> · {filteredPlans.length} shown</span>
          )}
        </p>
        <div className="relative w-full sm:max-w-sm">
          <input
            type="text"
            placeholder="Search plans, passages, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-vellum border border-stone-edge text-ink text-sm rounded-full pl-5 pr-10 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-stone-light/75"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-light pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge">
          <p className="text-stone-mid text-sm italic mb-2">No discussion plans yet.</p>
          <p className="text-xs text-stone-light">Check back soon — new plans are coming!</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge">
          <p className="text-stone-mid text-sm italic mb-2">No plans match your search.</p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs text-gold-deep hover:text-gold font-semibold transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredPlans.map((plan) => (
            <Link
              key={plan.id}
              href={`/talk-it-over/${plan.id}`}
              className="group bg-parchment-soft p-8 rounded-3xl border border-stone-edge hover:border-gold hover:shadow-md transition-all duration-220 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span
                    className="text-[9px] font-bold tracking-widest text-gold-deep uppercase"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Reading Plan
                  </span>
                  {plan.day_thread_count > 0 && (
                    <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gold-wash text-gold-deep border border-gold-soft">
                      {plan.day_thread_count} day{plan.day_thread_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
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

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-4 text-[10px] text-stone-light uppercase tracking-wider">
                  <span>
                    {plan.discussion_count} discussion{plan.discussion_count !== 1 ? "s" : ""}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-stone-edge" />
                  <span>{formatActivityDate(plan.last_activity_at)}</span>
                </div>
                <div
                  className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-stone group-hover:text-ink uppercase transition-colors"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  <span>View Discussions</span>
                  <span className="text-sm font-sans leading-none transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
