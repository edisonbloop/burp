import Link from "next/link";
import { getAttributes } from "@/lib/attribute-actions";
import { formatPassage } from "@/types/attributes";
import type { GodAttribute } from "@/types/attributes";
import PageHeader from "@/components/PageHeader";

export const revalidate = 0;

export default async function AttributesPage() {
  const attributes = await getAttributes();
  const featured = attributes.filter((a) => a.featured);
  const rest = attributes.filter((a) => !a.featured);

  const namedAttrs = attributes.filter((a) => a.entry_type === "attribute");
  const chapterStudies = attributes.filter((a) => a.entry_type === "chapter");

  return (
    <div className="flex-1 flex flex-col bg-vellum min-h-screen">
      <PageHeader
        title="Attributes of God"
        subtitle="Who is He? A growing catalogue of God's nature — named attributes and passage studies, anchored in Scripture."
        backHref="/"
      />

      {/* Hero accent */}
      <div
        className="w-full py-10 px-4 sm:px-6 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 80%)",
        }}
      >
        <p
          className="text-4xl sm:text-5xl font-bold text-ink tracking-tight max-w-2xl mx-auto leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Know Him more deeply.
        </p>
        <p className="text-base text-stone-mid mt-3 max-w-xl mx-auto">
          Browse attributes, explore Bible passage studies, and add what you&apos;ve discovered.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <Link
            href="/attributes/submit"
            className="px-5 py-2.5 rounded-xl bg-ink text-vellum text-sm font-bold hover:bg-stone transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            + Add an Entry
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">

        {attributes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✦</p>
            <p className="text-xl text-stone-mid" style={{ fontFamily: "var(--font-display)" }}>
              No entries yet — be the first to add one.
            </p>
            <Link
              href="/attributes/submit"
              className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-ink text-vellum text-sm font-bold hover:bg-stone transition-colors"
            >
              Add an Entry
            </Link>
          </div>
        )}

        {/* Featured (mixed types) */}
        {featured.length > 0 && (
          <section className="mb-12">
            <SectionHeader label="★ Featured" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((attr) => (
                <AttributeCard key={attr.id} attr={attr} highlighted />
              ))}
            </div>
          </section>
        )}

        {/* Named Attributes */}
        {namedAttrs.filter((a) => !a.featured).length > 0 && (
          <section className="mb-12">
            <SectionHeader
              label="Attributes of God"
              desc="Named qualities that describe who God is."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {namedAttrs.filter((a) => !a.featured).map((attr) => (
                <AttributeCard key={attr.id} attr={attr} />
              ))}
            </div>
          </section>
        )}

        {/* Chapter Studies */}
        {chapterStudies.filter((a) => !a.featured).length > 0 && (
          <section className="mb-12">
            <SectionHeader
              label="Chapter Studies"
              desc="Reflections on Bible passages and what they reveal about God."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapterStudies.filter((a) => !a.featured).map((attr) => (
                <AttributeCard key={attr.id} attr={attr} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        {attributes.length > 0 && (
          <div className="mt-8 text-center border-t border-stone-edge pt-10">
            <p
              className="text-2xl font-bold text-ink mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Something missing?
            </p>
            <p className="text-base text-stone-mid mb-6">
              Add a named attribute or a chapter study you&apos;ve been sitting with.
            </p>
            <Link
              href="/attributes/submit"
              className="px-6 py-3 rounded-xl border-2 border-dashed border-stone-edge text-stone-mid font-bold text-sm hover:border-gold hover:text-gold-deep hover:bg-gold-wash transition-colors"
            >
              + Add an Entry
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="mb-4">
      <p
        className="text-xs font-bold tracking-widest uppercase text-gold-deep"
        style={{ fontFamily: "var(--font-accent)" }}
      >
        {label}
      </p>
      {desc && <p className="text-sm text-stone-light mt-0.5">{desc}</p>}
    </div>
  );
}

function AttributeCard({ attr, highlighted }: { attr: GodAttribute; highlighted?: boolean }) {
  const isChapter = attr.entry_type === "chapter";
  const passage = isChapter ? formatPassage(attr) : null;

  return (
    <Link
      href={`/attributes/${attr.id}`}
      className={`group block rounded-2xl border p-6 transition-all hover:shadow-md hover:-translate-y-0.5 ${
        highlighted
          ? "border-gold-soft bg-gold-wash/30 hover:border-gold"
          : "border-stone-edge bg-white hover:border-gold-soft"
      }`}
    >
      <div className="flex items-start gap-2 mb-3 flex-wrap">
        {/* Type badge */}
        <span
          className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${
            isChapter
              ? "bg-parchment-soft text-stone border-stone-edge"
              : "bg-gold-wash text-gold-deep border-gold-soft/50"
          }`}
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {isChapter ? "Chapter Study" : "Attribute"}
        </span>
        {highlighted && (
          <span
            className="text-[10px] font-bold tracking-widest uppercase text-gold-deep bg-gold-wash px-2.5 py-1 rounded-full border border-gold-soft/50"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ★ Featured
          </span>
        )}
      </div>

      {/* For chapter studies: show passage prominently above title */}
      {isChapter && passage && (
        <p
          className="text-xs font-bold tracking-widest uppercase text-gold-deep mb-1"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {passage}
        </p>
      )}

      <h2
        className="text-2xl font-bold text-ink group-hover:text-gold-deep transition-colors leading-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {attr.name}
      </h2>

      {attr.description && (
        <p className="text-sm text-stone-mid mt-2 leading-relaxed line-clamp-3">
          {attr.description}
        </p>
      )}

      <p className="text-xs text-gold-deep mt-4 font-semibold group-hover:underline">
        {isChapter ? "Read study →" : "Explore scriptures →"}
      </p>
    </Link>
  );
}
