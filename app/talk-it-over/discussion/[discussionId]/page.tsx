import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussion, getComments } from "@/lib/talk-actions";
import TalkComments from "@/components/TalkComments";

export const revalidate = 0;

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = await params;
  const discussion = await getDiscussion(discussionId);

  if (!discussion) notFound();

  const comments = await getComments(discussionId);

  return (
    <main className="flex-1 min-h-screen bg-vellum text-ink pb-20">
      {/* Header */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/talk-it-over/${discussion.plan_id}`}
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← Back to {(discussion as { reading_plans?: { title?: string } }).reading_plans?.title || "Plan"}
          </Link>
        </div>
      </div>

      {/* Discussion hero */}
      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          {discussion.day_number && (
            <span
              className="text-[10px] font-bold tracking-widest text-gold-deep bg-gold-wash px-4 py-1.5 rounded-full inline-block mb-4"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Day {discussion.day_number}
            </span>
          )}
          <h1
            className="text-4xl sm:text-5xl font-bold text-ink mb-6 leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {discussion.title}
          </h1>
          {discussion.content && (
            <div className="text-base text-stone-mid leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap text-left bg-parchment-soft border border-stone-edge rounded-2xl px-6 py-5">
              {discussion.content}
            </div>
          )}
        </div>
      </section>

      {/* Comments */}
      <div className="px-4 sm:px-6">
        <TalkComments discussionId={discussionId} initialComments={comments} />
      </div>
    </main>
  );
}
