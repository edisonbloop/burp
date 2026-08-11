import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TalkItOverBackHeader from "@/components/TalkItOverBackHeader";
import PlanDiscussionsClient from "@/components/PlanDiscussionsClient";
import {
  getCommentCountsForDiscussions,
  getDayDiscussionsForPlan,
  getFeedPostsForPlan,
  getPlan,
} from "@/lib/talk-actions";
import { planUrl, truncateForMeta } from "@/lib/talk-metadata";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const plan = await getPlan(planId);
  if (!plan) return { title: "Not Found — BURP" };

  const title = `${plan.title} — Burp It | BURP`;
  const description = truncateForMeta(plan.description ?? "Share thoughts and reflections on this Burp It plan.");
  const url = planUrl(planId);

  return {
    title,
    description,
    openGraph: {
      title: `${plan.title} — Burp It`,
      description,
      url,
      siteName: "BURP — Berean Upper Room Platform",
      type: "website",
    },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

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

  // Reflections anchor on the first post in a thread; solo posts use their own id.
  const commentAnchorIds = [
    ...feedGroups.map((group) => group[0].id),
    ...(dayDiscussions as Disc[]).map((d) => d.id),
  ];
  const commentCounts = await getCommentCountsForDiscussions(commentAnchorIds);

  return (
    <main className="min-h-screen bg-vellum text-ink pb-20">
      <TalkItOverBackHeader backHref="/burp-it" backLabel="← Burp It" />
      <PlanDiscussionsClient
        planId={planId}
        planTitle={plan.title}
        planDescription={plan.description}
        feedGroups={feedGroups}
        dayDiscussions={dayDiscussions as Disc[]}
        commentCounts={commentCounts}
      />
    </main>
  );
}
