"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/signin?redirect=/dashboard");
        return;
      }
      supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
          setChecking(false);
        });
    });
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { name: "My Dashboard", href: "/dashboard" },
    { name: "Content Library", href: "/library" },
    { name: "Talk It Over", href: "/talk-it-over" },
    { name: "Attributes of God", href: "/attributes" },
  ];

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-vellum">
        <p className="text-stone-light text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-vellum">
      {/* Sidebar */}
      <aside className="w-64 bg-parchment-soft border-r border-stone-edge flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-stone-edge">
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

        <nav className="flex-1 py-6 px-3 space-y-1">
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

        <div className="p-4 border-t border-stone-edge">
          <div className="bg-vellum px-4 py-3 rounded-xl border border-stone-edge mb-3">
            <p className="text-xs text-stone-light">Signed in as</p>
            <p className="font-semibold text-ink truncate text-sm mt-0.5">
              {profile?.full_name ?? "—"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
