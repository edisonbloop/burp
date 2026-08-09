"use client";

import { useEffect, useState } from "react";
import { displayUrl } from "@/lib/extract-urls";
import { parseVideoUrl } from "@/lib/video";

type Preview = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

export default function LinkPreviewCard({ url }: { url: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const isVideo = parseVideoUrl(url) !== null;

  useEffect(() => {
    if (isVideo) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data: Preview) => {
        if (!cancelled) setPreview(data);
      })
      .catch(() => {
        if (!cancelled) {
          try {
            setPreview({ url, title: new URL(url).hostname });
          } catch {
            setPreview({ url, title: displayUrl(url) });
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url, isVideo]);

  if (isVideo) return null;

  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-stone-edge bg-parchment-soft overflow-hidden animate-pulse">
        <div className="h-28 bg-stone-edge/30" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-stone-edge/40 rounded w-2/3" />
          <div className="h-2 bg-stone-edge/30 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex rounded-xl border border-stone-edge bg-parchment-soft overflow-hidden hover:border-gold-soft hover:bg-gold-wash/30 transition-all group"
    >
      {preview.image && (
        <div className="w-28 sm:w-36 flex-shrink-0 bg-stone-edge/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt=""
            className="w-full h-full min-h-[88px] object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 p-3 sm:p-4">
        <p
          className="text-[9px] font-bold uppercase tracking-widest text-stone-light mb-1 truncate"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {preview.siteName ?? displayUrl(url, 32)}
        </p>
        <p className="text-sm font-semibold text-ink group-hover:text-gold-deep transition-colors line-clamp-2 leading-snug">
          {preview.title ?? displayUrl(url)}
        </p>
        {preview.description && (
          <p className="text-xs text-stone-mid mt-1 line-clamp-2 leading-relaxed">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}
