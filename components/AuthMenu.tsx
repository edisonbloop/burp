"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type Profile = { full_name?: string | null };

export default function AuthMenu() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [initials, setInitials] = useState("");
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setReady(true);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      setProfile(data ?? {});

      // Build initials from full name or email
      const name =
        (data?.full_name ?? "").trim() || session.user.email || "";
      const parts = name.split(/\s+/).filter(Boolean);
      const inits =
        parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();
      setInitials(inits);
      setReady(true);
    }

    loadSession();

    // Keep in sync when user signs in / out elsewhere
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        setInitials("");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Render nothing while resolving session so layout is stable
  if (!ready) {
    return <div className="h-8 w-8 rounded-full bg-stone-edge animate-pulse" />;
  }

  /* ── Not signed in ─────────────────────────────── */
  if (!profile) {
    return (
      <Link
        href="/signin"
        className="text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-gold-soft text-gold hover:bg-gold-wash hover:text-gold-deep transition-colors duration-140"
        style={{ fontFamily: "var(--font-accent)" }}
      >
        Sign In
      </Link>
    );
  }

  /* ── Signed in ─────────────────────────────────── */
  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 group focus:outline-none"
      >
        <span
          className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-vellum text-[11px] font-bold ring-2 ring-transparent group-hover:ring-gold-soft transition-all duration-140"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {initials || "?"}
        </span>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 text-stone-mid transition-transform duration-140 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-52 bg-parchment-soft border border-stone-edge rounded-2xl shadow-lg overflow-hidden z-50">
          {/* Name header */}
          <div className="px-4 py-3 border-b border-stone-edge">
            <p className="text-[10px] text-stone-light uppercase tracking-wider">
              Signed in as
            </p>
            <p
              className="font-bold text-ink text-sm mt-0.5 truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {profile.full_name || "—"}
            </p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-mid hover:text-ink hover:bg-vellum transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
              My Dashboard
            </Link>
            <Link
              href="/library/submit"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-mid hover:text-ink hover:bg-vellum transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" />
              </svg>
              Submit to Library
            </Link>
            <Link
              href="/attributes/submit"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-mid hover:text-ink hover:bg-vellum transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="8,2 10,6 14,6 11,9 12,13 8,11 4,13 5,9 2,6 6,6" />
              </svg>
              Add Attribute
            </Link>
          </div>

          <div className="border-t border-stone-edge py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
