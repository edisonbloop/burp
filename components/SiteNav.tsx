"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthMenu from "@/components/AuthMenu";

const links = [
  { href: "/talk-it-over", label: "Talk It Over" },
  { href: "/library",      label: "Library"      },
  { href: "/sharehouse",   label: "Sharehouse"   },
  { href: "/attributes",   label: "Attributes"   },
  { href: "/100stones",    label: "100 Stones"   },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

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
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-semibold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {label}
            </Link>
          ))}
          <AuthMenu />
        </nav>

        {/* Mobile right side: auth + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
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
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-bold tracking-widest uppercase text-stone-mid hover:text-ink hover:bg-vellum px-4 py-3 rounded-xl transition-colors"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
