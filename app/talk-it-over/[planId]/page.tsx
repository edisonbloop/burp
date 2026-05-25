import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussionsForPlan, getPlan } from "@/lib/talk-actions";
import { Avatar } from "@/components/TalkComments";
import PostToFeed from "@/components/PostToFeed";

export const revalidate = 0;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function PlanDiscussionsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const [plan, discussions] = await Promise.all([
    getPlan(planId),
    getDiscussionsForPlan(planId),
  ]);

  if (!plan) notFound();

  type Disc = {
    id: string;
    title: string;
    content?: string | null;
    created_at: string;
  };

  return (
    <main className="min-h-screen bg-vellum text-ink">
      {/* Slim top bar */}
      <div className="sticky top-0 z-10 bg-vellum/90 backdrop-blur border-b border-stone-edge">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/talk-it-over"
            className="text-stone-mid hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </Link>
          <div className="min-w-0">
            <p className="font-bold text-ink text-sm truncate">{plan.title}</p>
            {plan.description && (
              <p className="text-xs text-stone-light truncate">{plan.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-xl mx-auto px-4 py-4 space-y-1">
        {/* Compose box */}
        <PostToFeed planId={planId} />

        {discussions.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-stone-mid text-sm">No discussions yet.</p>
            <p className="text-xs text-stone-light mt-1">Check back soon.</p>
          </div>
        ) : (
          (discussions as Disc[]).map((disc) => (
            <div key={disc.id} className="border-b border-stone-edge/60 last:border-0">
              <div className="flex gap-3 px-4 py-5">
                {/* Avatar */}
                <Avatar name={disc.title || "?"} size="md" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name + timestamp */}
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <span className="font-bold text-ink text-sm">
                      {disc.title}
                    </span>
                    <span className="text-xs text-stone-light flex-shrink-0">
                      {timeAgo(disc.created_at)}
                    </span>
                  </div>

                  {/* Full content */}
                  {disc.content && (
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap mb-3">
                      {disc.content}
                    </p>
                  )}

                  {/* Reply link */}
                  <Link
                    href={`/talk-it-over/discussion/${disc.id}`}
                    className="text-xs font-bold text-stone-light hover:text-gold transition-colors uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Reply →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
