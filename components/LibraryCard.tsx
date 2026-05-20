import Link from "next/link";
import Image from "next/image";
import type { LibraryItem } from "@/types/library";

function getYouTubeId(content: string): string | null {
  const url = content.split("\n")[0].trim();
  const m =
    url.match(/[?&]v=([^&\n]+)/) ||
    url.match(/youtu\.be\/([^?&\n]+)/) ||
    url.match(/embed\/([^?&\n]+)/);
  return m ? m[1] : null;
}

export default function LibraryCard({ item }: { item: LibraryItem }) {
  if (item.type === "videos") {
    const videoId = getYouTubeId(item.content);
    const description = item.content.split("\n").slice(2).join(" ").trim();

    return (
      <Link
        href={`/library/item/${item.id}`}
        className="group bg-parchment-soft rounded-3xl border border-stone-edge hover:border-gold hover:shadow-md transition-all duration-220 flex flex-col overflow-hidden"
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-parchment-deep overflow-hidden">
          {videoId ? (
            <>
              <Image
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-gold/80 transition-colors">
                  <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-stone-light">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
            </div>
          )}
          {item.featured && (
            <span className="absolute top-2 right-2 text-[9px] bg-gold text-white font-bold px-2 py-0.5 rounded-full">
              ★ Featured
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] font-bold tracking-widest text-gold uppercase"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Video
            </span>
            <span className="text-[10px] text-stone font-semibold bg-vellum px-2.5 py-0.5 rounded-full border border-stone-edge">
              {item.topic}
            </span>
          </div>
          <h3
            className="text-lg font-bold text-ink mb-1 group-hover:text-gold-deep transition-colors leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {item.title}
          </h3>
          {description && (
            <p className="text-xs text-stone-mid leading-relaxed line-clamp-2 mt-1">{description}</p>
          )}
          <div className="mt-auto pt-3 border-t border-stone-edge/40 text-[10px] text-stone-light flex justify-between">
            <span className="font-semibold">By {item.author || "Anonymous"}</span>
            <span>
              {new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Text-based types: poems, write-ups, long-messages, others
  return (
    <Link
      href={`/library/item/${item.id}`}
      className="group bg-parchment-soft p-6 rounded-3xl border border-stone-edge hover:border-gold hover:shadow-md transition-all duration-220 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[9px] font-bold tracking-widest text-gold uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {item.featured ? "★ Featured" : item.type.replace(/-/g, " ")}
          </span>
          <span className="text-[10px] text-stone-light font-medium bg-vellum px-2 py-0.5 rounded-full border border-stone-edge/50">
            {item.topic}
          </span>
        </div>
        <h3
          className="text-xl font-bold text-ink mb-3 group-hover:text-gold-deep transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {item.title}
        </h3>
        <p className="text-xs text-stone-mid leading-relaxed mb-6 line-clamp-3">
          {item.excerpt}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-stone-edge/50 pt-4 text-[10px] text-stone-light">
        <span>By {item.author || "Anonymous"}</span>
        <span>
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
