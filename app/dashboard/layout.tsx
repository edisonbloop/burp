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
        // Not logged in — send them to sign in
        router.replace("/talk-it-over?signin=1");
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
    { name: "Talk It Over", href: "/talk-it-over" },
  ];

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf6ef]">
        <p className="text-[#c4b090] text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#faf6ef]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-[#e8d4b0] flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-[#e8d4b0]">
          <Link
            href="/"
            className="text-2xl font-bold text-[#c4893a]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            BURP
          </Link>
          <p className="text-xs text-[#a96e28] uppercase tracking-widest mt-1">
            Talk It Over
          </p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors text-sm ${
                  isActive
                    ? "bg-[#fdf8f0] text-[#c4893a] border border-[#e8d4b0]"
                    : "text-[#7a5a3a] hover:bg-[#fdf8f0] hover:text-[#4d2c11]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#e8d4b0]">
          <div className="bg-[#fdf8f0] px-4 py-3 rounded-xl border border-[#e8d4b0] mb-3">
            <p className="text-xs text-[#7a5a3a]">Signed in as</p>
            <p className="font-semibold text-[#2d1f0e] truncate text-sm">
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
