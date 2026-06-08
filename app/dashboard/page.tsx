"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getUserLibraryItems, getUserComments } from "@/lib/dashboard-actions";
import { getReadingPlans } from "@/lib/talk-actions";
import type { LibraryItem } from "@/types/library";
import { getDailyKey, getToday, formatDailyDate, type DailyResult } from "@/lib/daily-challenge";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  discussion_id: string;
  discussions: {
    id: string;
    title: string;
    day_number: number;
    plan_id: string;
    reading_plans: { id: string; title: string } | null;
  } | null;
};

type Plan = { id: string; title: string; description?: string };

type GameStat = { bestPct: number; bestStreak: number; gamesPlayed: number; lastPlayed?: string };
type GameStats = { guess: GameStat; whosaidit: GameStat; trueorfalse: GameStat };

const TYPE_LABELS: Record<string, string> = {
  poems: "Poem",
  "write-ups": "Write-Up",
  "long-messages": "Long Message",
  videos: "Video",
  others: "Other",
};

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient();
  const [userName, setUserName] = useState("");
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [today] = useState(() => getToday());

  useEffect(() => {
    const read = (key: string): GameStat =>
      JSON.parse(localStorage.getItem(key) ?? "{}") as GameStat;
    setGameStats({
      guess:        read("burp_game_guess"),
      whosaidit:    read("burp_game_whosaidit"),
      trueorfalse:  read("burp_game_trueorfalse"),
    });
    const stored = localStorage.getItem(getDailyKey(today));
    if (stored) setDailyResult(JSON.parse(stored) as DailyResult);
  }, [today]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const uid = session.user.id;

      // Grab display name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", uid)
        .single();
      if (profile?.full_name) setUserName(profile.full_name);

      // Fetch all personal data in parallel
      const [items, userComments, readingPlans] = await Promise.all([
        getUserLibraryItems(uid),
        getUserComments(uid),
        getReadingPlans(),
      ]);

      setLibraryItems(items as LibraryItem[]);
      // Supabase infers nested joins as arrays; cast via unknown to our flatter Comment type
      setComments(userComments as unknown as Comment[]);
      setPlans(readingPlans as Plan[]);
      setLoading(false);
    });
  }, [supabase]);

  const totalViews = libraryItems.reduce(
    (sum, item) => sum + (item.view_count ?? 0),
    0
  );
  const approvedCount = libraryItems.filter((i) => i.approved).length;

  if (loading) {
    return (
      <div className="p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-parchment-soft rounded w-40" />
          <div className="h-10 bg-parchment-soft rounded w-72" />
          <div className="h-4 bg-parchment-soft rounded w-80 mt-2" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-parchment-soft rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const firstName = userName ? userName.split(" ")[0] : null;

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <header className="mb-10">
        <p
          className="text-xs font-bold tracking-widest uppercase text-gold mb-1"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Welcome back
        </p>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink mb-2 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {firstName ? `Hello, ${firstName}` : "Your Dashboard"}
        </h1>
        <p className="text-stone-mid text-base">
          Your contributions, reflections, and reading journey — all in one place.
        </p>
      </header>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { value: libraryItems.length, label: "Submissions" },
          { value: approvedCount, label: "Published" },
          { value: totalViews, label: "Total Views" },
          { value: comments.length, label: "Reflections" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="bg-parchment-soft border border-stone-edge rounded-2xl p-5"
          >
            <p
              className="text-4xl font-bold text-ink leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {value}
            </p>
            <p className="text-xs text-stone-light uppercase tracking-wider mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Games ── */}
      {gameStats && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-2xl font-bold text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              My Games
            </h2>
            <Link
              href="/games"
              className="text-xs font-bold tracking-widest text-gold uppercase hover:text-gold-deep transition-colors"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Play →
            </Link>
          </div>

          {(() => {
            const rows = [
              { key: "guess",        label: "Guess the Character", emoji: "🎭", stat: gameStats.guess        },
              { key: "whosaidit",    label: "Who Said It?",        emoji: "💬", stat: gameStats.whosaidit    },
              { key: "trueorfalse",  label: "True or False",       emoji: "⚡", stat: gameStats.trueorfalse  },
            ];
            const totalPlayed = rows.reduce((s, r) => s + (r.stat.gamesPlayed ?? 0), 0);
            const overallBestStreak = rows.reduce((s, r) => Math.max(s, r.stat.bestStreak ?? 0), 0);

            if (totalPlayed === 0) {
              return (
                <div className="bg-parchment-soft border border-stone-edge rounded-2xl p-8 text-center">
                  <p className="text-stone-mid">You haven&rsquo;t played any games yet.</p>
                  <Link
                    href="/games"
                    className="text-sm text-gold font-semibold mt-3 inline-block hover:underline"
                  >
                    Start playing →
                  </Link>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {/* Daily challenge card */}
                {dailyResult?.completed ? (
                  <div className="flex items-center justify-between bg-[#f0f7eb] border border-[#b5d99a] rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-xs font-bold text-[#4a7a30] uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
                          Daily Challenge — {formatDailyDate(today)}
                        </p>
                        <p className="text-sm font-semibold text-ink mt-0.5">
                          Completed ✓ &nbsp;{dailyResult.score}/{dailyResult.total} correct
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/games/daily"
                    className="flex items-center justify-between bg-ink text-vellum rounded-2xl px-5 py-4 hover:bg-stone transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-xs font-bold text-gold uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
                          Daily Challenge — {formatDailyDate(today)}
                        </p>
                        <p className="text-sm font-semibold text-vellum/80 mt-0.5">Not played yet</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gold uppercase tracking-widest group-hover:translate-x-1 transition-transform" style={{ fontFamily: "var(--font-accent)" }}>
                      Play →
                    </span>
                  </Link>
                )}

                {/* Summary bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {[
                    { value: totalPlayed,                                    label: "Games Played" },
                    { value: overallBestStreak > 0 ? `${overallBestStreak} 🔥` : "—", label: "Best Streak"  },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-parchment-soft border border-stone-edge rounded-2xl p-5">
                      <p className="text-4xl font-bold text-ink leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        {value}
                      </p>
                      <p className="text-xs text-stone-light uppercase tracking-wider mt-2">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Per-game cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {rows.map(({ key, label, emoji, stat }) => (
                    <div key={key} className="bg-parchment-soft border border-stone-edge rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{emoji}</span>
                        <p className="text-sm font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>{label}</p>
                      </div>
                      {stat.gamesPlayed > 0 ? (
                        <div className="flex items-center gap-4 text-sm text-stone-mid">
                          <span>Best <span className="font-bold text-ink">{stat.bestPct ?? 0}%</span></span>
                          {(stat.bestStreak ?? 0) > 0 && (
                            <span>Streak <span className="font-bold text-gold-deep">{stat.bestStreak} 🔥</span></span>
                          )}
                          <span className="ml-auto text-xs text-stone-light">{stat.gamesPlayed}×</span>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-light">Not played yet</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* ── My Submissions ── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-2xl font-bold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Submissions
          </h2>
          <Link
            href="/library/submit"
            className="text-xs font-bold tracking-widest text-gold uppercase hover:text-gold-deep transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            + Submit New
          </Link>
        </div>

        {libraryItems.length === 0 ? (
          <div className="bg-parchment-soft border border-stone-edge rounded-2xl p-8 text-center">
            <p className="text-stone-mid">
              You haven&rsquo;t submitted anything to the library yet.
            </p>
            <Link
              href="/library/submit"
              className="text-sm text-gold font-semibold mt-3 inline-block hover:underline"
            >
              Submit your first piece →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {libraryItems.map((item) => (
              <div
                key={item.id}
                className="bg-parchment-soft border border-stone-edge rounded-2xl p-5 flex flex-col"
              >
                {/* Top row: status + type */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                      item.approved
                        ? "bg-gold-wash text-gold-deep border border-gold-soft"
                        : "bg-vellum text-stone-mid border border-stone-edge"
                    }`}
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {item.approved ? "Published" : "Pending Review"}
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase text-stone-light"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-bold text-ink text-lg leading-snug mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>

                {/* Meta: date + views */}
                <p className="text-sm text-stone-light mb-3">
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {item.view_count
                    ? ` · ${item.view_count} view${item.view_count !== 1 ? "s" : ""}`
                    : ""}
                </p>

                {/* Original source link */}
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold hover:underline font-medium block mb-3 truncate"
                  >
                    ↗ Original publication
                  </a>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-auto">
                  {item.approved && (
                    <Link
                      href={`/library/item/${item.id}`}
                      className="text-xs font-bold text-gold hover:text-gold-deep transition-colors"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      View piece →
                    </Link>
                  )}
                  <Link
                    href={`/library/edit/${item.id}`}
                    className="text-xs font-semibold text-stone-mid hover:text-ink transition-colors ml-auto"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── My Reflections ── */}
      <section className="mb-12">
        <h2
          className="text-2xl font-bold text-ink mb-5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          My Reflections
        </h2>

        {comments.length === 0 ? (
          <div className="bg-parchment-soft border border-stone-edge rounded-2xl p-8 text-center">
            <p className="text-stone-mid">
              No discussion comments yet. Join a reading plan to start
              reflecting.
            </p>
            <Link
              href="/talk-it-over"
              className="text-sm text-gold font-semibold mt-3 inline-block hover:underline"
            >
              Browse reading plans →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.slice(0, 10).map((comment) => (
              <div
                key={comment.id}
                className="bg-parchment-soft border border-stone-edge rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold text-gold-deep uppercase tracking-wide"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {comment.discussions?.reading_plans?.title ??
                        "Reading Plan"}
                      {comment.discussions?.day_number != null &&
                        ` · Day ${comment.discussions.day_number}`}
                    </p>
                    <p className="text-sm font-semibold text-ink mt-0.5 truncate">
                      {comment.discussions?.title ?? "Discussion"}
                    </p>
                  </div>
                  <p className="text-xs text-stone-light whitespace-nowrap flex-shrink-0">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm text-stone-mid leading-relaxed line-clamp-3 mb-3">
                  {comment.content}
                </p>
                {comment.discussions && (
                  <Link
                    href={`/talk-it-over/${comment.discussions.plan_id}/${comment.discussion_id}`}
                    className="text-xs font-bold text-gold hover:text-gold-deep transition-colors"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Go to discussion →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Reading Plans ── */}
      <section>
        <h2
          className="text-2xl font-bold text-ink mb-5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Reading Plans
        </h2>

        {plans.length === 0 ? (
          <div className="bg-parchment-soft border border-stone-edge rounded-2xl p-8 text-center">
            <p className="text-stone-mid">No reading plans yet.</p>
            <p className="text-sm text-stone-light mt-1">
              An organiser will add one soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/talk-it-over/${plan.id}`}
                className="block bg-parchment-soft p-6 rounded-2xl border border-stone-edge shadow-sm hover:border-gold-soft hover:shadow-md transition-all group"
              >
                <h3
                  className="text-xl font-bold text-ink mb-2 group-hover:text-gold transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {plan.title}
                </h3>
                {plan.description && (
                  <p className="text-sm text-stone-mid line-clamp-2">
                    {plan.description}
                  </p>
                )}
                <p
                  className="text-xs text-gold font-bold mt-4 uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  View discussions →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
