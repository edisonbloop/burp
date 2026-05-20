import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussion, getComments } from "@/lib/talk-actions";
import TalkComments from "@/components/TalkComments";

export default async function DashboardDiscussionPage({ params }: { params: Promise<{ discussionId: string }> }) {
  const { discussionId } = await params;
  const discussion = await getDiscussion(discussionId);

  if (!discussion) {
    notFound();
  }

  const comments = await getComments(discussionId);

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto pb-20">
      <div className="mb-10 border-b border-[#e8d4b0] pb-10">
        <Link href={`/dashboard/plan/${discussion.plan_id}`} className="text-sm font-semibold tracking-widest text-[#c4893a] uppercase mb-4 inline-block hover:underline">
          ← Back to {discussion.reading_plans?.title || "Plan"}
        </Link>
        <div className="flex mt-4 mb-4">
          {discussion.day_number && (
            <span className="text-sm font-bold text-[#c4893a] bg-[#fdf8f0] px-4 py-1.5 rounded-full border border-[#e3be82]">
              Day {discussion.day_number}
            </span>
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#2d1f0e] mb-6 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
          {discussion.title}
        </h1>
        {discussion.content && (
          <div className="text-lg text-[#4d2c11] leading-relaxed whitespace-pre-wrap">
            {discussion.content}
          </div>
        )}
      </div>

      <div>
        <TalkComments discussionId={discussionId} initialComments={comments} />
      </div>
    </div>
  );
}
