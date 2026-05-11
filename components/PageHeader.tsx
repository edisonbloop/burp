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
    <header className="border-b border-[#e8d4b0] bg-[#fdf8f0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-[#a96e28] hover:text-[#8a5420] font-medium transition-colors"
          >
            100 Stones of Remembrance
          </Link>
          <h1 className="text-xl font-semibold text-[#2d1f0e] mt-0.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#7a5a3a] mt-0.5">{subtitle}</p>
          )}
        </div>
        {backHref && (
          <Link
            href={backHref}
            className="text-sm text-[#7a5a3a] hover:text-[#2d1f0e] transition-colors flex items-center gap-1"
          >
            <span>←</span>
            <span>{backLabel}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
