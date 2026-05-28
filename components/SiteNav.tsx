import Link from "next/link";
import Image from "next/image";
import AuthMenu from "@/components/AuthMenu";

const links = [
  { href: "/talk-it-over", label: "Talk It Over" },
  { href: "/library",      label: "Library"      },
  { href: "/sharehouse",   label: "Sharehouse"   },
  { href: "/attributes",   label: "Attributes"   },
  { href: "/100stones",    label: "100 Stones"   },
];

export default function SiteNav() {
  return (
    <header className="border-b border-stone-edge bg-parchment-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logomain.png"
            alt="BURP Logo"
            width={160}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>
        <nav className="flex items-center gap-6">
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
      </div>
    </header>
  );
}
