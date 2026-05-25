import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussion, getComments } from "@/lib/talk-actions";
import TalkComments, { Avatar } from "@/components/TalkComments";

export const revalidate = 0;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = await params;
  const discussion = await getDiscussion(discussionId);
  if (!discussion) notFound();

  const comments = await getComments(discussionId);
  const planTitle =
    (discussion as { reading_plans?: { title?: string } }).reading_plans?.title || "Discussions";

  return (
    <main className="min-h-screen bg-vellum text-ink pb-16">
      {/* Slim top bar */}
      <div className="sticky top-0 z-10 bg-vellum/90 backdrop-blur border-b border-stone-edge">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/talk-it-over/${discussion.plan_id}`}
            className="text-stone-mid hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </Link>
          <p className="font-bold text-ink text-sm truncate">{planTitle}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">
        {/* Original post */}
        <div className="py-5 border-b border-stone-edge">
          <div className="flex gap-3">
            <Avatar name={discussion.title || "?"} size="lg" />
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="font-bold text-ink text-base">{discussion.title}</span>
                <span className="text-xs text-stone-light flex-shrink-0">
                  {formatDate(discussion.created_at)}
                </span>
              </div>
              {discussion.content && (
                <p className="text-base text-ink leading-relaxed whitespace-pre-wrap">
                  {discussion.content}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments + compose */}
        <div className="pt-5">
          <TalkComments discussionId={discussionId} initialComments={comments} />
        </div>
      </div>
    </main>
  );
}
