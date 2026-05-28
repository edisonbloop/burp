"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string | null } | null>(null);
  const [checking, setChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/signin?redirect=/dashboard");
        return;
      }
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
          setChecking(false);
        });
    });
  }, [supabase, router]);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { name: "My Dashboard", href: "/dashboard" },
    { name: "Edit Profile", href: "/dashboard/profile" },
    { name: "Content Library", href: "/library" },
    { name: "Talk It Over", href: "/talk-it-over" },
    { name: "Attributes of God", href: "/attributes" },
  ];

  // Build avatar initials
  const initials = profile?.full_name
    ? profile.full_name.trim().split(/\s+/).filter(Boolean)
        .reduce((acc: string, w: string, i: number, arr: string[]) =>
          i === 0 || i === arr.length - 1 ? acc + w[0].toUpperCase() : acc, "")
        .slice(0, 2)
    : "?";

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-vellum">
        <p className="text-stone-light text-sm">Loading…</p>
      </div>
    );
  }

  // ── Shared sidebar contents ────────────────────────────────────────────────
  const SidebarContents = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-stone-edge flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-2xl font-bold text-gold tracking-widest"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            BURP
          </Link>
          <p className="text-xs text-gold-deep uppercase tracking-widest mt-1">
            Personal Dashboard
          </p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-stone-mid hover:text-ink hover:bg-vellum transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors text-sm ${
                isActive
                  ? "bg-gold-wash text-gold border border-gold-soft"
                  : "text-stone-mid hover:bg-vellum hover:text-ink"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User / sign-out footer */}
      <div className="p-4 border-t border-stone-edge">
        <div className="bg-vellum px-4 py-3 rounded-xl border border-stone-edge mb-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gold flex items-center justify-center">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile?.full_name ?? "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-vellum text-[10px] font-bold"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-stone-light">Signed in as</p>
            <p className="font-semibold text-ink truncate text-sm mt-0.5">
              {profile?.full_name ?? "—"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-vellum overflow-hidden">

      {/* ── Desktop sidebar (always visible ≥ md) ──────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-parchment-soft border-r border-stone-edge flex-col flex-shrink-0">
        <SidebarContents />
      </aside>

      {/* ── Mobile drawer backdrop ──────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer panel ─────────────────────────────────────────────── */}
      <aside
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-parchment-soft border-r border-stone-edge flex flex-col md:hidden
          transform transition-transform duration-200 ease-in-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContents />
      </aside>

      {/* ── Right side: mobile top bar + scrollable content ─────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-parchment-soft border-b border-stone-edge flex-shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-mid hover:text-ink hover:bg-vellum transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>

          <Link
            href="/"
            className="text-xl font-bold text-gold tracking-widest"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            BURP
          </Link>

          {/* Avatar chip — right side */}
          <div className="ml-auto w-8 h-8 rounded-full overflow-hidden bg-gold flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile?.full_name ?? "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-vellum text-[10px] font-bold"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {initials}
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
