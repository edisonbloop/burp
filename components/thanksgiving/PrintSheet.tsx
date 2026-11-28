"use client";

import { useState } from "react";
import Link from "next/link";
import type { PlaceCardData } from "@/types/thanksgiving";
import { PlaceCardBack, PlaceCardFront } from "./PlaceCard";

/**
 * Printable place cards. "Tent" puts the note panel (upside down) above the
 * name panel, so each card folds in half and stands on the plate: name facing
 * the table, note facing the person sitting there. "Duplex" prints fronts on
 * one page and the matching backs (mirrored) on the next, for double-sided
 * printing on card stock.
 */

const PANEL_W = "3.75in";
const PER_PAGE = { tent: 4, duplex: 8 };

function chunk<T>(arr: T[], n: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export default function PrintSheet({ cards }: { cards: PlaceCardData[] }) {
  const [layout, setLayout] = useState<"tent" | "duplex">("tent");
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);
  const missing = cards.filter((c) => !c.notes.length);
  const shown = onlyWithNotes ? cards.filter((c) => c.notes.length) : cards;
  const pages = chunk(shown, PER_PAGE[layout]);

  return (
    <div className="tg-print-root bg-[#e9e4da] min-h-screen">
      <style>{`
        @page { size: auto; margin: 0.3in; }
        @media print {
          .tg-no-print { display: none !important; }
          .tg-print-root { background: white !important; }
          .tg-page { box-shadow: none !important; margin: 0 !important; break-after: page; }
          .tg-page:last-child { break-after: auto; }
          header, nav { display: none !important; }
        }
      `}</style>

      <div className="tg-no-print sticky top-0 z-10 bg-white border-b border-stone-edge">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-stone-mid hover:text-ink">
              ← Admin
            </Link>
            <span className="font-semibold text-ink">
              {shown.length} place card{shown.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as "tent" | "duplex")}
              className="border border-stone-edge rounded-lg px-3 py-2 bg-white"
            >
              <option value="tent">Fold-over tent cards (4 per page)</option>
              <option value="duplex">Double-sided flat cards (8 per page)</option>
            </select>
            <label className="flex items-center gap-1.5 text-stone-mid">
              <input type="checkbox" checked={onlyWithNotes} onChange={(e) => setOnlyWithNotes(e.target.checked)} />
              Only cards with a note
            </label>
            <button onClick={() => window.print()} className="rounded-lg bg-ink text-vellum px-4 py-2 font-semibold">
              Print
            </button>
          </div>
        </div>
        {missing.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 pb-3 text-xs text-amber-800">
            {missing.length} {missing.length === 1 ? "card has" : "cards have"} no note yet:{" "}
            {missing.map((c) => c.name).join(", ")}. Add one from the Admin → Thanksgiving tab, or they’ll print with a general
            message.
          </div>
        )}
        <p className="max-w-5xl mx-auto px-4 pb-3 text-[11px] text-stone-light">
          {layout === "tent"
            ? "Print at 100% scale (turn off “fit to page”). Cut on the dashed lines and fold along the dotted line."
            : "Print double-sided, flipping on the long edge, at 100% scale. Cut along the card edges."}
        </p>
      </div>

      <div className="py-8 flex flex-col items-center gap-8">
        {pages.map((page, pi) =>
          layout === "tent" ? (
            <div key={pi} className="tg-page bg-white shadow-lg" style={{ display: "grid", gridTemplateColumns: `repeat(2, ${PANEL_W})`, gap: "0.1in" }}>
              {page.map((c) => (
                <div key={c.id} style={{ width: PANEL_W, outline: "1px dashed #bbb", breakInside: "avoid" }}>
                  <div style={{ transform: "rotate(180deg)" }}>
                    <PlaceCardBack notes={c.notes.length ? c.notes : [fallback(c.name)]} />
                  </div>
                  <div style={{ borderTop: "1px dotted #999" }} />
                  <PlaceCardFront name={c.name} />
                </div>
              ))}
            </div>
          ) : (
            [
              <DuplexPage key={`${pi}f`} cards={page} side="front" />,
              <DuplexPage key={`${pi}b`} cards={page} side="back" />,
            ]
          )
        )}
        {!shown.length && <p className="text-stone-mid text-sm">No RSVPs yet.</p>}
      </div>
    </div>
  );
}

function fallback(name: string) {
  return `We’re so thankful for you, ${name.split(" ")[0]}, and so glad you’re here.`;
}

function DuplexPage({ cards, side }: { cards: PlaceCardData[]; side: "front" | "back" }) {
  // Backs are mirrored left↔right so each lines up with its front when flipped on the long edge.
  const cells: (PlaceCardData | null)[] = [...cards, ...Array(PER_PAGE.duplex - cards.length).fill(null)];
  const ordered = side === "front" ? cells : chunk(cells, 2).flatMap(([a, b]) => [b, a]);
  return (
    <div className="tg-page bg-white shadow-lg" style={{ display: "grid", gridTemplateColumns: `repeat(2, ${PANEL_W})`, gap: "0.1in" }}>
      {ordered.map((c, i) => (
        <div key={i} style={{ width: PANEL_W, outline: c ? "1px dashed #ccc" : "none", breakInside: "avoid" }}>
          {c ? (
            side === "front" ? (
              <PlaceCardFront name={c.name} />
            ) : (
              <PlaceCardBack notes={c.notes.length ? c.notes : [fallback(c.name)]} />
            )
          ) : (
            <div style={{ aspectRatio: "5 / 3" }} />
          )}
        </div>
      ))}
    </div>
  );
}
