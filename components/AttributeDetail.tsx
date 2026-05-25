"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReference } from "@/lib/attribute-actions";
import { BIBLE_BOOKS, formatCitation } from "@/types/attributes";
import type { GodAttribute, AttributeReference } from "@/types/attributes";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

export default function AttributeDetail({
  attribute,
}: {
  attribute: GodAttribute & { references: AttributeReference[] };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Form fields
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [verseStart, setVerseStart] = useState("");
  const [verseEnd, setVerseEnd] = useState("");
  const [verseText, setVerseText] = useState("");
  const [note, setNote] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");

  const refs = attribute.references ?? [];

  // Unique books that have references
  const booksWithRefs = Array.from(new Set(refs.map((r) => r.book))).sort(
    (a, b) => BIBLE_BOOKS.indexOf(a as never) - BIBLE_BOOKS.indexOf(b as never)
  );

  const filteredRefs = selectedBook
    ? refs.filter((r) => r.book === selectedBook)
    : refs;

  // Group by book for display
  const grouped: Record<string, AttributeReference[]> = {};
  for (const ref of filteredRefs) {
    if (!grouped[ref.book]) grouped[ref.book] = [];
    grouped[ref.book].push(ref);
  }

  function handleSubmit() {
    setFormError("");
    if (!book) {
      setFormError("Please select a Bible book.");
      return;
    }
    startTransition(async () => {
      const result = await submitReference({
        attributeId: attribute.id,
        book,
        chapter: chapter ? parseInt(chapter) : null,
        verseStart: verseStart ? parseInt(verseStart) : null,
        verseEnd: verseEnd ? parseInt(verseEnd) : null,
        verseText,
        note,
        submittedBy,
      });
      if (result.error) {
        setFormError(result.error);
      } else {
        setSubmitted(true);
        setShowForm(false);
        setBook("");
        setChapter("");
        setVerseStart("");
        setVerseEnd("");
        setVerseText("");
        setNote("");
        setSubmittedBy("");
        router.refresh();
      }
    });
  }

  return (
    <div>
      {/* Book filter pills */}
      {booksWithRefs.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedBook(null)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${
              !selectedBook
                ? "bg-ink text-vellum border-ink"
                : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
            }`}
            style={{ fontFamily: "var(--font-accent)" }}
          >
            All Books
          </button>
          {booksWithRefs.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBook(b === selectedBook ? null : b)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${
                selectedBook === b
                  ? "bg-gold-deep text-white border-gold-deep"
                  : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
              }`}
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* References */}
      {refs.length === 0 ? (
        <div className="text-center py-16 text-stone-mid">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
            No scripture references yet.
          </p>
          <p className="text-sm mt-1">Be the first to add one below.</p>
        </div>
      ) : filteredRefs.length === 0 ? (
        <p className="text-center text-stone-mid py-8 text-sm">
          No references from {selectedBook}.
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([bookName, bookRefs]) => (
            <div key={bookName}>
              <h3
                className="text-xs font-bold tracking-widest uppercase text-gold-deep mb-3"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {bookName}
              </h3>
              <div className="space-y-4">
                {bookRefs.map((ref) => (
                  <ReferenceCard key={ref.id} ref_={ref} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reference section */}
      <div className="mt-14 border-t border-stone-edge pt-10">
        {submitted && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-800">
            ✓ Your reference was submitted and will appear after review. Thank you!
          </div>
        )}

        {!showForm ? (
          <div className="text-center">
            <p
              className="text-xl font-bold text-ink mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Found a scripture that shows this?
            </p>
            <p className="text-sm text-stone-mid mb-5">
              Add a Bible reference that reveals{" "}
              <span className="font-semibold text-ink">
                {attribute.name}
              </span>{" "}
              in God&apos;s character.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-xl border-2 border-dashed border-stone-edge text-stone-mid font-bold text-sm hover:border-gold hover:text-gold-deep hover:bg-gold-wash transition-colors"
            >
              + Add a Scripture Reference
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h3
              className="text-xl font-bold text-ink mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Add a Scripture Reference
            </h3>
            <p className="text-sm text-stone-mid mb-6">
              Showing how <span className="font-semibold text-ink">{attribute.name}</span> is
              revealed in the Bible.
            </p>

            <div className="space-y-4 bg-parchment-soft rounded-2xl border border-stone-edge p-5">
              {/* Book + Chapter + Verses */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1">
                  <label
                    className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Book <span className="text-gold">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={book}
                    onChange={(e) => setBook(e.target.value)}
                  >
                    <option value="">Select book…</option>
                    <optgroup label="Old Testament">
                      {BIBLE_BOOKS.slice(0, 39).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="New Testament">
                      {BIBLE_BOOKS.slice(39).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Chapter
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    min={1}
                    placeholder="e.g. 1"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5"
                    style={{ fontFamily: "var(--font-accent)" }}
                  >
                    Verse(s)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      className={inputCls}
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      value={verseStart}
                      onChange={(e) => setVerseStart(e.target.value)}
                    />
                    <span className="text-stone-light text-sm flex-shrink-0">–</span>
                    <input
                      className={inputCls}
                      type="number"
                      min={1}
                      placeholder="end"
                      value={verseEnd}
                      onChange={(e) => setVerseEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Verse Text */}
              <div>
                <label
                  className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Verse Text{" "}
                  <span className="text-stone-light font-normal normal-case tracking-normal">
                    (paste the actual verse)
                  </span>
                </label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="e.g. In the beginning, God created the heavens and the earth."
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                />
              </div>

              {/* Note */}
              <div>
                <label
                  className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Your Note{" "}
                  <span className="text-stone-light font-normal normal-case tracking-normal">
                    (how does this show this attribute?)
                  </span>
                </label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="e.g. God creating ex nihilo reveals His omnipotence — no pre-existing matter needed."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Submitted By */}
              <div>
                <label
                  className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Your Name{" "}
                  <span className="text-stone-light font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Anonymous"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                />
              </div>

              {formError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {formError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={isPending || !book}
                  className="px-5 py-2.5 rounded-xl bg-ink text-vellum text-sm font-bold hover:bg-stone transition-colors disabled:opacity-50"
                >
                  {isPending ? "Submitting…" : "Submit Reference"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                  className="px-5 py-2.5 rounded-xl border border-stone-edge text-stone-mid text-sm font-semibold hover:border-gold hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReferenceCard({ ref_ }: { ref_: AttributeReference }) {
  const citation = formatCitation(ref_);
  return (
    <div className="rounded-2xl border border-stone-edge bg-white p-5">
      <p
        className="text-xs font-bold tracking-widest uppercase text-gold-deep mb-3"
        style={{ fontFamily: "var(--font-accent)" }}
      >
        {citation}
      </p>
      {ref_.verse_text && (
        <blockquote className="border-l-2 border-gold-soft pl-4 italic text-base text-ink leading-relaxed mb-3">
          &ldquo;{ref_.verse_text}&rdquo;
        </blockquote>
      )}
      {ref_.note && (
        <p className="text-sm text-stone-mid leading-relaxed">{ref_.note}</p>
      )}
      {ref_.submitted_by && (
        <p className="text-xs text-stone-light mt-3">— {ref_.submitted_by}</p>
      )}
    </div>
  );
}
