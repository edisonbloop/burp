import Link from "next/link";
import { notFound } from "next/navigation";
import { getDayDiscussionsForPlan, getFeedPostsForPlan, getPlan } from "@/lib/talk-actions";
import PostToFeed from "@/components/PostToFeed";
import FeedPost from "@/components/FeedPost";
import FeedThread from "@/components/FeedThread";

export const revalidate = 0;

type Disc = {
  id: string;
  title: string;
  content?: string | null;
  created_at: string;
  plan_id: string;
  day_number?: number | null;
  user_id?: string | null;
  thread_id?: string | null;
  thread_index?: number | null;
};

/** Group flat list of posts into solo posts and threads, preserving feed order */
function groupByThread(posts: Disc[]): Disc[][] {
  const groups: Disc[][] = [];
  const threadMap = new Map<string, Disc[]>();

  for (const post of posts) {
    if (!post.thread_id) {
      groups.push([post]);
    } else {
      if (!threadMap.has(post.thread_id)) {
        const group: Disc[] = [];
        threadMap.set(post.thread_id, group);
        groups.push(group);
      }
      threadMap.get(post.thread_id)!.push(post);
    }
  }

  // Sort posts within each thread by thread_index
  for (const group of groups) {
    if (group.length > 1) {
      group.sort((a, b) => (a.thread_index ?? 0) - (b.thread_index ?? 0));
    }
  }

  return groups;
}

export default async function PlanDiscussionsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const [plan, dayDiscussions, feedPosts] = await Promise.all([
    getPlan(planId),
    getDayDiscussionsForPlan(planId),
    getFeedPostsForPlan(planId),
  ]);

  if (!plan) notFound();

  const feedGroups = groupByThread(feedPosts as Disc[]);

  return (
    <main className="min-h-screen bg-vellum text-ink">
      {/* Slim top bar */}
      <div className="sticky top-0 z-10 bg-vellum/90 backdrop-blur border-b border-stone-edge">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/talk-it-over" className="text-stone-mid hover:text-ink transition-colors">
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

      <div className="max-w-xl mx-auto px-4 py-6 space-y-8">

        {/* Compose box */}
        <PostToFeed planId={planId} />

        {/* Feed (solo posts + threads) */}
        {feedGroups.length > 0 && (
          <section>
            <div className="bg-parchment-soft border border-stone-edge rounded-2xl overflow-hidden divide-y divide-stone-edge/60">
              {feedGroups.map((group) =>
                group.length === 1 ? (
                  <FeedPost key={group[0].id} disc={group[0]} />
                ) : (
                  <FeedThread key={group[0].thread_id!} posts={group} />
                )
              )}
            </div>
          </section>
        )}

        {feedGroups.length === 0 && dayDiscussions.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-mid text-sm">No posts yet.</p>
            <p className="text-xs text-stone-light mt-1">Be the first to share something.</p>
          </div>
        )}

        {/* Day discussion threads */}
        {dayDiscussions.length > 0 && (
          <section>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-3" style={{ fontFamily: "var(--font-accent)" }}>
              Discussion Threads
            </p>
            <div className="space-y-2">
              {(dayDiscussions as Disc[]).map((disc) => (
                <Link
                  key={disc.id}
                  href={`/talk-it-over/discussion/${disc.id}`}
                  className="flex items-center gap-4 px-5 py-4 bg-parchment-soft border border-stone-edge rounded-2xl hover:border-gold-soft hover:bg-gold-wash transition-all group"
                >
                  {disc.day_number != null && (
                    <span
                      className="text-xs font-bold text-gold-deep bg-gold-wash border border-gold-soft rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 group-hover:bg-gold group-hover:text-vellum transition-colors"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {disc.day_number}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate group-hover:text-gold-deep transition-colors">{disc.title}</p>
                    {disc.content && (
                      <p className="text-xs text-stone-light truncate mt-0.5">{disc.content}</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-stone-light group-hover:text-gold transition-colors flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 8h8M9 5l3 3-3 3" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
