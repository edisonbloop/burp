import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import PlanDiscussionsClient from "@/components/PlanDiscussionsClient";
import { getDayDiscussionsForPlan, getFeedPostsForPlan, getPlan } from "@/lib/talk-actions";

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
    <main className="min-h-screen bg-vellum text-ink pb-20">
      <SiteNav />
      <PlanDiscussionsClient
        planId={planId}
        planTitle={plan.title}
        planDescription={plan.description}
        feedGroups={feedGroups}
        dayDiscussions={dayDiscussions as Disc[]}
      />
    </main>
  );
}
