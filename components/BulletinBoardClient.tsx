"use client";

import { useState } from "react";
import BulletinPostCard from "./BulletinPostCard";
import type { BulletinPost, BulletinCategory } from "@/types/bulletin";

const CATEGORIES: { id: BulletinCategory | "all"; label: string }[] = [
  { id: "all", label: "All Posts" },
  { id: "event", label: "Events" },
  { id: "promotion", label: "Promotions" },
  { id: "product", label: "Products" },
  { id: "service", label: "Services" },
];

export default function BulletinBoardClient({
  initialPosts,
}: {
  initialPosts: BulletinPost[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<BulletinCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryFiltered =
    selectedCategory === "all"
      ? initialPosts
      : initialPosts.filter((p) => p.category === selectedCategory);

  const searched = categoryFiltered.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.full_name.toLowerCase().includes(q) ||
      (p.business_name?.toLowerCase().includes(q) ?? false) ||
      (p.location?.toLowerCase().includes(q) ?? false)
    );
  });

  const countFor = (id: BulletinCategory | "all") =>
    id === "all" ? initialPosts.length : initialPosts.filter((p) => p.category === id).length;

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-vellum/90 backdrop-blur border-b border-stone-edge flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 [scrollbar-width:none]">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 text-xs px-4 py-2 rounded-full border transition-all uppercase tracking-wider font-semibold flex items-center gap-2 ${
                  isSelected
                    ? "bg-ink text-vellum border-ink shadow-sm"
                    : "border-stone-edge text-stone bg-white hover:border-gold hover:text-ink"
                }`}
                style={{ fontFamily: "var(--font-accent)" }}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                    isSelected ? "bg-white/20 text-vellum" : "bg-stone-edge/50 text-stone-mid"
                  }`}
                >
                  {countFor(cat.id)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search the bulletin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-edge shadow-sm text-ink text-sm rounded-full pl-5 pr-10 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-stone-light/75"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-light">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Feed */}
      {searched.length === 0 ? (
        <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge/50 max-w-4xl mx-auto">
          <p className="text-3xl mb-3 text-gold" style={{ fontFamily: "var(--font-display)" }}>✦</p>
          <p className="text-stone-mid text-sm italic font-sans mb-5">
            {searchQuery.trim() || selectedCategory !== "all"
              ? "Nothing matches that. Try another category or search."
              : "Nothing here yet. Be the first to share something with the community!"}
          </p>
          <a
            href="/bulletin/submit"
            className="inline-block px-6 py-3 rounded-full bg-ink hover:bg-stone text-vellum text-xs font-bold tracking-widest uppercase transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Post to the bulletin
          </a>
        </div>
      ) : (
        <>
          <p className="text-xs text-stone-mid">
            Showing {searched.length} post{searched.length !== 1 ? "s" : ""}
          </p>
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto items-start">
          {searched.map((post) => (
            <BulletinPostCard key={post.id} post={post} />
          ))}
        </div>
        </>
      )}

      {/* Scripture banner */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-gold-soft/60 bg-gradient-to-br from-gold-wash to-parchment-soft py-10 px-6 text-center">
        <span
          className="text-[10px] font-bold tracking-widest text-gold uppercase block mb-3"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          1 Thessalonians 5:11
        </span>
        <p className="text-lg sm:text-xl text-ink/80 italic leading-relaxed max-w-2xl mx-auto">
          <span style={{ fontFamily: "var(--font-display)" }}>&ldquo;Wherefore comfort yourselves together, and edify one another, even as also ye do.&rdquo;</span>
        </p>
      </div>
    </div>
  );
}
