"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id?: string | null;
  attributed_to?: string | null;
  profiles: { full_name: string | null } | null;
}

interface Profile {
  id: string;
  full_name: string | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${sz} rounded-full bg-gold flex items-center justify-center text-vellum font-bold flex-shrink-0 select-none`}
      style={{ fontFamily: "var(--font-accent)" }}
    >
      {initials || "?"}
    </div>
  );
}

export default function TalkComments({
  discussionId,
  initialComments,
}: {
  discussionId: string;
  initialComments: Comment[];
}) {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data as Profile);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !profile) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ discussion_id: discussionId, user_id: user.id, content: newComment.trim() })
      .select("*, attributed_to, profiles(full_name)")
      .single();
    if (!error && data) {
      setComments((prev) => [...prev, data as Comment]);
      setNewComment("");
      textareaRef.current?.focus();
    }
    setSubmitting(false);
  };

  const displayName = (c: Comment) =>
    c.attributed_to ?? c.profiles?.full_name ?? "Anonymous";

  const deleteComment = useCallback(async (commentId: string) => {
    if (!confirm("Delete this reflection? This can't be undone.")) return;
    await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user!.id);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, [supabase, user]);

  const updateComment = useCallback(async (commentId: string, newContent: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ content: newContent })
      .eq("id", commentId)
      .eq("user_id", user!.id);
    if (!error) {
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, content: newContent } : c)
      );
    }
  }, [supabase, user]);

  return (
    <div>
      {/* Reflection count divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-stone-edge" />
        <span
          className="text-[10px] font-bold uppercase tracking-widest text-stone-light flex-shrink-0"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {comments.length === 0
            ? "No reflections yet"
            : `${comments.length} ${comments.length === 1 ? "Reflection" : "Reflections"}`}
        </span>
        <div className="h-px flex-1 bg-stone-edge" />
      </div>

      {/* Comment thread */}
      {comments.length > 0 && (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              isOwn={!!(user?.id && comment.user_id && user.id === comment.user_id && !comment.attributed_to)}
              displayName={displayName(comment)}
              onUpdate={updateComment}
              onDelete={deleteComment}
            />
          ))}
        </div>
      )}

      {/* Compose or sign-in prompt */}
      {!user ? (
        <Link
          href={`/signin?redirect=${encodeURIComponent(pathname)}`}
          className="flex items-center justify-between w-full px-5 py-4 bg-parchment-soft border border-stone-edge rounded-2xl hover:border-gold-soft hover:bg-gold-wash transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-edge group-hover:border-gold-soft flex items-center justify-center transition-colors">
              <span className="text-stone-light group-hover:text-gold text-sm transition-colors">+</span>
            </div>
            <span className="text-sm text-stone-mid group-hover:text-ink transition-colors">
              Share your reflection…
            </span>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-widest text-gold"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Sign In →
          </span>
        </Link>
      ) : (
        <form onSubmit={submitComment}>
          <div className="flex gap-3 items-start">
            <Avatar name={profile?.full_name ?? user.email ?? "?"} size="sm" />
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (newComment.trim()) submitComment(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Share your reflection…"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-stone-edge bg-parchment-soft text-ink placeholder:text-stone-light text-sm focus:outline-none focus:border-gold resize-none transition-colors leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-stone-light">
                  {profile?.full_name ?? ""}
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-5 py-2 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors disabled:opacity-40"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {submitting ? "Sharing…" : "Share"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

// ── CommentRow — handles inline edit / delete for own comments ──────────────
function CommentRow({
  comment,
  isOwn,
  displayName,
  onUpdate,
  onDelete,
}: {
  comment: Comment;
  isOwn: boolean;
  displayName: string;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    setSaving(true);
    await onUpdate(comment.id, trimmed);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar name={displayName} size="sm" />
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <span className="font-semibold text-ink text-sm leading-none">{displayName}</span>
          {comment.attributed_to && (
            <span
              className="text-[9px] font-bold uppercase tracking-widest text-stone-light bg-parchment-soft border border-stone-edge px-1.5 py-0.5 rounded-full"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              group
            </span>
          )}
          <span className="text-xs text-stone-light ml-auto">{timeAgo(comment.created_at)}</span>

          {isOwn && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-5 h-5 flex items-center justify-center rounded-full text-stone-light hover:text-ink hover:bg-parchment-soft transition-colors text-sm leading-none"
                title="Options"
              >
                ···
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-stone-edge rounded-xl shadow-lg z-20 py-1 min-w-[130px]">
                  <button
                    onClick={() => { setEditing(true); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-parchment-soft transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(comment.id); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content or edit area */}
        {editing ? (
          <div className="space-y-2 mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSave(); }
                if (e.key === "Escape") { setEditing(false); setEditContent(comment.content); }
              }}
              autoFocus
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gold bg-parchment-soft text-ink text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none transition-colors leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !editContent.trim()}
                className="px-4 py-1.5 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors disabled:opacity-40"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setEditContent(comment.content); }}
                className="px-4 py-1.5 rounded-full border border-stone-edge text-stone-mid text-xs font-semibold hover:border-gold hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>
    </div>
  );
}
