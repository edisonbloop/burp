import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
}: PageHeaderProps) {
  return (
    <header className="border-b border-stone-edge bg-parchment-soft">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-xs text-gold-deep hover:text-gold font-bold uppercase tracking-widest transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            B U R P
          </Link>
          <h1
            className="text-xl font-bold text-ink mt-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-stone-mid mt-0.5">{subtitle}</p>
          )}
        </div>
        {backHref && (
          <Link
            href={backHref}
            className="text-xs text-stone hover:text-ink transition-colors flex items-center gap-1 font-semibold uppercase tracking-wider"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            <span>←</span>
            <span>{backLabel}</span>
          </Link>
        )}
      </div>
    </header>
  );
}

