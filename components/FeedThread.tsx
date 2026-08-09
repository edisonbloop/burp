"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { Avatar } from "@/components/TalkComments";
import RichPlainTextContent from "@/components/RichPlainTextContent";
import ShareButton from "@/components/ShareButton";
import { discussionShareTitle, discussionUrl } from "@/lib/talk-metadata";

interface Post {
  id: string;
  title: string;
  content?: string | null;
  created_at: string;
  plan_id: string;
  user_id?: string | null;
  thread_id?: string | null;
  thread_index?: number | null;
}

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

export default function FeedThread({
  posts,
  commentCount = 0,
  planTitle,
}: {
  posts: Post[];
  commentCount?: number;
  planTitle?: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContents, setEditContents] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const replyAnchorId = posts[0]?.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, [supabase]);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const visible = posts.filter((p) => !deletedIds.has(p.id));
  if (!visible.length) return null;

  const authorName = visible[0].title || "?";

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post from the thread?")) return;
    await supabase.from("discussions").delete().eq("id", postId).eq("user_id", userId!);
    setDeletedIds((prev) => new Set([...prev, postId]));
    router.refresh();
  };

  const handleSave = async (postId: string) => {
    const content = editContents[postId]?.trim();
    if (!content) return;
    await supabase.from("discussions").update({ content }).eq("id", postId).eq("user_id", userId!);
    setEditingId(null);
    router.refresh();
  };

  return (
    <div className="border-b border-stone-edge/60 last:border-0 px-4 py-4">
      {/* Thread header */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar name={authorName} size="md" />
        <div className="min-w-0">
          <span className="font-bold text-ink text-sm">{authorName}</span>
          <span className="text-xs text-stone-light ml-2">{timeAgo(visible[0].created_at)}</span>
        </div>
        <span
          className="ml-auto text-[9px] font-bold uppercase tracking-widest text-gold-deep bg-gold-wash border border-gold-soft px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Thread · {visible.length}
        </span>
      </div>

      {/* Thread posts connected with line */}
      <div className="ml-4 pl-4 border-l-2 border-stone-edge space-y-4">
        {visible.map((post, i) => {
          const isOwn = !!(userId && post.user_id && userId === post.user_id);
          const isEditing = editingId === post.id;

          return (
            <div key={post.id} className="relative group">
              {!isEditing && (
                <span
                  className="text-[9px] font-bold uppercase tracking-widest text-stone-light mb-1 block"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {i + 1} / {visible.length}
                </span>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContents[post.id] ?? post.content ?? ""}
                    onChange={(e) =>
                      setEditContents((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(post.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-gold bg-parchment-soft text-ink text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none leading-relaxed"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(post.id)}
                      className="px-4 py-1.5 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 rounded-full border border-stone-edge text-stone-mid text-xs font-semibold hover:border-gold hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {post.content && <RichPlainTextContent content={post.content} />}
                  </div>
                  {isOwn && (
                    <div
                      className="relative flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      ref={openMenuId === post.id ? menuRef : null}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-stone-light hover:text-ink hover:bg-parchment-soft transition-colors text-base leading-none"
                        aria-label="Post options"
                      >
                        ···
                      </button>
                      {openMenuId === post.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-stone-edge rounded-xl shadow-lg z-20 py-1 min-w-[120px]">
                          <button
                            type="button"
                            onClick={() => {
                              setEditContents((prev) => ({ ...prev, [post.id]: post.content ?? "" }));
                              setEditingId(post.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-parchment-soft transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => { setOpenMenuId(null); handleDelete(post.id); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply footer — always visible */}
      {replyAnchorId && (
        <div className="mt-4 ml-4 pl-4 flex flex-wrap items-center gap-3">
          {commentCount > 0 && (
            <span className="text-xs font-semibold text-gold-deep">
              {commentCount} reflection{commentCount !== 1 ? "s" : ""}
            </span>
          )}
          <Link
            href={`/talk-it-over/discussion/${replyAnchorId}#reply`}
            className="text-xs font-bold text-stone-light hover:text-gold transition-colors uppercase tracking-widest"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {commentCount > 0 ? "Join the conversation →" : "Reply to thread →"}
          </Link>
          <ShareButton
            variant="compact"
            url={discussionUrl(replyAnchorId)}
            title={discussionShareTitle(authorName, planTitle ?? "Talk It Over")}
          />
        </div>
      )}
    </div>
  );
}
