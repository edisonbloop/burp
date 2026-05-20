"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoneCard from "./StoneCard";
import StoneModal from "./StoneModal";
import BackToTop from "./BackToTop";
import EmptyState from "./EmptyState";
import type { PublicStone } from "@/types/stones";

interface StonesGridProps {
  stones: PublicStone[];
}

export default function StonesGrid({ stones }: StonesGridProps) {
  const [search, setSearch] = useState("");
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [selectedStone, setSelectedStone] = useState<PublicStone | null>(null);

  const journeyWords = useMemo(() => {
    const words = stones.map((s) => s.journey_word.toLowerCase());
    return Array.from(new Set(words)).sort();
  }, [stones]);

  const filtered = useMemo(() => {
    return stones.filter((stone) => {
      const matchesWord =
        !activeWord ||
        stone.journey_word.toLowerCase() === activeWord.toLowerCase();
      if (!matchesWord) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        stone.remembrance.toLowerCase().includes(q) ||
        (stone.testimony?.toLowerCase().includes(q) ?? false) ||
        (stone.scripture?.toLowerCase().includes(q) ?? false) ||
        stone.journey_word.toLowerCase().includes(q) ||
        (!stone.anonymous &&
          (stone.display_name?.toLowerCase().includes(q) ||
            stone.full_name.toLowerCase().includes(q)))
      );
    });
  }, [stones, search, activeWord]);

  const isFiltering = !!search.trim() || !!activeWord;
  const gridKey = `${activeWord ?? "all"}-${search}`;

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c4b090] text-base pointer-events-none">
          ⌕
        </span>
        <input
          type="search"
          placeholder="Search stones…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a]/40 focus:border-[#c4893a] transition text-sm"
        />
      </div>

      {/* Journey word filters */}
      {journeyWords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveWord(null)}
            className={`text-xs px-4 py-2 rounded-full font-semibold tracking-wide transition-all duration-200 ${
              activeWord === null
                ? "bg-[#2d1f0e] text-white shadow-sm"
                : "bg-white border border-[#e8d4b0] text-[#7a5a3a] hover:border-[#c4893a] hover:text-[#c4893a]"
            }`}
          >
            All
          </button>
          {journeyWords.map((word) => (
            <button
              key={word}
              onClick={() => setActiveWord(activeWord === word ? null : word)}
              className={`text-xs px-4 py-2 rounded-full font-semibold capitalize tracking-wide transition-all duration-200 ${
                activeWord === word
                  ? "bg-[#c4893a] text-white shadow-sm"
                  : "bg-white border border-[#e8d4b0] text-[#7a5a3a] hover:border-[#c4893a] hover:text-[#c4893a]"
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`${filtered.length}-${isFiltering}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-medium tracking-widest uppercase text-[#c4b090] mb-6"
        >
          {isFiltering
            ? `${filtered.length} of ${stones.length} stones`
            : `${stones.length} stone${stones.length === 1 ? "" : "s"} gathered`}
        </motion.p>
      </AnimatePresence>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No stones found"
          description={
            isFiltering
              ? "Try adjusting your search or filter."
              : "No stones have been approved yet. Check back soon."
          }
        />
      ) : (
        <>
          <div key={gridKey} className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {filtered.map((stone, i) => (
              <StoneCard
                key={stone.id}
                stone={stone}
                index={i}
                onClick={() => setSelectedStone(stone)}
              />
            ))}
          </div>

          {/* End of wall */}
          {!isFiltering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16 flex flex-col items-center gap-4 text-center"
            >
              <div className="flex items-center gap-4 w-full max-w-xs">
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #e3be82)",
                  }}
                />
                <span className="text-[#c4893a] text-lg">◉</span>
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      "linear-gradient(to left, transparent, #e3be82)",
                  }}
                />
              </div>
              <p
                className="text-sm text-[#7a5a3a] italic"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                You have seen all {stones.length} stone
                {stones.length === 1 ? "" : "s"}.
              </p>
              <p className="text-xs text-[#c4b090]">
                &ldquo;…that this may be a sign among you.&rdquo; — Joshua 4:6
              </p>
            </motion.div>
          )}
        </>
      )}

      <StoneModal
        stone={selectedStone}
        onClose={() => setSelectedStone(null)}
      />

      <BackToTop />
    </div>
  );
}
