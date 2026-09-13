"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReadingPlanWithStats } from "@/lib/talk-actions";
import { anyTextMatchesQuery } from "@/lib/search-utils";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

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

function PlanCard({ plan }: { plan: ReadingPlanWithStats }) {
  return (
    <Link
      href={`/burp-it/${plan.id}`}
      className="group bg-parchment-soft p-8 rounded-3xl border border-stone-edge hover:border-gold hover:shadow-md transition-all duration-220 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[9px] font-bold tracking-widest text-gold-deep uppercase" style={accent}>
            Burp It Plan
          </span>
          {plan.day_thread_count > 0 && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gold-wash text-gold-deep border border-gold-soft">
              {plan.day_thread_count} day{plan.day_thread_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <h3
          className="text-2xl font-bold text-ink mb-3 group-hover:text-gold-deep transition-colors tracking-tight leading-snug"
          style={display}
        >
          {plan.title}
        </h3>
        {plan.description && (
          <p className="text-sm text-stone-mid leading-relaxed line-clamp-3">{plan.description}</p>
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
          style={accent}
        >
          <span>View Discussions</span>
          <span className="text-sm font-sans leading-none transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

export default function TalkItOverPlansClient({
  plans,
  currentDayNumber,
}: {
  plans: ReadingPlanWithStats[];
  currentDayNumber: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [jumpValue, setJumpValue] = useState("");
  const [jumpError, setJumpError] = useState("");

  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return plans.filter((plan) =>
      anyTextMatchesQuery(searchQuery, plan.title, plan.description, plan.search_text)
    );
  }, [plans, searchQuery]);

  const { todayPlan, pastPlans, futurePlans } = useMemo(() => {
    let today: ReadingPlanWithStats | null = null;
    const past: ReadingPlanWithStats[] = [];
    const future: ReadingPlanWithStats[] = [];

    for (const plan of plans) {
      if (plan.day_number === currentDayNumber) today = plan;
      else if (plan.day_number != null && plan.day_number < currentDayNumber) past.push(plan);
      else if (plan.day_number != null && plan.day_number > currentDayNumber) future.push(plan);
    }
    past.sort((a, b) => (b.day_number ?? 0) - (a.day_number ?? 0));
    future.sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0));
    return { todayPlan: today, pastPlans: past, futurePlans: future };
  }, [plans, currentDayNumber]);

  const plansById = useMemo(() => new Map(plans.map((p) => [p.day_number, p])), [plans]);

  function handleJump(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(jumpValue, 10);
    const target = plansById.get(n);
    if (!target) {
      setJumpError(`No plan found for day ${jumpValue || "?"}.`);
      return;
    }
    setJumpError("");
    window.location.href = `/burp-it/${target.id}`;
  }

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Search toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-stone-edge pb-6">
        <p className="text-xs text-stone-mid">
          {plans.length} Burp It plan{plans.length !== 1 ? "s" : ""}
          {isSearching && filteredPlans && (
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
      ) : isSearching ? (
        filteredPlans && filteredPlans.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
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
        )
      ) : (
        <div className="space-y-10">
          {/* Today */}
          {todayPlan && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gold-deep mb-3" style={accent}>
                Today · Day {currentDayNumber}
              </p>
              <Link
                href={`/burp-it/${todayPlan.id}`}
                className="group block bg-gold-wash/25 p-8 sm:p-10 rounded-3xl border-2 border-gold-soft hover:border-gold hover:shadow-md transition-all duration-220"
              >
                <h3
                  className="text-3xl font-bold text-ink mb-3 group-hover:text-gold-deep transition-colors tracking-tight leading-snug"
                  style={display}
                >
                  {todayPlan.title}
                </h3>
                {todayPlan.description && (
                  <p className="text-sm text-stone-mid leading-relaxed mb-6">{todayPlan.description}</p>
                )}
                <div className="flex items-center gap-4 text-[10px] text-stone-light uppercase tracking-wider mb-4">
                  <span>
                    {todayPlan.discussion_count} discussion{todayPlan.discussion_count !== 1 ? "s" : ""}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-stone-edge" />
                  <span>{formatActivityDate(todayPlan.last_activity_at)}</span>
                </div>
                <div
                  className="flex items-center gap-1 text-xs font-bold tracking-wider text-gold-deep group-hover:text-ink uppercase transition-colors"
                  style={accent}
                >
                  <span>Read &amp; Discuss Today</span>
                  <span className="text-sm font-sans leading-none transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </div>
          )}

          {/* Past days */}
          {pastPlans.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-1" style={accent}>
                Recent Days
              </p>
              <p className="text-xs text-stone-mid mb-5">Past days, most recent first.</p>
              <div className="grid gap-6 sm:grid-cols-2">
                {pastPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming days — collapsed by default, no discussions yet */}
          {futurePlans.length > 0 && (
            <div className="rounded-2xl border border-stone-edge bg-parchment-soft overflow-hidden">
              <button
                onClick={() => setShowUpcoming((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-parchment-soft/60 transition-colors"
              >
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-light" style={accent}>
                    Upcoming
                  </p>
                  <p className="text-xs text-stone-mid mt-0.5">
                    {futurePlans.length} day{futurePlans.length !== 1 ? "s" : ""} ahead — read ahead if you like.
                  </p>
                </div>
                <span className="text-xs text-stone-light flex-shrink-0">{showUpcoming ? "Hide ▲" : "Browse ▼"}</span>
              </button>

              {showUpcoming && (
                <div className="border-t border-stone-edge/60 p-6 space-y-4 bg-white/40">
                  <form onSubmit={handleJump} className="flex items-center gap-2">
                    <input
                      value={jumpValue}
                      onChange={(e) => {
                        setJumpValue(e.target.value);
                        setJumpError("");
                      }}
                      placeholder="Jump to day #"
                      inputMode="numeric"
                      className="w-32 px-3.5 py-2 rounded-xl border border-stone-edge bg-white text-ink text-sm placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl border border-stone-edge text-xs font-bold uppercase tracking-wider hover:border-gold"
                      style={accent}
                    >
                      Go
                    </button>
                    {jumpError && <span className="text-xs text-danger-earthen">{jumpError}</span>}
                  </form>

                  <div className="grid gap-2 sm:grid-cols-2 max-h-96 overflow-y-auto pr-1">
                    {futurePlans.slice(0, 30).map((plan) => (
                      <Link
                        key={plan.id}
                        href={`/burp-it/${plan.id}`}
                        className="block rounded-xl border border-stone-edge bg-white px-4 py-3 hover:border-gold transition-colors"
                      >
                        <p className="text-sm font-bold text-ink truncate">{plan.title}</p>
                        {plan.description && (
                          <p className="text-xs text-stone-light truncate mt-0.5">{plan.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                  {futurePlans.length > 30 && (
                    <p className="text-xs text-stone-light text-center">
                      Showing the next 30 — use &ldquo;Jump to day #&rdquo; above for a specific day.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!todayPlan && pastPlans.length === 0 && futurePlans.length === 0 && (
            <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge">
              <p className="text-stone-mid text-sm italic">No plans yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
