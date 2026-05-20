import Link from "next/link";
import { getLibraryItems, getTopics } from "@/lib/library-actions";
import LibraryCard from "@/components/LibraryCard";
import type { LibraryType } from "@/types/library";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ topic?: string }>;
}

export const revalidate = 0; // Fresh dynamic queries on every filter shift

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const rawType = resolvedParams.type;
  const selectedTopic = resolvedSearchParams.topic || "all";

  // Validate type
  const validTypes = ["poems", "write-ups", "long-messages", "videos", "others"];
  if (!validTypes.includes(rawType)) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-vellum text-ink py-20">
        <p className="text-stone-mid text-sm italic mb-4">This collection does not exist.</p>
        <Link href="/library" className="px-6 py-2.5 rounded-full bg-ink text-vellum font-semibold text-xs">
          Return to Library
        </Link>
      </main>
    );
  }

  const type = rawType as LibraryType;

  // Format category display names
  const categoryNames: Record<LibraryType, string> = {
    poems: "Poems",
    "write-ups": "Write-Ups",
    "long-messages": "Long Messages",
    videos: "Videos",
    others: "Other Materials",
  };

  // Fetch topics and library items based on filter parameters
  const topics = await getTopics();
  const items = await getLibraryItems(type, selectedTopic === "all" ? undefined : selectedTopic);

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      {/* Category Header */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/library"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← Library Categories
          </Link>
          <Link
            href={`/library/submit?type=${type}`}
            className="px-4 py-2 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-xs tracking-wide transition-colors duration-140"
          >
            Submit {categoryNames[type].replace("s", "")}
          </Link>
        </div>
      </div>

      {/* Category Hero */}
      <section
        className="py-12 px-4 text-center border-b border-stone-edge/50"
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
            COLLECTION Browse
          </span>
          <h1
            className="text-4xl sm:text-5.5xl font-bold text-ink mb-3 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {categoryNames[type]}
          </h1>
          <p className="text-stone-mid text-xs max-w-md mx-auto leading-relaxed">
            Feast on our compiled assembly of {categoryNames[type].toLowerCase()}. Sit with them, reflect, and share.
          </p>
        </div>
      </section>

      {/* Topic Filter Horizontal Row */}
      <section className="border-b border-stone-edge bg-parchment-soft py-4 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-[10px] font-bold text-stone-mid uppercase tracking-widest flex-shrink-0" style={{ fontFamily: "var(--font-accent)" }}>
            Topics:
          </span>
          <div className="flex gap-2.5 overflow-x-auto py-1 pr-4">
            {/* All Topics Pill */}
            <Link
              href={`/library/type/${type}`}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all border shrink-0 ${
                selectedTopic === "all"
                  ? "bg-ink text-vellum border-ink shadow-sm"
                  : "bg-vellum text-stone hover:text-ink hover:border-stone-mid border-stone-edge"
              }`}
            >
              All Topics
            </Link>

            {/* Dynamic Topics Pills */}
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/library/type/${type}?topic=${encodeURIComponent(topic.name)}`}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all border shrink-0 ${
                  selectedTopic === topic.name
                    ? "bg-gold-deep text-vellum border-gold-deep shadow-sm"
                    : "bg-vellum text-stone hover:text-ink hover:border-stone-mid border-stone-edge"
                }`}
              >
                {topic.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-parchment-soft rounded-3xl border border-stone-edge max-w-lg mx-auto">
            <p className="text-stone-mid text-sm italic mb-6">
              No content matches the selected topic category. Be the first to add a piece here!
            </p>
            <Link
              href={`/library/submit?type=${type}&topic=${
                selectedTopic !== "all" ? encodeURIComponent(selectedTopic) : ""
              }`}
              className="px-6 py-3 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-xs tracking-wider transition-colors"
            >
              Submit Something
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Footer */}
      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center mt-20">
        <p className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest" style={{ fontFamily: "var(--font-accent)" }}>
          BURP Content Library · {categoryNames[type]} Collection
        </p>
      </footer>
    </main>
  );
}
