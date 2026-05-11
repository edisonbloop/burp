"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoneCard from "./StoneCard";
import StoneModal from "./StoneModal";
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
          key={filtered.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-medium tracking-widest uppercase text-[#c4b090] mb-6"
        >
          {filtered.length === stones.length
            ? `${stones.length} stone${stones.length === 1 ? "" : "s"} gathered`
            : `${filtered.length} of ${stones.length} stones`}
        </motion.p>
      </AnimatePresence>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No stones found"
          description={
            search || activeWord
              ? "Try adjusting your search or filter."
              : "No stones have been approved yet. Check back soon."
          }
        />
      ) : (
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
      )}
      <StoneModal
        stone={selectedStone}
        onClose={() => setSelectedStone(null)}
      />
    </div>
  );
}
