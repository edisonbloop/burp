import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttribute } from "@/lib/attribute-actions";
import RichTextContent from "@/components/RichTextContent";
import PageHeader from "@/components/PageHeader";

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const attribute = await getAttribute(id);
  if (!attribute) return { title: "Attribute not found" };
  return {
    title: `${attribute.name} — Attributes of God | BURP`,
    description:
      attribute.description ??
      `Explore the attribute of God: ${attribute.name}. See scriptures and community insights.`,
    openGraph: {
      title: `${attribute.name} — Attributes of God`,
      description: attribute.description ?? `Scripture-anchored insights on God's ${attribute.name}.`,
    },
  };
}

export default async function AttributePage({ params }: Props) {
  const { id } = await params;
  const attribute = await getAttribute(id);

  if (!attribute) notFound();

  const isBook = attribute.entry_type === "book";

  // For book studies: separate the book name from the study subtitle.
  // Name is stored as e.g. "Genesis – From Creation to Covenant: …"
  // We want to display "Genesis" large and the rest as a subtitle.
  const bookTitle = isBook ? (attribute.passage_book ?? attribute.name) : null;
  const bookSubtitle = isBook
    ? (() => {
        const name = attribute.name;
        const book = attribute.passage_book ?? "";
        for (const sep of [" – ", " - ", ": "]) {
          if (name.startsWith(book + sep)) return name.slice(book.length + sep.length);
        }
        // Name is just the book name or something else entirely
        return name !== book ? name : null;
      })()
    : null;

  return (
    <div className="flex-1 flex flex-col bg-vellum min-h-screen">
      <PageHeader title="Attributes of God" backHref="/attributes" />

      {/* Hero */}
      <div
        className="w-full px-4 sm:px-6 py-14 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 80%)",
        }}
      >
        {/* Badges row */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
          <span
            className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isBook
                ? "bg-parchment-soft text-stone border-stone-edge"
                : "bg-gold-wash text-gold-deep border-gold-soft"
            }`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {isBook ? "Book Study" : "Attribute"}
          </span>
          {attribute.featured && (
            <span
              className="text-xs font-bold tracking-widest uppercase text-gold-deep bg-gold-wash border border-gold-soft px-3 py-1 rounded-full"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              ★ Featured
            </span>
          )}
        </div>

        {isBook ? (
          /* Book study: big book name + subtitle line */
          <div className="max-w-3xl mx-auto">
            <h1
              className="text-6xl sm:text-7xl font-bold text-ink tracking-tight leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {bookTitle}
            </h1>
            {bookSubtitle && (
              <p
                className="text-xl sm:text-2xl text-stone-mid mt-4 leading-snug font-medium max-w-2xl mx-auto"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {bookSubtitle}
              </p>
            )}
          </div>
        ) : (
          /* Named attribute: single large title */
          <h1
            className="text-5xl sm:text-6xl font-bold text-ink tracking-tight leading-tight max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {attribute.name}
          </h1>
        )}

        {attribute.description && (
          <p className="text-base text-stone-mid mt-5 max-w-2xl mx-auto leading-relaxed">
            {attribute.description}
          </p>
        )}
      </div>

      {/* Rich text content */}
      {attribute.content && (
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="rounded-2xl border border-stone-edge bg-white px-6 sm:px-10 py-8">
            <RichTextContent html={attribute.content} />
          </div>
        </div>
      )}

      {/* Back to all attributes */}
      <div className="border-t border-stone-edge py-8 text-center">
        <Link
          href="/attributes"
          className="text-sm text-stone-mid hover:text-ink transition-colors"
        >
          ← Back to all attributes
        </Link>
      </div>
    </div>
  );
}
