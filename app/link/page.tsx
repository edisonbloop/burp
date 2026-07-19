import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BURP — Links",
  description:
    "Find BURP on X, YouTube, Instagram, TikTok, and at burp.ink.",
  openGraph: {
    title: "BURP — Links",
    description:
      "The Berean Upper Room Platform — all our links in one place.",
  },
};

type SocialLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const socialLinks: SocialLink[] = [
  {
    label: "X / Twitter",
    href: "https://x.com/burp_ink",
    icon: <XIcon />,
  },
  {
    label: "Website",
    href: "https://burp.ink",
    icon: <GlobeIcon />,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@burp_ink",
    icon: <YouTubeIcon />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/burp.ink/",
    icon: <InstagramIcon />,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@the.berean.upper.r",
    icon: <TikTokIcon />,
  },
];

export default function LinkPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16 sm:py-20"
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Profile */}
        <div className="mb-6 rounded-full border-2 border-gold-soft bg-vellum p-1 shadow-sm">
          <Image
            src="/logosquare.png"
            alt="BURP"
            width={96}
            height={96}
            priority
            className="h-24 w-24 rounded-full object-cover"
          />
        </div>

        <p
          className="text-[10px] font-semibold tracking-[0.35em] uppercase text-gold-deep mb-2"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          The Berean Upper Room Platform
        </p>

        <h1
          className="text-3xl sm:text-4xl font-bold text-ink mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          BURP
        </h1>

        <p className="text-sm text-stone-mid text-center leading-relaxed mb-8 max-w-xs">
          Feast on Scripture. Reflect honestly. Find us across the web.
        </p>

        <div className="flex items-center justify-center gap-1.5 mb-10 text-stone-light">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>

        {/* Link stack */}
        <ul className="w-full space-y-3">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-stone-edge bg-vellum/90 backdrop-blur-sm text-ink font-medium text-sm shadow-sm transition-all duration-200 hover:border-gold hover:bg-parchment-soft hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-parchment-soft border border-stone-edge/60 flex items-center justify-center text-stone-mid group-hover:text-gold-deep group-hover:border-gold-soft transition-colors duration-200">
                  {link.icon}
                </span>
                <span className="flex-1">{link.label}</span>
                <span className="text-stone-light group-hover:text-gold transition-colors duration-200">
                  <ArrowIcon />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="mt-12 text-xs font-semibold tracking-widest uppercase text-stone-light hover:text-gold-deep transition-colors duration-200"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Enter the platform →
        </Link>
      </div>
    </main>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.6 9h16.8M3.6 15h16.8M12 3c-2.5 2.5-3.75 5.5-3.75 9s1.25 6.5 3.75 9c2.5-2.5 3.75-5.5 3.75-9S14.5 5.5 12 3z"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}
