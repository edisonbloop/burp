import Link from "next/link";
import type { ReactNode } from "react";

export default function TalkItOverBackHeader({
  backHref = "/",
  backLabel = "← B U R P",
  rightSlot,
}: {
  backHref?: string;
  backLabel?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {backLabel}
        </Link>
        {rightSlot}
      </div>
    </div>
  );
}
