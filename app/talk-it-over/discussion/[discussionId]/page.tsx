import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TalkItOverBackHeader from "@/components/TalkItOverBackHeader";
import RichPlainTextContent from "@/components/RichPlainTextContent";
import ShareButton from "@/components/ShareButton";
import { getDiscussion, getComments, getThreadPosts } from "@/lib/talk-actions";
import {
  BASE_URL,
  combinedDiscussionText,
  discussionShareTitle,
  discussionUrl,
  firstVideoThumbnail,
  truncateForMeta,
} from "@/lib/talk-metadata";
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

type Disc = Post & { plan_id: string; reading_plans?: { title?: string } };

async function loadDiscussion(discussionId: string) {
  const discussion = await getDiscussion(discussionId);
  if (!discussion) return null;

  const disc = discussion as Disc;
  const isThread = !!disc.thread_id;
  const threadPosts: Post[] = isThread
    ? ((await getThreadPosts(disc.thread_id!)) as Post[])
    : [disc];

  const commentAnchorId = isThread ? threadPosts[0].id : discussionId;
  const canonicalId = commentAnchorId;
  const planTitle = disc.reading_plans?.title || "Talk It Over";
  const authorName = disc.title || "Community member";
  const allContent = combinedDiscussionText(...threadPosts.map((p) => p.content));

  return {
    disc,
    isThread,
    threadPosts,
    commentAnchorId,
    canonicalId,
    planTitle,
    authorName,
    allContent,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}): Promise<Metadata> {
  const { discussionId } = await params;
  const data = await loadDiscussion(discussionId);
  if (!data) return { title: "Not Found — BURP" };

  const { canonicalId, planTitle, authorName, allContent } = data;
  const title = discussionShareTitle(authorName, planTitle);
  const description = truncateForMeta(allContent);
  const url = discussionUrl(canonicalId);
  const videoThumb = firstVideoThumbnail(allContent);
  const ogImages = videoThumb ? [{ url: videoThumb }] : undefined;

  return {
    title: `${title} | BURP`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "BURP — Berean Upper Room Platform",
      type: "article",
      locale: "en_US",
      images: ogImages,
    },
    twitter: {
      card: videoThumb ? "summary_large_image" : "summary",
      title,
      description,
      images: videoThumb ? [videoThumb] : undefined,
    },
    alternates: { canonical: url },
  };
}

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = await params;
  const data = await loadDiscussion(discussionId);
  if (!data) notFound();

  const {
    disc,
    isThread,
    threadPosts,
    commentAnchorId,
    canonicalId,
    planTitle,
    authorName,
  } = data;

  const comments = await getComments(commentAnchorId);
  const shareTitle = discussionShareTitle(authorName, planTitle);
  const shareUrl = discussionUrl(canonicalId);

  return (
    <main className="min-h-screen bg-vellum text-ink pb-16">
      <TalkItOverBackHeader backHref="/talk-it-over" backLabel="← Talk It Over" />

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
          <p className="font-bold text-ink text-sm truncate flex-1">{planTitle}</p>
          {isThread && (
            <span
              className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-wash text-gold-deep border border-gold-soft"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Thread · {threadPosts.length}
            </span>
          )}
          <ShareButton url={shareUrl} title={shareTitle} variant="compact" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">
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
                  <RichPlainTextContent
                    content={disc.content}
                    textClassName="text-base text-ink leading-relaxed whitespace-pre-wrap"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {isThread && (
          <div className="py-5 border-b border-stone-edge">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={authorName} size="lg" />
              <div>
                <p className="font-bold text-ink text-base leading-none">{authorName}</p>
                <p className="text-xs text-stone-light mt-0.5">{formatDate(threadPosts[0].created_at)}</p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-stone-edge pl-5 space-y-5">
              {threadPosts.map((post, i) => (
                <div key={post.id}>
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
                        You&apos;re here
                      </span>
                    )}
                  </div>
                  {post.content && (
                    <RichPlainTextContent
                      content={post.content}
                      textClassName={`text-base leading-relaxed whitespace-pre-wrap ${
                        post.id === discussionId ? "text-ink font-medium" : "text-stone-mid"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-5">
          <TalkComments discussionId={commentAnchorId} initialComments={comments} />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            headline: shareTitle,
            url: shareUrl,
            author: { "@type": "Person", name: authorName },
            isPartOf: {
              "@type": "CreativeWork",
              name: planTitle,
              url: `${BASE_URL}/talk-it-over/${disc.plan_id}`,
            },
          }),
        }}
      />
    </main>
  );
}
