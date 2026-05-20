"use client";

import { useState } from "react";
import AdminStoneTable from "@/components/AdminStoneTable";
import AdminContentPanel from "@/components/AdminContentPanel";
import AdminLibraryPanel from "@/components/AdminLibraryPanel";
import type { Stone } from "@/types/stones";
import type { LibraryItem } from "@/types/library";

interface Plan {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  discussions: {
    id: string;
    plan_id: string;
    day_number: number | null;
    title: string;
    content: string | null;
    created_at: string;
  }[];
}

interface AdminTabsProps {
  stones: Stone[];
  plans: Plan[];
  libraryItems: LibraryItem[];
}

const tabs = [
  { id: "stones", label: "Wall of Remembrance" },
  { id: "content", label: "Reading Plans & Discussions" },
  { id: "library", label: "Content Library" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminTabs({ stones, plans, libraryItems }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("stones");

  const pendingLibrary = libraryItems.filter((i) => !i.approved).length;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 mb-8 bg-[#fdf8f0] rounded-2xl p-1 border border-[#e8d4b0] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#2d1f0e] shadow-sm border border-[#e8d4b0]"
                : "text-[#7a5a3a] hover:text-[#2d1f0e]"
            }`}
          >
            {tab.label}
            {tab.id === "library" && pendingLibrary > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                {pendingLibrary}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "stones" && <AdminStoneTable stones={stones} />}
      {activeTab === "content" && <AdminContentPanel plans={plans} />}
      {activeTab === "library" && <AdminLibraryPanel items={libraryItems} />}
    </div>
  );
}
