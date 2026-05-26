import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussionsForPlan, getPlan } from "@/lib/talk-actions";
import PostToFeed from "@/components/PostToFeed";
import FeedPost from "@/components/FeedPost";

export const revalidate = 0;

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
    plan_id: string;
    user_id?: string | null;
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
            <FeedPost key={disc.id} disc={disc} />
          ))
        )}
      </div>
    </main>
  );
}
