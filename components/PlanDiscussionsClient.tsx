"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PostToFeed from "@/components/PostToFeed";
import FeedPost from "@/components/FeedPost";
import FeedThread from "@/components/FeedThread";
import { anyTextMatchesQuery, normalizeSearchQuery } from "@/lib/search-utils";

type Disc = {
  id: string;
  title: string;
  content?: string | null;
  created_at: string;
  plan_id: string;
  day_number?: number | null;
  user_id?: string | null;
  thread_id?: string | null;
  thread_index?: number | null;
};

function matchesSearch(item: Disc, query: string): boolean {
  if (!normalizeSearchQuery(query)) return true;
  if (anyTextMatchesQuery(query, item.title, item.content)) return true;
  if (item.day_number != null) {
    const q = normalizeSearchQuery(query);
    if (String(item.day_number) === q) return true;
    if (`day ${item.day_number}`.toLocaleLowerCase("en-US").includes(q)) return true;
  }
  return false;
}

function groupMatchesSearch(group: Disc[], query: string): boolean {
  return group.some((post) => matchesSearch(post, query));
}

export default function PlanDiscussionsClient({
  planId,
  planTitle,
  planDescription,
  feedGroups,
  dayDiscussions,
}: {
  planId: string;
  planTitle: string;
  planDescription?: string | null;
  feedGroups: Disc[][];
  dayDiscussions: Disc[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFeedGroups = useMemo(
    () => feedGroups.filter((group) => groupMatchesSearch(group, searchQuery)),
    [feedGroups, searchQuery]
  );

  const filteredDayDiscussions = useMemo(
    () => dayDiscussions.filter((disc) => matchesSearch(disc, searchQuery)),
    [dayDiscussions, searchQuery]
  );

  const hasSearch = searchQuery.trim().length > 0;
  const totalVisible = filteredFeedGroups.length + filteredDayDiscussions.length;
  const isEmpty = feedGroups.length === 0 && dayDiscussions.length === 0;
  const noSearchResults = hasSearch && totalVisible === 0 && !isEmpty;

  return (
    <>
      {/* Plan header bar */}
      <div className="sticky top-0 z-10 bg-vellum/90 backdrop-blur border-b border-stone-edge">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/talk-it-over" className="text-stone-mid hover:text-ink transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink text-sm truncate">{planTitle}</p>
            {planDescription && (
              <p className="text-xs text-stone-light truncate">{planDescription}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-8">
        {/* Search */}
        {!isEmpty && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts, threads, or day number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-parchment-soft border border-stone-edge text-ink text-sm rounded-full pl-5 pr-10 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-stone-light/75"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-light pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        )}

        {/* Compose */}
        <PostToFeed planId={planId} />

        {/* Community feed */}
        <section>
          <div className="mb-4">
            <p
              className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-1"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Community Feed
            </p>
            <p className="text-xs text-stone-mid leading-relaxed">
              Share reflections, questions, and burps from your reading — open conversation with the room.
            </p>
          </div>

          {filteredFeedGroups.length > 0 ? (
            <div className="bg-parchment-soft border border-stone-edge rounded-2xl overflow-hidden divide-y divide-stone-edge/60">
              {filteredFeedGroups.map((group) =>
                group.length === 1 ? (
                  <FeedPost key={group[0].id} disc={group[0]} />
                ) : (
                  <FeedThread key={group[0].thread_id!} posts={group} />
                )
              )}
            </div>
          ) : feedGroups.length === 0 ? (
            <div className="text-center py-10 bg-parchment-soft rounded-2xl border border-dashed border-stone-edge">
              <p className="text-stone-mid text-sm">No community posts yet.</p>
              <p className="text-xs text-stone-light mt-1">Be the first to share a reflection above.</p>
            </div>
          ) : hasSearch ? (
            <div className="text-center py-8 bg-parchment-soft rounded-2xl border border-stone-edge">
              <p className="text-stone-mid text-sm">No feed posts match your search.</p>
            </div>
          ) : null}
        </section>

        {/* Day discussion threads */}
        <section>
          <div className="mb-4">
            <p
              className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-1"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Reading Plan — Day by Day
            </p>
            <p className="text-xs text-stone-mid leading-relaxed">
              Structured daily threads for this plan — scripture, prompts, and guided discussion.
            </p>
          </div>

          {filteredDayDiscussions.length > 0 ? (
            <div className="space-y-2">
              {filteredDayDiscussions.map((disc) => (
                <Link
                  key={disc.id}
                  href={`/talk-it-over/discussion/${disc.id}`}
                  className="flex items-center gap-4 px-5 py-4 bg-parchment-soft border border-stone-edge rounded-2xl hover:border-gold-soft hover:bg-gold-wash transition-all group"
                >
                  {disc.day_number != null && (
                    <span
                      className="text-xs font-bold text-gold-deep bg-gold-wash border border-gold-soft rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 group-hover:bg-gold group-hover:text-vellum transition-colors"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {disc.day_number}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate group-hover:text-gold-deep transition-colors">
                      {disc.title}
                    </p>
                    {disc.content && (
                      <p className="text-xs text-stone-light truncate mt-0.5">{disc.content}</p>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 text-stone-light group-hover:text-gold transition-colors flex-shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M4 8h8M9 5l3 3-3 3" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : dayDiscussions.length === 0 ? (
            <div className="text-center py-10 bg-parchment-soft rounded-2xl border border-dashed border-stone-edge">
              <p className="text-stone-mid text-sm">No day threads yet for this plan.</p>
              <p className="text-xs text-stone-light mt-1">Daily reading prompts will appear here as they&apos;re added.</p>
            </div>
          ) : hasSearch ? (
            <div className="text-center py-8 bg-parchment-soft rounded-2xl border border-stone-edge">
              <p className="text-stone-mid text-sm">No day threads match your search.</p>
            </div>
          ) : null}
        </section>

        {noSearchResults && (
          <div className="text-center py-8">
            <p className="text-stone-mid text-sm mb-2">Nothing matches &ldquo;{searchQuery}&rdquo;</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-gold-deep hover:text-gold font-semibold transition-colors"
            >
              Clear search
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="text-center py-12 bg-parchment-soft rounded-2xl border border-stone-edge">
            <p className="text-stone-mid text-sm">This plan is just getting started.</p>
            <p className="text-xs text-stone-light mt-1">Share something in the feed above to begin the conversation.</p>
          </div>
        )}
      </div>
    </>
  );
}
