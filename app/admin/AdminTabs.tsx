"use client";

import { useState } from "react";
import AdminStoneTable from "@/components/AdminStoneTable";
import AdminContentPanel from "@/components/AdminContentPanel";
import AdminLibraryPanel from "@/components/AdminLibraryPanel";
import AdminSharehousePanel from "@/components/AdminSharehousePanel";
import AdminBulletinPanel from "@/components/AdminBulletinPanel";
import AdminTimetablePanel from "@/components/AdminTimetablePanel";
import AdminAttributesPanel from "@/components/AdminAttributesPanel";
import AdminWorshipPanel from "@/components/AdminWorshipPanel";
import AdminCrmPanel from "@/components/AdminCrmPanel";
import AdminSecretSantaPanel from "@/components/AdminSecretSantaPanel";
import type { Stone } from "@/types/stones";
import type { LibraryItem } from "@/types/library";
import type { SharehouseNeed } from "@/types/sharehouse";
import type { BulletinPost } from "@/types/bulletin";
import type { FacilitationTimetable } from "@/types/timetable";
import type { GodAttribute, AttributeReference } from "@/types/attributes";
import type { WorshipRsvp, WorshipAttendance } from "@/types/worship";
import type { Person } from "@/types/crm";
import type { SecretSantaMappingRow, SecretSantaRound } from "@/types/secretsanta";

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

interface AttributeWithRefs extends GodAttribute {
  references: AttributeReference[];
}
interface ReferenceWithAttr extends AttributeReference {
  god_attributes?: { name: string };
}

interface AdminTabsProps {
  stones: Stone[];
  plans: Plan[];
  libraryItems: LibraryItem[];
  sharehouseNeeds: SharehouseNeed[];
  bulletinPosts: BulletinPost[];
  timetable: FacilitationTimetable | null;
  godAttributes: AttributeWithRefs[];
  godReferences: ReferenceWithAttr[];
  worshipRsvps: WorshipRsvp[];
  worshipAttendance: WorshipAttendance[];
  people: Person[];
  secretSantaRound: SecretSantaRound | null;
  secretSantaMapping: SecretSantaMappingRow[];
  secretSantaNotPicked: (Person & { canSelfPick: boolean })[];
  secretSantaTotal: number;
}

const tabs = [
  { id: "stones", label: "Wall of Remembrance" },
  { id: "content", label: "Reading Plans & Discussions" },
  { id: "library", label: "Content Library" },
  { id: "sharehouse", label: "BURP Sharehouse" },
  { id: "bulletin", label: "BURP Bulletin" },
  { id: "timetable", label: "Facilitating Timetable" },
  { id: "attributes", label: "Attributes of God" },
  { id: "worship", label: "Worship" },
  { id: "people", label: "People (CRM)" },
  { id: "secretsanta", label: "Secret Santa" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminTabs({
  stones,
  plans,
  libraryItems,
  sharehouseNeeds,
  bulletinPosts,
  timetable,
  godAttributes,
  godReferences,
  worshipRsvps,
  worshipAttendance,
  people,
  secretSantaRound,
  secretSantaMapping,
  secretSantaNotPicked,
  secretSantaTotal,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("stones");

  const pendingLibrary = libraryItems.filter((i) => !i.approved).length;
  const pendingSharehouse = sharehouseNeeds.filter((n) => !n.approved).length;
  const pendingBulletin = bulletinPosts.filter((p) => !p.approved).length;
  const pendingAttributes =
    godAttributes.filter((a) => !a.approved).length +
    godReferences.filter((r) => !r.approved).length;

  const badgeFor = (id: TabId) => {
    if (id === "library") return pendingLibrary;
    if (id === "sharehouse") return pendingSharehouse;
    if (id === "bulletin") return pendingBulletin;
    if (id === "attributes") return pendingAttributes;
    return 0;
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 mb-8 bg-[#fdf8f0] rounded-2xl p-1 border border-[#e8d4b0] w-fit">
        {tabs.map((tab) => {
          const badge = badgeFor(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-[#2d1f0e] shadow-sm border border-[#e8d4b0]"
                  : "text-[#7a5a3a] hover:text-[#2d1f0e]"
              }`}
            >
              {tab.label}
              {badge > 0 && (
                <span className="bg-amber-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "stones" && <AdminStoneTable stones={stones} />}
      {activeTab === "content" && <AdminContentPanel plans={plans} />}
      {activeTab === "library" && <AdminLibraryPanel items={libraryItems} />}
      {activeTab === "sharehouse" && <AdminSharehousePanel needs={sharehouseNeeds} />}
      {activeTab === "bulletin" && <AdminBulletinPanel posts={bulletinPosts} />}
      {activeTab === "timetable" && <AdminTimetablePanel timetable={timetable} />}
      {activeTab === "attributes" && (
        <AdminAttributesPanel attributes={godAttributes} references={godReferences} />
      )}
      {activeTab === "worship" && (
        <AdminWorshipPanel rsvps={worshipRsvps} attendance={worshipAttendance} />
      )}
      {activeTab === "people" && <AdminCrmPanel people={people} />}
      {activeTab === "secretsanta" && (
        <AdminSecretSantaPanel
          round={secretSantaRound}
          people={people}
          mapping={secretSantaMapping}
          notPicked={secretSantaNotPicked}
          totalParticipants={secretSantaTotal}
        />
      )}
    </div>
  );
}
