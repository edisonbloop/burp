"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { AppNotification } from "@/lib/notification-actions";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/notification-actions";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function typeIcon(type: string) {
  if (type === "reply")    return "💬";
  if (type === "approved") return "✅";
  return "🔔";
}

export default function NotificationBell() {
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);

  // Stable supabase reference — never changes after mount
  const supabaseRef = useRef(getSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  const [userId, setUserId] = useState<string | null>(null);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unread = notifs.filter((n) => !n.read).length;

  // Auth + initial fetch — direct Supabase query (no server action proxy)
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user || cancelled) return;
      const uid = session.user.id;
      setUserId(uid);
      setLoading(true);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!cancelled) {
        setNotifs((data ?? []) as AppNotification[]);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // Realtime — instant bell update when a new notification arrives.
  // IMPORTANT: use a unique channel name on every effect run.
  // Supabase reuses channel objects that share a name — if the effect
  // re-runs and the old channel is still subscribed, calling .on() after
  // .subscribe() throws "cannot add callbacks after subscribe()".
  useEffect(() => {
    if (!userId) return;

    // Unique name guarantees a brand-new channel each time
    const channelName = `notifs-${userId}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifs((prev) => [payload.new as AppNotification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleClick = async (notif: AppNotification) => {
    setOpen(false);
    if (!notif.read && userId) {
      await markNotificationRead(notif.id, userId);
      setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
    }
    if (notif.link) router.push(notif.link);
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Only render once signed in
  if (!userId) return null;

  return (
    <div className="relative" ref={dropRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        className="relative w-8 h-8 flex items-center justify-center rounded-full text-stone-mid hover:text-ink hover:bg-parchment-deep transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2a6 6 0 0 0-6 6c0 3.5-1.5 5-1.5 5h15s-1.5-1.5-1.5-5a6 6 0 0 0-6-6z" />
          <path d="M11.73 17a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-gold rounded-full flex items-center justify-center text-[9px] font-bold text-vellum leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-parchment-soft border border-stone-edge rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-edge">
            <h3 className="text-sm font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Notifications
            </h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold uppercase tracking-widest text-gold hover:text-gold-deep transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="py-10 text-center">
                <p className="text-sm text-stone-light animate-pulse">Loading…</p>
              </div>
            )}

            {!loading && notifs.length === 0 && (
              <div className="py-10 text-center px-6">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-stone-mid">No notifications yet.</p>
                <p className="text-xs text-stone-light mt-1">
                  You&apos;ll hear when someone replies to your posts.
                </p>
              </div>
            )}

            {!loading && notifs.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-stone-edge/50 last:border-0 hover:bg-vellum transition-colors ${
                  !notif.read ? "bg-gold-wash/40" : ""
                }`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!notif.read ? "font-semibold text-ink" : "text-stone-mid"}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-stone-light mt-1">{timeAgo(notif.created_at)}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
