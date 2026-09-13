import Link from "next/link";
import type { ReadingPlanWithStats } from "@/lib/talk-actions";

function formatActivityDate(dateStr: string | null): string {
  if (!dateStr) return "No activity yet";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Active today";
  if (diffDays === 1) return "Active yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMostActivePlans(plans: ReadingPlanWithStats[], limit = 5) {
  return [...plans]
    .filter((p) => p.last_activity_at)
    .sort((a, b) => {
      const dateA = new Date(a.last_activity_at!).getTime();
      const dateB = new Date(b.last_activity_at!).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.discussion_count - a.discussion_count;
    })
    .slice(0, limit);
}

/** Past/today days with no reflections yet, closest to today first — a gentle "catch up" nudge. */
function getCatchUpPlans(
  plans: ReadingPlanWithStats[],
  currentDayNumber: number,
  excludeIds: Set<string>,
  limit = 4
) {
  return plans
    .filter(
      (p) =>
        !excludeIds.has(p.id) &&
        p.discussion_count === 0 &&
        p.day_number != null &&
        p.day_number <= currentDayNumber
    )
    .sort((a, b) => (b.day_number ?? 0) - (a.day_number ?? 0))
    .slice(0, limit);
}

function SidebarPlanLink({
  plan,
  active,
}: {
  plan: ReadingPlanWithStats;
  active?: boolean;
}) {
  return (
    <Link
      href={`/burp-it/${plan.id}`}
      className={`block rounded-2xl border px-4 py-3 transition-all ${
        active
          ? "border-gold bg-gold-wash"
          : "border-stone-edge bg-vellum hover:border-gold-soft hover:bg-parchment-soft"
      }`}
    >
      <p
        className={`text-sm font-bold leading-snug truncate ${
          active ? "text-gold-deep" : "text-ink"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {plan.title}
      </p>
      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-stone-light uppercase tracking-wider">
        <span>{plan.discussion_count} posts</span>
        <span className="w-1 h-1 rounded-full bg-stone-edge" />
        <span>{formatActivityDate(plan.last_activity_at)}</span>
      </div>
    </Link>
  );
}

export default function TalkItOverSidebar({
  plans,
  currentDayNumber,
  currentPlanId,
  className = "",
}: {
  plans: ReadingPlanWithStats[];
  currentDayNumber: number;
  currentPlanId?: string;
  className?: string;
}) {
  const mostActive = getMostActivePlans(plans);
  const mostActiveIds = new Set(mostActive.map((p) => p.id));
  const catchUp = getCatchUpPlans(plans, currentDayNumber, mostActiveIds);

  if (plans.length === 0) return null;

  return (
    <aside className={`space-y-8 lg:sticky lg:top-6 lg:self-start ${className}`}>
      {mostActive.length > 0 && (
        <section>
          <p
            className="text-[10px] font-bold tracking-widest uppercase text-gold-deep mb-1"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Most Active
          </p>
          <p className="text-xs text-stone-mid mb-4 leading-relaxed">
            Plans with the freshest conversation right now.
          </p>
          <div className="space-y-2">
            {mostActive.map((plan) => (
              <SidebarPlanLink
                key={plan.id}
                plan={plan}
                active={currentPlanId === plan.id}
              />
            ))}
          </div>
        </section>
      )}

      {catchUp.length > 0 && (
        <section>
          <p
            className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-1"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Catch Up
          </p>
          <p className="text-xs text-stone-mid mb-4 leading-relaxed">
            Recent days with no reflections yet — be the first.
          </p>
          <div className="space-y-2">
            {catchUp.map((plan) => (
              <SidebarPlanLink
                key={plan.id}
                plan={plan}
                active={currentPlanId === plan.id}
              />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-stone-edge bg-parchment-soft px-4 py-4">
        <p
          className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-2"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          At a glance
        </p>
        <div className="space-y-2 text-xs text-stone-mid">
          <p>
            <span className="font-bold text-ink">Day {currentDayNumber}</span> of 365
          </p>
          <p>
            <span className="font-bold text-ink">
              {plans.reduce((sum, p) => sum + p.discussion_count, 0)}
            </span>{" "}
            total discussions
          </p>
        </div>
      </section>
    </aside>
  );
}
