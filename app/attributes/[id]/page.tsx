import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttribute } from "@/lib/attribute-actions";
import { formatPassage } from "@/types/attributes";
import AttributeDetail from "@/components/AttributeDetail";
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

  const refCount = attribute.references?.length ?? 0;

  return (
    <div className="flex-1 flex flex-col bg-vellum min-h-screen">
      <PageHeader title="Attributes of God" backHref="/attributes" />

      {/* Attribute / Chapter study hero */}
      <div
        className="w-full px-4 sm:px-6 py-14 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 80%)",
        }}
      >
        {/* Badges row */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
          <span
            className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              attribute.entry_type === "chapter"
                ? "bg-parchment-soft text-stone border-stone-edge"
                : "bg-gold-wash text-gold-deep border-gold-soft"
            }`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {attribute.entry_type === "chapter" ? "Chapter Study" : "Attribute"}
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

        {/* For chapter studies: show passage above the title */}
        {attribute.entry_type === "chapter" && attribute.passage_book && (
          <p
            className="text-sm font-bold tracking-widest uppercase text-gold-deep mb-2"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {formatPassage(attribute)}
          </p>
        )}

        <h1
          className="text-5xl sm:text-6xl font-bold text-ink tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {attribute.name}
        </h1>
        {attribute.description && (
          <p className="text-base text-stone-mid mt-4 max-w-2xl mx-auto leading-relaxed">
            {attribute.description}
          </p>
        )}
        <p className="text-sm text-stone-light mt-4">
          {refCount === 0
            ? "No scripture references yet — add the first one."
            : `${refCount} scripture reference${refCount === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Long-form rich text content */}
      {attribute.content && (
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-10">
          <div className="rounded-2xl border border-stone-edge bg-white px-6 sm:px-10 py-8">
            <p
              className="text-xs font-bold tracking-widest uppercase text-gold-deep mb-6"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Theological Reflection
            </p>
            <RichTextContent html={attribute.content} />
          </div>
        </div>
      )}

      {/* Scripture references & add-reference form */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        {attribute.references && attribute.references.length > 0 && (
          <p
            className="text-xs font-bold tracking-widest uppercase text-stone mb-6"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Scripture References
          </p>
        )}
        <AttributeDetail attribute={attribute} />
      </div>

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
