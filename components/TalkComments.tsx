"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

interface Profile {
  id: string;
  full_name: string | null;
}

export default function TalkComments({
  discussionId,
  initialComments,
}: {
  discussionId: string;
  initialComments: Comment[];
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    if (isLoginView) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/talk-it-over/discussion/${discussionId}`,
        },
      });
      if (error) {
        setAuthError(error.message);
      } else if (data.user) {
        await supabase.from("profiles").insert({ id: data.user.id, full_name: fullName });
        if (!data.session) router.push("/signin/check-email");
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !profile) return;
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ discussion_id: discussionId, user_id: user.id, content: newComment.trim() })
      .select("*, profiles(full_name)")
      .single();
    if (!error && data) {
      setComments([...comments, data as Comment]);
      setNewComment("");
    }
    setIsSubmitting(false);
  };

  const initials = (name: string | null | undefined) =>
    (name ?? "A")[0].toUpperCase();

  return (
    <div className="mt-12 max-w-3xl mx-auto border-t border-stone-edge pt-10">
      <h3
        className="text-2xl font-bold text-ink mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Talk It Over
      </h3>

      {/* Comments list */}
      <div className="space-y-4 mb-10">
        {comments.length === 0 ? (
          <p className="text-stone-mid italic text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-parchment-soft p-5 rounded-2xl border border-stone-edge"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gold-wash flex items-center justify-center text-xs font-bold text-gold-deep flex-shrink-0">
                    {initials(comment.profiles?.full_name)}
                  </div>
                  <span className="font-semibold text-gold-deep text-sm">
                    {comment.profiles?.full_name ?? "Anonymous"}
                  </span>
                </div>
                <span className="text-xs text-stone-light">
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-ink leading-relaxed whitespace-pre-wrap text-sm">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Auth or comment form */}
      {!user ? (
        <div className="bg-parchment-soft p-6 rounded-2xl border border-stone-edge">
          <h4 className="text-base font-semibold text-ink mb-1">
            {isLoginView ? "Sign in to join the discussion" : "Create an account"}
          </h4>
          <p className="text-sm text-stone-mid mb-5">
            {isLoginView
              ? "Your comment will appear alongside your name."
              : "Quick setup — you'll be sharing in moments."}
          </p>

          {authError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              {authError}
            </p>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            {!isLoginView && (
              <input
                type="text"
                placeholder="Your full name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-3 items-center pt-1">
              <button
                type="submit"
                disabled={authLoading}
                className="px-6 py-3 rounded-xl bg-ink text-vellum font-semibold hover:bg-stone transition-colors w-full sm:w-auto disabled:opacity-60 text-sm"
              >
                {authLoading
                  ? "Please wait…"
                  : isLoginView
                  ? "Sign In"
                  : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginView(!isLoginView); setAuthError(""); }}
                className="text-sm text-stone-mid hover:text-gold-deep transition-colors"
              >
                {isLoginView
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-parchment-soft p-6 rounded-2xl border border-stone-edge">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-mid">
              Commenting as{" "}
              <span className="font-semibold text-gold-deep">
                {profile?.full_name ?? user.email}
              </span>
            </p>
            <button
              onClick={handleSignOut}
              className="text-xs text-stone-light hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </div>
          <form onSubmit={submitComment}>
            <textarea
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or a reflection from today's reading…"
              className="w-full px-4 py-4 rounded-xl border border-stone-edge bg-vellum text-ink min-h-[120px] focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold resize-y mb-4 text-sm placeholder:text-stone-light transition"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-6 py-3 rounded-xl bg-ink text-vellum font-semibold hover:bg-stone transition-colors disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "Posting…" : "Post Comment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
