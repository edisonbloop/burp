"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { Avatar } from "@/components/TalkComments";

interface Disc {
  id: string;
  title: string;
  content?: string | null;
  created_at: string;
  plan_id: string;
  user_id?: string | null;
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

export default function FeedPost({ disc }: { disc: Disc }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(disc.content ?? "");
  const [saving, setSaving] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const isOwn = !!(userId && disc.user_id && userId === disc.user_id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, [supabase]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || !userId) return;
    setSaving(true);
    await supabase
      .from("discussions")
      .update({ content: trimmed })
      .eq("id", disc.id)
      .eq("user_id", userId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This can't be undone.")) return;
    if (!userId) return;
    await supabase
      .from("discussions")
      .delete()
      .eq("id", disc.id)
      .eq("user_id", userId);
    setDeleted(true);
    router.refresh();
  };

  if (deleted) return null;

  return (
    <div className="border-b border-stone-edge/60 last:border-0">
      <div className="flex gap-3 px-4 py-5">
        <Avatar name={disc.title || "?"} size="md" />

        <div className="flex-1 min-w-0">
          {/* Name + timestamp + menu */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="font-bold text-ink text-sm">{disc.title}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-stone-light">{timeAgo(disc.created_at)}</span>

              {isOwn && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-stone-light hover:text-ink hover:bg-parchment-soft transition-colors text-base leading-none"
                    title="Post options"
                  >
                    ···
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-stone-edge rounded-xl shadow-lg z-20 py-1 min-w-[120px]">
                      <button
                        onClick={() => { setEditing(true); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-parchment-soft transition-colors"
                      >
                        Edit post
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); handleDelete(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content or edit textarea */}
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSave(); }
                  if (e.key === "Escape") { setEditing(false); setEditContent(disc.content ?? ""); }
                }}
                autoFocus
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-gold bg-parchment-soft text-ink text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none leading-relaxed"
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
                  onClick={() => { setEditing(false); setEditContent(disc.content ?? ""); }}
                  className="px-4 py-1.5 rounded-full border border-stone-edge text-stone-mid text-xs font-semibold hover:border-gold hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            disc.content && (
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap mb-3">
                {disc.content}
              </p>
            )
          )}

          {/* Reply link — hidden while editing */}
          {!editing && (
            <Link
              href={`/talk-it-over/discussion/${disc.id}`}
              className="text-xs font-bold text-stone-light hover:text-gold transition-colors uppercase tracking-widest"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Reply →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
