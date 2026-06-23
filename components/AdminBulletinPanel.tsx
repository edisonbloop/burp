"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminUpdateBulletinApproval,
  adminUpdateBulletinFeatured,
  adminUpdateBulletinStatus,
  adminDeleteBulletinPost,
} from "@/lib/bulletin-actions";
import type { BulletinPost, BulletinCategory } from "@/types/bulletin";

const CATEGORY_LABELS: Record<BulletinCategory, string> = {
  event: "Event",
  promotion: "Promotion / Offer",
  product: "Product",
  service: "Service",
};

export default function AdminBulletinPanel({ posts }: { posts: BulletinPost[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"pending" | "active" | "retired" | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");
  // Posts just acted on stay visible in the current view so they don't appear
  // to vanish after approval (an approved post no longer matches "pending").
  const [recentlyActed, setRecentlyActed] = useState<Set<string>>(new Set());

  const matchesFilter = (post: BulletinPost) => {
    if (filter === "pending") return !post.approved;
    if (filter === "active") return post.approved && post.status === "active";
    if (filter === "retired") return post.status !== "active";
    return true; // "all"
  };

  const filtered = posts.filter((post) => {
    if (!matchesFilter(post) && !recentlyActed.has(post.id)) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.full_name.toLowerCase().includes(q) ||
      (post.business_name?.toLowerCase().includes(q) ?? false) ||
      post.contact_info.toLowerCase().includes(q)
    );
  });

  const pendingCount = posts.filter((p) => !p.approved).length;

  function changeFilter(f: typeof filter) {
    setRecentlyActed(new Set()); // start the new view clean
    setFilter(f);
  }

  function act(id: string, fn: () => Promise<{ error?: string }>) {
    setError("");
    setRecentlyActed((prev) => new Set(prev).add(id));
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {pendingCount > 0 && (
        <button
          onClick={() => changeFilter("pending")}
          className="mb-6 w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left hover:bg-amber-100/60 transition-colors"
        >
          <span className="text-amber-600 font-bold text-lg">{pendingCount}</span>
          <p className="text-base text-amber-700 font-medium font-sans">
            post{pendingCount === 1 ? "" : "s"} waiting for review & approval
            {filter !== "pending" && <span className="font-bold"> — click to review</span>}
          </p>
        </button>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-sans font-medium">
          {error}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search posts by title, poster, business, contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {(["pending", "active", "retired", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              style={{ fontFamily: "var(--font-accent)" }}
              className={`text-xs px-4 py-2 rounded-lg border font-bold tracking-widest uppercase transition-colors ${
                filter === f
                  ? "bg-ink text-vellum border-ink"
                  : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
              }`}
            >
              {f === "active" ? "Live" : f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-stone-mid mb-4 font-medium font-sans">
        {filtered.length} post{filtered.length === 1 ? "" : "s"} found
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm italic font-sans">
          {filter === "pending"
            ? "All posts reviewed — caught up!"
            : "No posts match your selection."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className={`rounded-2xl border bg-white overflow-hidden transition-all ${
                !post.approved
                  ? "border-amber-200 bg-amber-50/20"
                  : post.status !== "active"
                  ? "border-stone-edge bg-stone-edge/5"
                  : post.featured
                  ? "border-gold-soft"
                  : "border-stone-edge"
              }`}
            >
              {/* Row header */}
              <div
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-parchment-soft/50 transition-colors"
                onClick={() => setExpanded(expanded === post.id ? null : post.id)}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex-shrink-0 mt-0.5 bg-gold-wash text-gold-deep border border-gold-soft/50"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {CATEGORY_LABELS[post.category] ?? post.category}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink text-lg truncate" style={{ fontFamily: "var(--font-display)" }}>
                      {post.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-sm font-sans text-stone-mid">
                      <span className="font-semibold text-ink">
                        {post.business_name || post.full_name}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-xs">{post.contact_info}</span>
                      <span>·</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {!post.approved && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                      {post.featured && (
                        <span className="text-[10px] font-bold text-gold-deep bg-gold-wash px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ★ Featured
                        </span>
                      )}
                      {post.status !== "active" && (
                        <span className="text-[10px] font-bold text-stone-mid bg-stone-edge/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {post.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => act(post.id, () => adminUpdateBulletinApproval(post.id, !post.approved))}
                    disabled={isPending}
                    className={`text-xs px-3.5 py-2 rounded-lg border font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                      post.approved
                        ? "border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600"
                        : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    {post.approved ? "Unapprove" : "Approve"}
                  </button>

                  {post.approved && (
                    <button
                      onClick={() => act(post.id, () => adminUpdateBulletinFeatured(post.id, !post.featured))}
                      disabled={isPending}
                      className={`text-xs px-3.5 py-2 rounded-lg border font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                        post.featured
                          ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                          : "border-stone-edge text-stone-mid hover:border-yellow-300 hover:text-yellow-700"
                      }`}
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {post.featured ? "Unfeature" : "Feature"}
                    </button>
                  )}

                  {post.approved && (
                    <button
                      onClick={() =>
                        act(post.id, () =>
                          adminUpdateBulletinStatus(
                            post.id,
                            post.status === "active" ? "expired" : "active"
                          )
                        )
                      }
                      disabled={isPending}
                      className="text-xs px-3.5 py-2 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {post.status === "active" ? "Retire" : "Reactivate"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete post "${post.title}"? This cannot be undone.`)) {
                        act(post.id, () => adminDeleteBulletinPost(post.id));
                      }
                    }}
                    disabled={isPending}
                    className="text-xs px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === post.id && (
                <div className="border-t border-stone-edge/50 px-5 py-5 bg-parchment-soft">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-stone uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-accent)" }}>
                        Details
                      </p>
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
                        {post.description}
                      </p>
                    </div>
                    <div className="space-y-3 text-sm font-sans">
                      <div>
                        <span className="text-xs font-bold text-stone uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>Poster</span>
                        <p className="text-ink">{post.full_name}{post.business_name ? ` · ${post.business_name}` : ""}</p>
                      </div>
                      {post.price && (
                        <div>
                          <span className="text-xs font-bold text-stone uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>Price</span>
                          <p className="text-ink">{post.price}</p>
                        </div>
                      )}
                      {post.location && (
                        <div>
                          <span className="text-xs font-bold text-stone uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>Location</span>
                          <p className="text-ink">{post.location}</p>
                        </div>
                      )}
                      {post.event_date && (
                        <div>
                          <span className="text-xs font-bold text-stone uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>Event Date</span>
                          <p className="text-ink">{new Date(post.event_date).toLocaleString("en-US")}</p>
                        </div>
                      )}
                      {post.link_url && (
                        <div>
                          <span className="text-xs font-bold text-stone uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>Link</span>
                          <p>
                            <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="text-info-earthen hover:underline font-mono text-xs break-all">
                              {post.link_url}
                            </a>
                          </p>
                        </div>
                      )}
                      {post.video_url && (
                        <div>
                          <span className="text-xs font-bold text-stone uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>Video</span>
                          <p>
                            <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="text-danger-earthen hover:underline font-mono text-xs break-all">
                              {post.video_url}
                            </a>
                          </p>
                        </div>
                      )}
                      {post.image_url && (
                        <div>
                          <span className="text-xs font-bold text-stone uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>Flyer</span>
                          <a href={post.image_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={post.image_url} alt="Flyer" className="max-h-40 rounded-lg border border-stone-edge object-contain bg-white" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
