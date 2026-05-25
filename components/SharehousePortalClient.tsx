"use client";

import { useState } from "react";
import SharehouseNeedCard from "./SharehouseNeedCard";
import SharehouseUpdateModal from "./SharehouseUpdateModal";
import type { SharehouseNeed, SharehouseCategory } from "@/types/sharehouse";

const CATEGORIES: { id: SharehouseCategory | "all"; label: string }[] = [
  { id: "all", label: "All Needs" },
  { id: "financial", label: "Financial" },
  { id: "medical", label: "Medical Support" },
  { id: "job", label: "Job Opportunities" },
  { id: "education", label: "Educational" },
  { id: "emotional", label: "Emotional" },
  { id: "practical", label: "Practical" },
  { id: "other", label: "Other" },
];

export default function SharehousePortalClient({ initialNeeds }: { initialNeeds: SharehouseNeed[] }) {
  const [activeTab, setActiveTab] = useState<"active" | "met">("active");
  const [selectedCategory, setSelectedCategory] = useState<SharehouseCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updateNeedId, setUpdateNeedId] = useState<string | null>(null);

  // Filter based on tab
  const tabFiltered = initialNeeds.filter((need) => need.status === activeTab);

  // Filter based on category
  const categoryFiltered = selectedCategory === "all"
    ? tabFiltered
    : tabFiltered.filter((need) => need.category === selectedCategory);

  // Filter based on search query
  const searchedNeeds = categoryFiltered.filter((need) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      need.title.toLowerCase().includes(q) ||
      need.description.toLowerCase().includes(q) ||
      (need.anonymous ? false : need.full_name.toLowerCase().includes(q))
    );
  });

  const activeCount = initialNeeds.filter((n) => n.status === "active").length;
  const metCount = initialNeeds.filter((n) => n.status === "met").length;

  return (
    <div className="space-y-10">
      {/* Search and Tab Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-stone-edge pb-6">
        {/* Toggle between Active Needs & Met testimonies */}
        <div className="flex gap-1.5 bg-parchment-soft rounded-2xl p-1.5 border border-stone-edge w-full md:w-fit">
          <button
            onClick={() => {
              setActiveTab("active");
              setSelectedCategory("all");
            }}
            className={`flex-1 md:flex-initial px-5 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === "active"
                ? "bg-ink text-vellum shadow-md"
                : "text-stone-mid hover:text-ink"
            }`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            <span>Active Needs</span>
            <span
              className={`text-[10px] font-bold rounded-full px-2 py-0.5 leading-none transition-colors ${
                activeTab === "active" ? "bg-gold text-white" : "bg-stone-edge/50 text-stone-mid"
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("met");
              setSelectedCategory("all");
            }}
            className={`flex-1 md:flex-initial px-5 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === "met"
                ? "bg-ink text-vellum shadow-md"
                : "text-stone-mid hover:text-ink"
            }`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            <span>Answered & Met</span>
            <span
              className={`text-[10px] font-bold rounded-full px-2 py-0.5 leading-none transition-colors ${
                activeTab === "met" ? "bg-gold text-white" : "bg-stone-edge/50 text-stone-mid"
              }`}
            >
              {metCount}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search needs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-vellum border border-stone-edge text-ink text-sm rounded-full pl-5 pr-10 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-stone-light/75"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-light">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Category Pills Filters */}
      <div className="space-y-3">
        <span
          className="text-[9px] font-bold tracking-widest text-stone-light uppercase block text-center md:text-left"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Filter by category
        </span>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-4 py-2 rounded-full border transition-all uppercase tracking-wider font-semibold ${
                  isSelected
                    ? "bg-gold text-white border-gold shadow-sm scale-[1.02]"
                    : "border-stone-edge text-stone bg-white hover:border-gold hover:text-ink"
                }`}
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid / Feed */}
      {searchedNeeds.length === 0 ? (
        <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge/50 max-w-4xl mx-auto">
          <p className="text-stone-mid text-sm italic font-sans mb-4">
            {activeTab === "active"
              ? "No active burdens in this category. Let's thank God for His abundant provision!"
              : "No testimonies in this category yet. We await His faithful answers in patience."}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {searchedNeeds.map((need) => (
            <SharehouseNeedCard
              key={need.id}
              need={need}
              onMarkAsMet={(id) => setUpdateNeedId(id)}
            />
          ))}
        </div>
      )}

      {/* Scripture Banner */}
      <div className="max-w-4xl mx-auto border-y border-stone-edge/30 py-8 text-center bg-vellum">
        <span
          className="text-[10px] font-bold tracking-widest text-gold uppercase block mb-3"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Romans 12:13 · Galatians 6:2
        </span>
        <p className="text-sm sm:text-base text-stone-mid italic leading-relaxed font-serif max-w-2xl mx-auto">
          &ldquo;Distributing to the necessity of saints; given to hospitality... Bear ye one another&apos;s burdens, and so fulfil the law of Christ.&rdquo;
        </p>
      </div>

      {/* Modal Trigger */}
      {updateNeedId && (
        <SharehouseUpdateModal
          needId={updateNeedId}
          onClose={() => setUpdateNeedId(null)}
          onSuccess={() => {
            // No action needed, data revalidates automatically via server actions
          }}
        />
      )}
    </div>
  );
}
