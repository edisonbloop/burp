"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  adminUpdateAttributeApproval,
  adminUpdateAttributeFeatured,
  adminDeleteAttribute,
  adminUpdateReferenceApproval,
  adminDeleteReference,
} from "@/lib/admin-attribute-actions";
import { formatCitation, formatPassage } from "@/types/attributes";
import type { GodAttribute, AttributeReference } from "@/types/attributes";

const RichTextContent = dynamic(() => import("@/components/RichTextContent"), { ssr: false });

interface AttributeWithRefs extends GodAttribute {
  references: AttributeReference[];
}
interface ReferenceWithAttr extends AttributeReference {
  god_attributes?: { name: string };
}

interface Props {
  attributes: AttributeWithRefs[];
  references: ReferenceWithAttr[];
}

export default function AdminAttributesPanel({ attributes, references }: Props) {
  const [subTab, setSubTab] = useState<"attributes" | "references">("attributes");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const pendingAttrs = attributes.filter((a) => !a.approved).length;
  const pendingRefs = references.filter((r) => !r.approved).length;

  function act(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Sub-tab bar */}
      <div className="flex gap-2 mb-6">
        {(["attributes", "references"] as const).map((t) => {
          const badge = t === "attributes" ? pendingAttrs : pendingRefs;
          return (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              style={{ fontFamily: "var(--font-accent)" }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold tracking-widest uppercase transition-colors ${
                subTab === t
                  ? "bg-ink text-vellum border-ink"
                  : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
              }`}
            >
              {t}
              {badge > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {subTab === "attributes" && (
        <AttributesView
          attributes={attributes}
          isPending={isPending}
          act={act}
        />
      )}
      {subTab === "references" && (
        <ReferencesView
          references={references}
          isPending={isPending}
          act={act}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* Attributes sub-view                                         */
/* ──────────────────────────────────────────────────────────── */
function AttributesView({
  attributes,
  isPending,
  act,
}: {
  attributes: AttributeWithRefs[];
  isPending: boolean;
  act: (fn: () => Promise<{ error?: string }>) => void;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const pending = attributes.filter((a) => !a.approved).length;

  const filtered = attributes.filter((a) => {
    if (filter === "pending" && a.approved) return false;
    if (filter === "approved" && !a.approved) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.description?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div>
      {pending > 0 && filter !== "approved" && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-amber-600 font-bold text-lg">{pending}</span>
          <p className="text-base text-amber-700 font-medium">
            attribute{pending === 1 ? "" : "s"} waiting for approval
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search attributes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <div className="flex gap-2">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ fontFamily: "var(--font-accent)" }}
              className={`text-xs px-4 py-2 rounded-lg border font-bold tracking-widest uppercase transition-colors ${
                filter === f
                  ? "bg-ink text-vellum border-ink"
                  : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
              }`}
            >
              {f}
              {f === "pending" && pending > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-stone-mid font-medium mb-4">
        {filtered.length} attribute{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm">
          {filter === "pending" ? "No pending attributes — all caught up." : "No attributes found."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((attr) => {
            const isExpanded = expanded === attr.id;
            const pendingRefs = attr.references?.filter((r) => !r.approved) ?? [];
            const approvedRefs = attr.references?.filter((r) => r.approved) ?? [];
            return (
              <div
                key={attr.id}
                className={`rounded-2xl border bg-white overflow-hidden ${
                  !attr.approved
                    ? "border-amber-200 bg-amber-50/20"
                    : attr.featured
                    ? "border-gold-soft"
                    : "border-stone-edge"
                }`}
              >
                {/* Row header */}
                <div
                  className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-parchment-soft transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : attr.id)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`text-gold transition-transform duration-200 text-xs flex-shrink-0 mt-1 ${isExpanded ? "rotate-90" : ""}`}
                    >
                      ▶
                    </span>
                    <div className="min-w-0">
                      {/* Passage label for chapter studies */}
                      {attr.entry_type === "chapter" && attr.passage_book && (
                        <p
                          className="text-xs font-bold tracking-widest uppercase text-gold-deep mb-0.5"
                          style={{ fontFamily: "var(--font-accent)" }}
                        >
                          {formatPassage(attr)}
                        </p>
                      )}
                      <p
                        className="font-bold text-ink text-lg truncate"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {attr.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                            attr.entry_type === "chapter"
                              ? "bg-parchment-soft text-stone border-stone-edge"
                              : "bg-gold-wash text-gold-deep border-gold-soft/50"
                          }`}
                          style={{ fontFamily: "var(--font-accent)" }}
                        >
                          {attr.entry_type === "chapter" ? "Chapter Study" : "Attribute"}
                        </span>
                        {!attr.approved && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                        {attr.featured && (
                          <span className="text-xs font-bold text-gold-deep bg-gold-wash px-2 py-0.5 rounded-full">
                            ★ Featured
                          </span>
                        )}
                        <span className="text-sm text-stone-light">
                          {approvedRefs.length} ref{approvedRefs.length === 1 ? "" : "s"}
                          {pendingRefs.length > 0 && (
                            <span className="text-amber-600 font-semibold ml-1">
                              · {pendingRefs.length} pending
                            </span>
                          )}
                        </span>
                      </div>
                      {attr.description && (
                        <p className="text-sm text-stone-mid mt-1 line-clamp-1">{attr.description}</p>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        act(() => adminUpdateAttributeApproval(attr.id, !attr.approved))
                      }
                      disabled={isPending}
                      className={`text-sm px-4 py-2 rounded-lg border font-bold transition-colors disabled:opacity-50 ${
                        attr.approved
                          ? "border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600"
                          : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      {attr.approved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      onClick={() =>
                        act(() => adminUpdateAttributeFeatured(attr.id, !attr.featured))
                      }
                      disabled={isPending}
                      className={`text-sm px-4 py-2 rounded-lg border font-bold transition-colors disabled:opacity-50 ${
                        attr.featured
                          ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                          : "border-stone-edge text-stone-mid hover:border-yellow-300 hover:text-yellow-700"
                      }`}
                    >
                      {attr.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Delete "${attr.name}" and all its references? This cannot be undone.`
                          )
                        )
                          act(() => adminDeleteAttribute(attr.id));
                      }}
                      disabled={isPending}
                      className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expanded: nested references */}
                {isExpanded && (
                  <div className="border-t border-stone-edge/50 bg-parchment-soft px-5 py-4 space-y-3">
                    {attr.description && (
                      <p className="text-base text-stone-mid italic">{attr.description}</p>
                    )}
                    {attr.content && (
                      <div className="bg-white rounded-xl border border-stone-edge px-5 py-4">
                        <p
                          className="text-xs font-bold tracking-widest uppercase text-gold-deep mb-3"
                          style={{ fontFamily: "var(--font-accent)" }}
                        >
                          Full Reflection
                        </p>
                        <RichTextContent html={attr.content} />
                      </div>
                    )}
                    {attr.references && attr.references.length > 0 ? (
                      <div className="space-y-2">
                        <p
                          className="text-xs font-bold tracking-widest uppercase text-stone"
                          style={{ fontFamily: "var(--font-accent)" }}
                        >
                          Scripture References
                        </p>
                        {attr.references.map((ref) => (
                          <NestedRefRow
                            key={ref.id}
                            ref_={ref}
                            isPending={isPending}
                            act={act}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-light">No references submitted yet.</p>
                    )}
                    <p className="text-sm text-stone-light">
                      Submitted{" "}
                      {new Date(attr.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {attr.submitted_by && ` by ${attr.submitted_by}`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NestedRefRow({
  ref_,
  isPending,
  act,
}: {
  ref_: AttributeReference;
  isPending: boolean;
  act: (fn: () => Promise<{ error?: string }>) => void;
}) {
  const citation = formatCitation(ref_);
  return (
    <div
      className={`flex items-start justify-between gap-3 bg-white rounded-xl border px-4 py-3 ${
        !ref_.approved ? "border-amber-200 bg-amber-50/30" : "border-stone-edge"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className="text-xs font-bold text-gold-deep"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {citation}
          </span>
          {!ref_.approved && (
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Pending
            </span>
          )}
        </div>
        {ref_.verse_text && (
          <p className="text-sm italic text-stone-mid line-clamp-2">&ldquo;{ref_.verse_text}&rdquo;</p>
        )}
        {ref_.note && <p className="text-sm text-stone-mid mt-0.5 line-clamp-1">{ref_.note}</p>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {!ref_.approved && (
          <button
            onClick={() => act(() => adminUpdateReferenceApproval(ref_.id, true))}
            disabled={isPending}
            className="text-sm px-3 py-1.5 rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 font-bold transition-colors disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {ref_.approved && (
          <button
            onClick={() => act(() => adminUpdateReferenceApproval(ref_.id, false))}
            disabled={isPending}
            className="text-sm px-3 py-1.5 rounded-lg border border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600 font-semibold transition-colors disabled:opacity-50"
          >
            Unapprove
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(`Delete reference "${citation}"?`))
              act(() => adminDeleteReference(ref_.id));
          }}
          disabled={isPending}
          className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* References sub-view (flat list across all attributes)       */
/* ──────────────────────────────────────────────────────────── */
function ReferencesView({
  references,
  isPending,
  act,
}: {
  references: ReferenceWithAttr[];
  isPending: boolean;
  act: (fn: () => Promise<{ error?: string }>) => void;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [search, setSearch] = useState("");

  const pending = references.filter((r) => !r.approved).length;

  const filtered = references.filter((r) => {
    if (filter === "pending" && r.approved) return false;
    if (filter === "approved" && !r.approved) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.book.toLowerCase().includes(q) ||
      (r.verse_text?.toLowerCase().includes(q) ?? false) ||
      (r.note?.toLowerCase().includes(q) ?? false) ||
      (r.god_attributes?.name.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div>
      {pending > 0 && filter !== "approved" && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-amber-600 font-bold text-lg">{pending}</span>
          <p className="text-base text-amber-700 font-medium">
            reference{pending === 1 ? "" : "s"} waiting for approval
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search by book, verse, attribute…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <div className="flex gap-2">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ fontFamily: "var(--font-accent)" }}
              className={`text-xs px-4 py-2 rounded-lg border font-bold tracking-widest uppercase transition-colors ${
                filter === f
                  ? "bg-ink text-vellum border-ink"
                  : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
              }`}
            >
              {f}
              {f === "pending" && pending > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-stone-mid font-medium mb-4">
        {filtered.length} reference{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-mid text-sm">
          {filter === "pending" ? "No pending references — all caught up." : "No references found."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ref) => {
            const citation = formatCitation(ref);
            return (
              <div
                key={ref.id}
                className={`rounded-2xl border bg-white overflow-hidden ${
                  !ref.approved ? "border-amber-200 bg-amber-50/20" : "border-stone-edge"
                }`}
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    {/* Attribute name */}
                    {ref.god_attributes?.name && (
                      <p
                        className="text-xs font-bold tracking-widest uppercase text-gold-deep mb-1"
                        style={{ fontFamily: "var(--font-accent)" }}
                      >
                        {ref.god_attributes.name}
                      </p>
                    )}
                    {/* Citation */}
                    <p
                      className="font-bold text-ink text-lg"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {citation}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {!ref.approved && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                      {ref.submitted_by && (
                        <span className="text-sm text-stone-light">by {ref.submitted_by}</span>
                      )}
                    </div>
                    {ref.verse_text && (
                      <p className="text-sm italic text-stone-mid mt-2 line-clamp-2">
                        &ldquo;{ref.verse_text}&rdquo;
                      </p>
                    )}
                    {ref.note && (
                      <p className="text-sm text-stone-mid mt-1 line-clamp-2">{ref.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        act(() => adminUpdateReferenceApproval(ref.id, !ref.approved))
                      }
                      disabled={isPending}
                      className={`text-sm px-4 py-2 rounded-lg border font-bold transition-colors disabled:opacity-50 ${
                        ref.approved
                          ? "border-stone-edge text-stone-mid hover:border-red-300 hover:text-red-600"
                          : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      {ref.approved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete reference "${citation}"?`))
                          act(() => adminDeleteReference(ref.id));
                      }}
                      disabled={isPending}
                      className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
