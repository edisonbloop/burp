import { getCommunityMembers } from "@/lib/community-actions";
import CommunityClient from "./CommunityClient";
import SiteNav from "@/components/SiteNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community — BURP",
  description: "Meet the people of BURP. Browse members, discover expertise, connect.",
};

export const revalidate = 60; // refresh every minute

export default async function CommunityPage() {
  const members = await getCommunityMembers();
  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />
      <CommunityClient members={members} />
    </div>
  );
}
