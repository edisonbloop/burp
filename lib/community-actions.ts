"use server";

import { getSupabase } from "./supabase";

export interface CommunityMember {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  expertise: string | null;
  interests: string | null;
}

export async function getCommunityMembers(): Promise<CommunityMember[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, role, bio, expertise, interests")
    .not("full_name", "is", null)
    .neq("full_name", "")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching community members:", error);
    return [];
  }
  return (data ?? []) as CommunityMember[];
}
