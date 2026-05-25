"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { submitAttribute } from "@/lib/attribute-actions";
import { BIBLE_BOOKS } from "@/types/attributes";
import PageHeader from "@/components/PageHeader";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

type EntryType = "attribute" | "chapter";

const TYPE_OPTIONS: {
  id: EntryType;
  icon: string;
  label: string;
  sublabel: string;
  example: string;
}[] = [
  {
    id: "attribute",
    icon: "✦",
    label: "God's Attribute",
    sublabel: "A named quality or character of God",
    example: "e.g. Omniscient · Holy · Faithful · Merciful",
  },
  {
    id: "chapter",
    icon: "📖",
    label: "Chapter Study",
    sublabel: "What a Bible passage reveals about God",
    example: "e.g. Genesis 1 · Isaiah 40 · Job 38–39 · Romans 8",
  },
];

export default function SubmitAttributePage() {
  const [isPending, startTransition] = useTransition();
  const [entryType, setEntryType] = useState<EntryType>("attribute");

  // Shared fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");

  // Chapter-study fields
  const [passageBook, setPassageBook] = useState("");
  const [passageChapter, setPassageChapter] = useState("");
  const [passageChapterEnd, setPassageChapterEnd] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setName("");
    setDescription("");
    setContent("");
    setSubmittedBy("");
    setPassageBook("");
    setPassageChapter("");
    setPassageChapterEnd("");
    setError("");
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await submitAttribute({
        entryType,
        name,
        description,
        content,
        submittedBy,
        passageBook: passageBook || undefined,
        passageChapter: passageChapter ? parseInt(passageChapter) : null,
        passageChapterEnd: passageChapterEnd ? parseInt(passageChapterEnd) : null,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  const canSubmit =
    entryType === "attribute" ? name.trim().length > 0 : passageBook.length > 0;

  if (success) {
    return (
      <div className="flex-1 flex flex-col bg-vellum">
        <PageHeader title="Attributes of God" backHref="/attributes" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="text-5xl mb-6">✦</div>
          <h2
            className="text-3xl font-bold text-ink mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Thank you!
          </h2>
          <p className="text-base text-stone-mid max-w-md mb-8">
            Your {entryType === "chapter" ? "chapter study" : "attribute"} has been submitted and
            will appear after review. We appreciate your contribution to knowing God more deeply.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => { setSuccess(false); resetForm(); }}
              className="px-5 py-2.5 rounded-xl border border-stone-edge text-stone-mid font-semibold text-sm hover:border-gold hover:text-ink transition-colors"
            >
              Submit another
            </button>
            <Link
              href="/attributes"
              className="px-5 py-2.5 rounded-xl bg-ink text-vellum font-bold text-sm hover:bg-stone transition-colors"
            >
              Browse Attributes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-vellum">
      <PageHeader title="Attributes of God" backHref="/attributes" />

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-ink mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What would you like to share?
          </h1>
          <p className="text-base text-stone-mid">
            Choose a format — a named attribute, or a full reflection on a Bible passage.
          </p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {TYPE_OPTIONS.map((opt) => {
            const active = entryType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setEntryType(opt.id); resetForm(); }}
                className={`text-left rounded-2xl border-2 p-4 transition-all ${
                  active
                    ? "border-gold bg-gold-wash/40 shadow-sm"
                    : "border-stone-edge bg-white hover:border-gold-soft hover:bg-gold-wash/20"
                }`}
              >
                <span className="text-2xl block mb-2">{opt.icon}</span>
                <p
                  className="font-bold text-ink text-base leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-stone-mid mt-1 leading-relaxed">{opt.sublabel}</p>
                <p
                  className="text-[10px] text-stone-light mt-2 font-medium tracking-wide"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {opt.example}
                </p>
                {active && (
                  <span className="mt-3 inline-block text-[10px] font-bold tracking-widest uppercase text-gold-deep bg-gold-wash px-2 py-0.5 rounded-full border border-gold-soft/50">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── ATTRIBUTE fields ──────────────────────────────────── */}
        {entryType === "attribute" && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                Attribute Name <span className="text-gold">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Omniscient, Holy, Faithful, Just, Sovereign…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-stone-light mt-1">A single word or short phrase describing who God is.</p>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                Short Summary{" "}
                <span className="text-stone-light font-normal normal-case tracking-normal">(shown on the card)</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. God knows all things completely — past, present, and future."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <RichTextSection content={content} onChange={setContent} />
          </div>
        )}

        {/* ── CHAPTER STUDY fields ──────────────────────────────── */}
        {entryType === "chapter" && (
          <div className="space-y-5">
            {/* Passage */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                Bible Passage <span className="text-gold">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 sm:col-span-1">
                  <select
                    className={inputCls}
                    value={passageBook}
                    onChange={(e) => setPassageBook(e.target.value)}
                  >
                    <option value="">Book…</option>
                    <optgroup label="Old Testament">
                      {BIBLE_BOOKS.slice(0, 39).map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </optgroup>
                    <optgroup label="New Testament">
                      {BIBLE_BOOKS.slice(39).map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <input
                    className={inputCls}
                    type="number"
                    min={1}
                    placeholder="Chapter"
                    value={passageChapter}
                    onChange={(e) => setPassageChapter(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    className={inputCls}
                    type="number"
                    min={1}
                    placeholder="To ch. (optional)"
                    value={passageChapterEnd}
                    onChange={(e) => setPassageChapterEnd(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-stone-light mt-1">
                Select a book and optionally a chapter or chapter range (e.g. Job 38–39).
              </p>
            </div>

            {/* Custom title */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                Study Title{" "}
                <span className="text-stone-light font-normal normal-case tracking-normal">
                  (optional — auto-filled from passage)
                </span>
              </label>
              <input
                className={inputCls}
                placeholder={
                  passageBook
                    ? `e.g. ${passageBook}${passageChapter ? ` ${passageChapter}` : ""} — God's Power on Display`
                    : "e.g. Genesis 1 — God as Creator"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Short summary */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                Short Summary{" "}
                <span className="text-stone-light font-normal normal-case tracking-normal">(shown on the card)</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Genesis 1 reveals God as the all-powerful, intentional Creator who brings order from nothing."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <RichTextSection
              content={content}
              onChange={setContent}
              label="Full Chapter Reflection"
              placeholder="Explore what this passage reveals about God — His character, His ways, what stands out to you. You can mention multiple attributes…"
            />
          </div>
        )}

        {/* Shared: submitted by + submit button */}
        <div className="space-y-5 mt-5">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
              Your Name{" "}
              <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              className={inputCls}
              placeholder="Anonymous"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isPending || !canSubmit}
              className="px-6 py-3 rounded-xl bg-ink text-vellum text-sm font-bold hover:bg-stone transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {isPending
                ? "Submitting…"
                : entryType === "chapter"
                ? "Submit Chapter Study"
                : "Submit Attribute"}
            </button>
            <Link
              href="/attributes"
              className="px-6 py-3 rounded-xl border border-stone-edge text-stone-mid text-sm font-semibold hover:border-gold hover:text-ink transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RichTextSection({
  content,
  onChange,
  label = "Full Reflection",
  placeholder = "Write a deeper reflection — what this reveals about who God is, why it matters, how you encountered it…",
}: {
  content: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-stone mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
        {label}{" "}
        <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
      </label>
      <RichTextEditor
        value={content}
        onChange={onChange}
        placeholder={placeholder}
        minHeight="260px"
      />
      <p className="text-xs text-stone-light mt-1.5">
        Use headings to structure, quotes for scripture, bold for emphasis.
      </p>
    </div>
  );
}
