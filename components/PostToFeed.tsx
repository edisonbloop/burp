"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { Avatar } from "@/components/TalkComments";

interface Profile {
  full_name: string | null;
}

export default function PostToFeed({ planId }: { planId: string }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

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

  const handlePost = async () => {
    const trimmed = content.trim();
    if (!trimmed || !userId || !profile) return;
    setPosting(true);
    setError("");

    const name = profile.full_name || "Anonymous";

    const { error: err } = await supabase.from("discussions").insert({
      plan_id: planId,
      title: name,
      content: trimmed,
      day_number: null,
      user_id: userId,
    });

    if (err) {
      setError("Couldn't post. Please try again.");
      setPosting(false);
      return;
    }

    setContent("");
    textareaRef.current?.blur();
    router.refresh();
    setPosting(false);
  };

  // Still resolving auth
  if (!ready) return null;

  // Not signed in — soft prompt
  if (!userId) {
    return (
      <Link
        href={`/signin?redirect=${encodeURIComponent(pathname)}`}
        className="flex items-center gap-3 px-4 py-3.5 mb-1 rounded-2xl border border-dashed border-stone-edge hover:border-gold-soft hover:bg-parchment-soft transition-all group"
      >
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-stone-edge group-hover:border-gold-soft flex items-center justify-center flex-shrink-0 transition-colors">
          <span className="text-stone-light group-hover:text-gold text-base leading-none transition-colors">+</span>
        </div>
        <span className="text-sm text-stone-mid group-hover:text-ink transition-colors">
          Share something with the group…
        </span>
        <span
          className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gold flex-shrink-0"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Sign In →
        </span>
      </Link>
    );
  }

  const name = profile?.full_name || "Anonymous";

  return (
    <div className="mb-2">
      <div className="flex gap-3 items-start px-4 py-4 rounded-2xl bg-parchment-soft border border-stone-edge">
        <Avatar name={name} size="md" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (content.trim()) handlePost();
              }
            }}
            placeholder="Share something with the group…"
            rows={3}
            className="w-full bg-transparent text-ink placeholder:text-stone-light text-sm focus:outline-none resize-none leading-relaxed"
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-edge/50">
            <span className="text-xs text-stone-light">{name}</span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="px-5 py-2 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-widest hover:bg-stone transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
