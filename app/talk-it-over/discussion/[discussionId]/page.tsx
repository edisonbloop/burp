import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussion, getComments, getThreadPosts } from "@/lib/talk-actions";
import TalkComments, { Avatar } from "@/components/TalkComments";

export const revalidate = 0;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Post = {
  id: string;
  title: string;
  content?: string | null;
  created_at: string;
  thread_id?: string | null;
  thread_index?: number | null;
};

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = await params;
  const discussion = await getDiscussion(discussionId);
  if (!discussion) notFound();

  const disc = discussion as Post & { plan_id: string; reading_plans?: { title?: string } };
  const planTitle = disc.reading_plans?.title || "Discussions";

  // If this post is part of a thread, fetch all posts in the thread
  const isThread = !!disc.thread_id;
  const threadPosts: Post[] = isThread
    ? ((await getThreadPosts(disc.thread_id!)) as Post[])
    : [disc];

  // Comments always go on the entry point post (discussionId in the URL)
  const comments = await getComments(discussionId);

  const authorName = disc.title || "?";

  return (
    <main className="min-h-screen bg-vellum text-ink pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-vellum/90 backdrop-blur border-b border-stone-edge">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/talk-it-over/${disc.plan_id}`}
            className="text-stone-mid hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </Link>
          <p className="font-bold text-ink text-sm truncate">{planTitle}</p>
          {isThread && (
            <span
              className="ml-auto flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-wash text-gold-deep border border-gold-soft"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Thread · {threadPosts.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">

        {/* ── Single post ─────────────────────────────────────────────────── */}
        {!isThread && (
          <div className="py-5 border-b border-stone-edge">
            <div className="flex gap-3">
              <Avatar name={authorName} size="lg" />
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="font-bold text-ink text-base">{authorName}</span>
                  <span className="text-xs text-stone-light flex-shrink-0">
                    {formatDate(disc.created_at)}
                  </span>
                </div>
                {disc.content && (
                  <p className="text-base text-ink leading-relaxed whitespace-pre-wrap">
                    {disc.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Thread — connected posts ─────────────────────────────────────── */}
        {isThread && (
          <div className="py-5 border-b border-stone-edge">
            {/* Author row */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={authorName} size="lg" />
              <div>
                <p className="font-bold text-ink text-base leading-none">{authorName}</p>
                <p className="text-xs text-stone-light mt-0.5">{formatDate(threadPosts[0].created_at)}</p>
              </div>
            </div>

            {/* Thread posts with connector line */}
            <div className="ml-5 border-l-2 border-stone-edge pl-5 space-y-5">
              {threadPosts.map((post, i) => (
                <div key={post.id}>
                  {/* Post number chip */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest text-stone-light"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {i + 1} / {threadPosts.length}
                    </span>
                    {post.id === discussionId && i > 0 && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest text-gold-deep bg-gold-wash border border-gold-soft px-1.5 py-0.5 rounded-full"
                        style={{ fontFamily: "var(--font-accent)" }}
                      >
                        You're here
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-base leading-relaxed whitespace-pre-wrap ${
                      post.id === discussionId ? "text-ink font-medium" : "text-stone-mid"
                    }`}
                  >
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments + compose */}
        <div className="pt-5">
          <TalkComments discussionId={discussionId} initialComments={comments} />
        </div>
      </div>
    </main>
  );
}
