"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthMenu from "@/components/AuthMenu";
import dynamic from "next/dynamic";

// ssr: false — bell uses Supabase auth + Realtime which only works in the browser
const NotificationBell = dynamic(() => import("@/components/NotificationBell"), {
  ssr: false,
  loading: () => <div className="w-8 h-8" />, // stable placeholder so layout doesn't shift
});

type NavLink = { href: string; label: string };
type NavItem = NavLink & { children?: NavLink[] };

const navItems: NavItem[] = [
  { href: "/talk-it-over", label: "Talk It Over" },
  {
    href: "/library",
    label: "Library",
    children: [
      { href: "/library", label: "Overview" },
      { href: "/attributes", label: "Attributes" },
      { href: "/100stones", label: "100 Stones" },
    ],
  },
  { href: "/sharehouse", label: "Sharehouse" },
  { href: "/bulletin", label: "Bulletin" },
  { href: "/timetable", label: "Timetable" },
  { href: "/games", label: "Games" },
  { href: "/worship", label: "Worship" },
];

function isChildActive(children: NavLink[], pathname: string) {
  return children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
}

function DesktopNavDropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const active = isChildActive(item.children!, pathname);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-140 ${
          active ? "text-ink" : "text-stone hover:text-ink"
        }`}
        style={{ fontFamily: "var(--font-accent)" }}
      >
        {item.label}
        <svg
          className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 1.5L6 6.5L11 1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2.5 w-48 bg-parchment-soft border border-stone-edge rounded-2xl shadow-lg overflow-hidden z-50">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-xs font-semibold tracking-widest uppercase text-stone hover:text-ink hover:bg-vellum transition-colors"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
    setMobileGroupOpen(null);
  }, [pathname]);

  return (
    <header className="border-b border-stone-edge bg-parchment-soft relative z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image
            src="/logomain.png"
            alt="BURP Logo"
            width={160}
            height={40}
            priority
            className="h-9 sm:h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) =>
            item.children ? (
              <DesktopNavDropdown key={item.href} item={item} pathname={pathname} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-semibold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {item.label}
              </Link>
            )
          )}
          <NotificationBell />
          <AuthMenu />
        </nav>

        {/* Mobile right side: bell + auth + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          <AuthMenu />
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-mid hover:text-ink hover:bg-parchment-deep transition-colors"
          >
            {open ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden border-t border-stone-edge bg-parchment-soft px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.href}>
                <button
                  onClick={() =>
                    setMobileGroupOpen((g) => (g === item.href ? null : item.href))
                  }
                  aria-expanded={mobileGroupOpen === item.href}
                  className="w-full flex items-center justify-between text-xs font-bold tracking-widest uppercase text-stone-mid hover:text-ink hover:bg-vellum px-4 py-3 rounded-xl transition-colors"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {item.label}
                  <svg
                    className={`w-2.5 h-2.5 transition-transform ${
                      mobileGroupOpen === item.href ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 12 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M1 1.5L6 6.5L11 1.5" />
                  </svg>
                </button>
                {mobileGroupOpen === item.href && (
                  <div className="flex flex-col gap-1 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="text-xs font-bold tracking-widest uppercase text-stone-mid hover:text-ink hover:bg-vellum px-4 py-2.5 rounded-xl transition-colors"
                        style={{ fontFamily: "var(--font-accent)" }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-bold tracking-widest uppercase text-stone-mid hover:text-ink hover:bg-vellum px-4 py-3 rounded-xl transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
