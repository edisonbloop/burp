"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { Avatar } from "@/components/TalkComments";
import EmojiPicker from "@/components/EmojiPicker";

interface Profile { full_name: string | null }

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
  currentValue: string,
  setValue: (v: string) => void
) {
  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;
  setValue(currentValue.slice(0, start) + text + currentValue.slice(end));
  setTimeout(() => {
    textarea.selectionStart = start + text.length;
    textarea.selectionEnd = start + text.length;
    textarea.focus();
  }, 0);
}

export default function PostToFeed({ planId }: { planId: string }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  // Thread state: array of post contents
  const [posts, setPosts] = useState<string[]>([""]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Refs for each textarea in the thread
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .single();
        setProfile(data ?? { full_name: session.user.email ?? null });
      }
      setReady(true);
    });
  }, [supabase]);

  const name = profile?.full_name || "Anonymous";
  const isThread = posts.length > 1;
  const hasContent = posts.some((p) => p.trim());

  const updatePost = (i: number, value: string) => {
    setPosts((prev) => prev.map((p, j) => (j === i ? value : p)));
  };

  const addPost = () => {
    setPosts((prev) => [...prev, ""]);
    setTimeout(() => {
      textareaRefs.current[posts.length]?.focus();
    }, 50);
  };

  const removePost = (i: number) => {
    if (posts.length <= 1) return;
    setPosts((prev) => prev.filter((_, j) => j !== i));
  };

  const handlePost = async () => {
    const trimmed = posts.map((p) => p.trim()).filter(Boolean);
    if (!trimmed.length || !userId) return;
    setPosting(true);
    setError("");

    try {
      if (trimmed.length === 1) {
        // Single post
        const { error: err } = await supabase.from("discussions").insert({
          plan_id: planId,
          title: name,
          content: trimmed[0],
          user_id: userId,
        });
        if (err) { setError("Couldn't post. Please try again."); setPosting(false); return; }
      } else {
        // Thread — generate shared thread_id
        const thread_id = crypto.randomUUID();
        const rows = trimmed.map((content, thread_index) => ({
          plan_id: planId,
          title: name,
          content,
          user_id: userId,
          thread_id,
          thread_index,
        }));
        const { error: err } = await supabase.from("discussions").insert(rows);
        if (err) { setError("Couldn't post thread. Please try again."); setPosting(false); return; }
      }

      setPosts([""]);
      router.refresh();
    } finally {
      setPosting(false);
    }
  };

  if (!ready) return null;

  // Not signed in
  if (!userId) {
    return (
      <Link
        href={`/signin?redirect=${encodeURIComponent(pathname)}`}
        className="flex items-center gap-3 px-4 py-3.5 mb-1 rounded-2xl border border-dashed border-stone-edge hover:border-gold-soft hover:bg-parchment-soft transition-all group"
      >
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-stone-edge group-hover:border-gold-soft flex items-center justify-center flex-shrink-0 transition-colors">
          <span className="text-stone-light group-hover:text-gold text-base leading-none transition-colors">+</span>
        </div>
        <span className="text-sm text-stone-mid group-hover:text-ink transition-colors">Share something with the group…</span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gold flex-shrink-0" style={{ fontFamily: "var(--font-accent)" }}>
          Sign In →
        </span>
      </Link>
    );
  }

  return (
    <div className="mb-2">
      <div className="rounded-2xl bg-parchment-soft border border-stone-edge px-4 py-4">
        {posts.map((content, i) => (
          <div key={i} className="flex gap-3 items-start">
            {/* Avatar column with thread line */}
            <div className="flex flex-col items-center flex-shrink-0">
              {i === 0 ? (
                <Avatar name={name} size="md" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gold/40 flex items-center justify-center text-vellum text-[9px] font-bold" style={{ fontFamily: "var(--font-accent)" }}>
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
              {/* Connecting line to next post */}
              {i < posts.length - 1 && (
                <div className="w-0.5 flex-1 bg-stone-edge my-1.5 min-h-[16px]" />
              )}
            </div>

            {/* Content column */}
            <div className={`flex-1 ${i < posts.length - 1 ? "pb-2" : ""}`}>
              {i === 0 && (
                <p className="text-xs font-semibold text-stone-mid mb-1.5">{name}</p>
              )}
              <div className="relative">
                <textarea
                  ref={(el) => { textareaRefs.current[i] = el; }}
                  value={content}
                  onChange={(e) => updatePost(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      if (hasContent) handlePost();
                    }
                  }}
                  placeholder={
                    i === 0
                      ? "Share something with the group… Paste links or YouTube URLs — they’ll show as rich previews."
                      : "Add to thread… Links and videos work here too."
                  }
                  rows={i === 0 ? 3 : 2}
                  autoFocus={i === 0}
                  className="w-full bg-transparent text-ink placeholder:text-stone-light text-sm focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Per-post bottom row: emoji + remove */}
              {isThread && (
                <div className="flex items-center gap-2 mt-1">
                  <EmojiPicker
                    onSelect={(emoji) => {
                      const ta = textareaRefs.current[i];
                      if (ta) insertAtCursor(ta, emoji, content, (v) => updatePost(i, v));
                      else updatePost(i, content + emoji);
                    }}
                  />
                  {posts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePost(i)}
                      className="text-[10px] text-stone-light hover:text-red-500 transition-colors ml-auto"
                      title="Remove this post"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-xs text-red-500 mt-2 ml-10">{error}</p>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-edge/50 ml-10">
          <div className="flex items-center gap-3">
            {/* Emoji (single post mode) */}
            {!isThread && (
              <EmojiPicker
                onSelect={(emoji) => {
                  const ta = textareaRefs.current[0];
                  if (ta) insertAtCursor(ta, emoji, posts[0], (v) => updatePost(0, v));
                  else updatePost(0, posts[0] + emoji);
                }}
              />
            )}

            {/* Add to thread */}
            {posts.length < 10 && (
              <button
                type="button"
                onClick={addPost}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-light hover:text-gold-deep transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
                title="Add another post to this thread"
              >
                <span className="w-5 h-5 rounded-full border border-stone-edge flex items-center justify-center text-xs leading-none hover:border-gold transition-colors">
                  +
                </span>
                <span className="hidden sm:inline">Add to thread</span>
              </button>
            )}
          </div>

          <button
            onClick={handlePost}
            disabled={posting || !hasContent}
            className={`px-5 py-2 rounded-full text-vellum text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-40 ${
              isThread ? "bg-gold-deep hover:bg-gold" : "bg-ink hover:bg-stone"
            }`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {posting ? "Posting…" : isThread ? `Post Thread (${posts.filter(p => p.trim()).length})` : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
