import Link from "next/link";
import { getLibraryItems } from "@/lib/library-actions";
import LibraryCard from "@/components/LibraryCard";
import type { LibraryItem, LibraryType } from "@/types/library";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const revalidate = 0; // Fetch dynamic data on every request

export default async function LibraryPortalPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";

  // Fetch all items to compute category counts and locate featured items
  const allItems = await getLibraryItems();
  
  // Filtered search items if a query is active
  const searchResults = searchQuery
    ? allItems.filter((item) => {
        const q = searchQuery.toLowerCase();
        // For videos: search title, author, topic, and description (lines after the URL)
        // — not the raw YouTube URL itself
        const searchableContent =
          item.type === "videos"
            ? item.content.split("\n").slice(2).join(" ")
            : item.content;
        return (
          item.title.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q) ||
          searchableContent.toLowerCase().includes(q) ||
          (item.author?.toLowerCase().includes(q) ?? false)
        );
      })
    : [];

  const countByType = (type: LibraryType) => {
    return allItems.filter((item) => item.type === type).length;
  };

  const featuredItems = allItems.filter((item) => item.featured);

  const categories = [
    {
      id: "poems",
      name: "Poems",
      desc: "Short verse-form spiritual content, lyrics, and prayers.",
      count: countByType("poems"),
      icon: (
        <svg
          className="w-8 h-8 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      ),
    },
    {
      id: "write-ups",
      name: "Write-Ups",
      desc: "Medium-length reflections, devotionals, and testimonies.",
      count: countByType("write-ups"),
      icon: (
        <svg
          className="w-8 h-8 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
    },
    {
      id: "long-messages",
      name: "Long Messages",
      desc: "In-depth theological teachings, essays, and complete sermons.",
      count: countByType("long-messages"),
      icon: (
        <svg
          className="w-8 h-8 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
      ),
    },
    {
      id: "videos",
      name: "Videos",
      desc: "YouTube sermons, teachings, and spiritual content shared by the community.",
      count: countByType("videos"),
      icon: (
        <svg
          className="w-8 h-8 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
          />
        </svg>
      ),
    },
    {
      id: "others",
      name: "Others",
      desc: "Miscellaneous quotes, single-sentence prayers, and scriptures.",
      count: countByType("others"),
      icon: (
        <svg
          className="w-8 h-8 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      {/* Page Header */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← B U R P
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/library/submit"
              className="px-4 py-2 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-xs tracking-wide transition-colors duration-140"
            >
              Submit Content
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section
        className="py-16 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <span
            className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            EDIFICATION & FELLOWSHIP
          </span>
          <h1
            className="text-4xl sm:text-6xl font-bold text-ink mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Spiritual Content Library
          </h1>
          <p className="text-stone-mid text-sm max-w-lg mx-auto leading-relaxed mb-8">
            A structured repository of poems, reflections, deep teachings, and devotionals
            submitted by the Berean Upper Room community.
          </p>

          {/* Core Search Bar */}
          <form action="/library" method="GET" className="max-w-md mx-auto relative">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by title, topic, author…"
              className="w-full bg-vellum border border-stone-edge text-ink text-sm rounded-full pl-6 pr-12 py-3.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-stone-light"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Dynamic View: Search Results OR Category Browse */}
      <section className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        {searchQuery ? (
          <div>
            <div className="flex items-center justify-between border-b border-stone-edge pb-4 mb-8">
              <h2
                className="text-2xl font-bold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Search results for &ldquo;{searchQuery}&rdquo;
              </h2>
              <Link
                href="/library"
                className="text-xs font-semibold text-gold-deep hover:text-gold uppercase tracking-wider transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Clear Search
              </Link>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge">
                <p className="text-stone-mid text-sm italic mb-4">
                  No content matches your search. Sit with it. Try another word.
                </p>
                <Link
                  href="/library"
                  className="px-6 py-2.5 rounded-full border border-stone-edge hover:border-gold text-stone hover:text-ink font-semibold text-xs tracking-wider transition-all"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Return to Categories
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Browse View */
          <div>
            <h2
              className="text-3xl sm:text-4.5xl font-bold text-ink text-center mb-10 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Browse by Content Type
            </h2>

            {/* Category Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-16">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/library/type/${cat.id}`}
                  className="group bg-parchment-soft p-8 rounded-3xl border border-stone-edge hover:border-gold hover:shadow-md transition-all duration-220 flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-6 flex justify-between items-start">
                      {cat.icon}
                      <span className="text-xs font-semibold text-gold-deep bg-vellum px-2.5 py-1 rounded-full border border-stone-edge">
                        {cat.count}
                      </span>
                    </div>
                    <h3
                      className="text-2.5xl sm:text-3xl font-bold text-ink mb-3 group-hover:text-gold-deep transition-colors tracking-tight leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-mid leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-1 text-[10px] font-bold tracking-wider text-stone group-hover:text-ink uppercase transition-colors" style={{ fontFamily: "var(--font-accent)" }}>
                    <span>Browse Collection</span>
                    <span className="text-sm font-sans leading-none transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pinned / Featured Spiritual Content */}
            {featuredItems.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-stone-edge" />
                  <span
                    className="text-[10px] font-bold tracking-widest text-gold-deep uppercase"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    FEATURED CONTENT
                  </span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-stone-edge" />
                </div>

                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                  {featuredItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/library/item/${item.id}`}
                      className="group bg-vellum p-8 rounded-3xl border-2 border-gold-soft hover:border-gold hover:shadow-md transition-all duration-220 flex flex-col justify-between relative overflow-hidden"
                    >
                      {/* Elegant gold corner accent */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gold-wash flex items-center justify-center border-b border-l border-gold-soft text-[10px] text-gold font-bold">
                        ★
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="text-[9px] font-bold tracking-widest text-gold uppercase"
                            style={{ fontFamily: "var(--font-accent)" }}
                          >
                            {item.type.replace("-", " ")}
                          </span>
                          <span className="text-[10px] text-stone font-semibold bg-parchment-soft px-2.5 py-0.5 rounded-full border border-stone-edge/50">
                            {item.topic}
                          </span>
                        </div>
                        <h3
                          className="text-2.5xl sm:text-3xl font-bold text-ink mb-3 group-hover:text-gold-deep transition-colors tracking-tight leading-snug"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-stone-mid leading-relaxed mb-6 line-clamp-4 italic">
                          &ldquo;{item.excerpt}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-stone-edge/30 pt-4 text-[10px] text-stone-light">
                        <span className="font-semibold">By {item.author || "Anonymous"}</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Brand Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center mt-20">
        <p className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
          BURP Content Library · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
