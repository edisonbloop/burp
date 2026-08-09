"use client";

import { useState } from "react";
import { parseVideoUrl } from "@/lib/video";

export default function VideoEmbed({
  url,
  title = "Video",
  className = "",
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideoUrl(url);
  if (!video) return null;

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-stone-edge bg-ink ${className}`}
      style={{ paddingBottom: "56.25%" }}
    >
      {playing ? (
        <iframe
          src={`${video.embedUrl}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play video"
          className="absolute inset-0 w-full h-full group"
        >
          {video.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="absolute inset-0 bg-ink" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-ink/10 group-hover:bg-ink/25 transition-colors">
            <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-ink/70 group-hover:bg-gold flex items-center justify-center text-vellum transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <span
            className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-ink/60 text-vellum"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {video.provider}
          </span>
        </button>
      )}
    </div>
  );
}
