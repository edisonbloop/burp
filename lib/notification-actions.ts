"use server";

import { getSupabase } from "./supabase";

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  actor_name: string | null;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

/** Create a notification — silently no-ops if recipient == actor */
export async function notifyReply(
  discussionId: string,
  commenterId: string,
  actorName: string
): Promise<void> {
  try {
    const supabase = getSupabase();
    const { data: disc } = await supabase
      .from("discussions")
      .select("user_id, title")
      .eq("id", discussionId)
      .single();

    if (!disc?.user_id || disc.user_id === commenterId) return; // don't notify self

    await supabase.from("notifications").insert({
      user_id: disc.user_id,
      type: "reply",
      actor_name: actorName,
      message: `${actorName} replied to your post`,
      link: `/talk-it-over/discussion/${discussionId}`,
    });
  } catch { /* non-critical */ }
}

/** Notify when a library item is approved */
export async function notifyItemApproved(
  itemUserId: string,
  itemTitle: string,
  itemId: string
): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from("notifications").insert({
      user_id: itemUserId,
      type: "approved",
      actor_name: null,
      message: `Your piece "${itemTitle}" has been published to the library`,
      link: `/library/item/${itemId}`,
    });
  } catch { /* non-critical */ }
}

/** Fetch most recent notifications for a user */
export async function getNotifications(userId: string): Promise<AppNotification[]> {
  if (!userId) return [];
  const { data } = await getSupabase()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as AppNotification[];
}

/** Mark a single notification as read */
export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await getSupabase()
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", userId);
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await getSupabase()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}
