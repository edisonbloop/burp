import Link from "next/link";
import { notFound } from "next/navigation";
import { getLibraryItemById } from "@/lib/library-actions";
import ShareButton from "@/components/ShareButton";
import type { LibraryType } from "@/types/library";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

const BASE_URL = "https://www.burp.ink";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getLibraryItemById(id);
  if (!item) return { title: "Not Found — BURP" };

  const description = item.excerpt?.slice(0, 160) || item.content.slice(0, 160);
  const url = `${BASE_URL}/library/item/${id}`;

  return {
    title: `${item.title} — BURP Content Library`,
    description,
    openGraph: {
      title: item.title,
      description,
      url,
      siteName: "BURP — Berean Upper Room Platform",
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      site: "@burpink",
    },
    alternates: { canonical: url },
  };
}

export const revalidate = 0; // Fresh database fetches for specific items

export default async function ContentDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const item = await getLibraryItemById(id);
  if (!item) {
    notFound();
  }

  // Format category display names
  const categoryNames: Record<LibraryType, string> = {
    poems: "Poems",
    "write-ups": "Write-Ups",
    "long-messages": "Long Messages",
    videos: "Videos",
    others: "Other Materials",
  };

  // Extract YouTube video ID from content (first line is always the URL)
  function getYouTubeId(url: string): string | null {
    const clean = url.split("\n")[0].trim();
    const match =
      clean.match(/[?&]v=([^&\n]+)/) ||
      clean.match(/youtu\.be\/([^?&\n]+)/) ||
      clean.match(/embed\/([^?&\n]+)/);
    return match ? match[1] : null;
  }

  // For videos: URL is first line, rest is optional description
  const videoId = item.type === "videos" ? getYouTubeId(item.content) : null;
  const videoDescription = item.type === "videos"
    ? item.content.split("\n").slice(2).join("\n").trim()
    : null;

  // Type-specific content styling (not used for videos — handled separately)
  const contentStyle: Record<LibraryType, {
    wrapper: string;
    text: string;
    font: string | undefined;
    renderParagraphs: boolean;
  }> = {
    poems: {
      wrapper: "text-center max-w-xl mx-auto px-2",
      text: "whitespace-pre-wrap text-lg leading-[2] text-stone-mid tracking-wide",
      font: "var(--font-display)",
      renderParagraphs: false,
    },
    "write-ups": {
      wrapper: "max-w-2xl mx-auto px-2 sm:px-4",
      text: "text-base leading-8 text-stone-mid",
      font: undefined,
      renderParagraphs: true,
    },
    "long-messages": {
      wrapper: "max-w-2xl mx-auto px-2 sm:px-4",
      text: "text-base leading-8 text-stone-mid",
      font: undefined,
      renderParagraphs: true,
    },
    videos: {
      wrapper: "max-w-2xl mx-auto",
      text: "text-base leading-8 text-stone-mid",
      font: undefined,
      renderParagraphs: false,
    },
    others: {
      wrapper: "max-w-2xl mx-auto px-2 sm:px-4",
      text: "whitespace-pre-wrap text-base leading-8 text-stone-mid",
      font: undefined,
      renderParagraphs: false,
    },
  };

  const cs = contentStyle[item.type];

  // Split into paragraphs for prose types (double newline = paragraph break)
  const paragraphs = cs.renderParagraphs
    ? item.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : null;

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      {/* Top Banner */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/library/type/${item.type}`}
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← Back to {categoryNames[item.type]}
          </Link>
          <ShareButton />
        </div>
      </div>

      {/* Main Content Layout */}
      <section className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        {/* Book Sheet Card */}
        <article className="bg-parchment-soft border border-stone-edge rounded-3xl p-6 sm:p-12 shadow-sm max-w-3xl w-full mx-auto">
          {/* Metadata Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-stone-edge/40 pb-6 mb-8 text-center sm:text-left">
            <div>
              <span
                className="text-[9px] font-bold tracking-widest text-gold uppercase block mb-1"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {categoryNames[item.type].replace("s", "")} Collection
              </span>
              <p className="text-xs text-stone-light">
                Published on{" "}
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className="text-[10px] text-gold-deep font-semibold bg-vellum px-3 py-1 rounded-full border border-stone-edge shadow-sm">
              {item.topic}
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-4xl sm:text-5xl font-bold text-ink leading-tight mb-4 tracking-tight ${
              item.type === "poems" ? "text-center" : "text-left"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {item.title}
          </h1>

          {/* Author Credits */}
          <p
            className={`text-xs font-semibold text-stone-light uppercase tracking-widest mb-8 ${
              item.type === "poems" ? "text-center" : "text-left"
            }`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            By {item.author || "Anonymous"}
          </p>

          {/* Signature Dot-Divider */}
          <div className="flex items-center justify-center gap-2 mb-10 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>

          {/* Core Content Body — styled per content type */}
          <div className={cs.wrapper}>
            {item.type === "videos" ? (
              /* Video embed */
              <div>
                {videoId ? (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-stone-edge shadow-sm" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-stone-edge bg-parchment-deep p-8 text-center text-stone-light text-sm">
                    Video could not be loaded. The URL may be invalid.
                  </div>
                )}
                {videoDescription && (
                  <p className="mt-6 text-base leading-8 text-stone-mid">{videoDescription}</p>
                )}
              </div>
            ) : paragraphs ? (
              // Prose types: each double-newline block → <p>, single newlines → <br>
              <div className={cs.text} style={cs.font ? { fontFamily: cs.font } : undefined}>
                {paragraphs.map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-6" : ""}>
                    {para.split("\n").map((line, j, arr) => (
                      <span key={j}>
                        {line}
                        {j < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            ) : (
              // Poem / others: preserve whitespace exactly as authored
              <p className={cs.text} style={cs.font ? { fontFamily: cs.font } : undefined}>
                {item.content}
              </p>
            )}
          </div>

          {/* Bottom Dot-Divider */}
          <div className="flex items-center justify-center gap-2 mt-12 mb-6 text-stone-light">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        </article>
      </section>

      {/* Brand Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-8 text-center mt-20">
        <p className="text-[10px] text-stone-light uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
          BURP Content Library · Berean Upper Room Platform
        </p>
      </footer>
    </main>
  );
}
