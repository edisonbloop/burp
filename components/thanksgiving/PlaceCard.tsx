/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

/**
 * The printed place card, in two panels: the front (logo + name) and the
 * back (an anonymous appreciation note). Everything is sized in container
 * units, so the same panel works as a small on-screen preview and at its
 * printed size (3.75in × 2.25in).
 */

export const TG = {
  wine: "#7A1F2E",
  gold: "#C48A35",
  cream: "#FCF7EE",
  script: "var(--font-tg-script), cursive",
};

const LEAF_COLORS = ["#E2662B", "#C2452D", "#8E2F45", "#F0A04B", "#B5532B", "#E9B26A", "#9C3B52"];

/** One almond-shaped leaf with a midrib and a couple of veins. */
function Leaf({ x, y, r, s, c }: { x: number; y: number; r: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C 10 -13 34 -14 46 0 C 34 14 10 13 0 0 Z" fill={c} />
      <path d="M0 0 L 44 0 M14 0 L 22 -6 M14 0 L 22 6 M26 0 L 33 -5 M26 0 L 33 5" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" fill="none" />
    </g>
  );
}

/** A sprig of autumn leaves and berries for a card corner (drawn for top-left). */
function Sprig({ style, seed = 0 }: { style: CSSProperties; seed?: number }) {
  const col = (i: number) => LEAF_COLORS[(i + seed) % LEAF_COLORS.length];
  const leaves = [
    { x: 6, y: 8, r: 38, s: 1.25 },
    { x: 8, y: 10, r: 72, s: 1.1 },
    { x: 30, y: 26, r: 10, s: 0.95 },
    { x: 30, y: 26, r: 60, s: 0.85 },
    { x: 60, y: 36, r: -8, s: 0.8 },
    { x: 60, y: 36, r: 40, s: 0.7 },
    { x: 18, y: 44, r: 95, s: 0.9 },
    { x: 18, y: 70, r: 80, s: 0.7 },
    { x: 92, y: 40, r: 5, s: 0.55 },
  ];
  const berries = [
    [48, 52], [55, 58], [44, 62], [82, 52], [88, 58], [30, 80], [36, 88],
  ];
  return (
    <svg viewBox="0 0 130 120" style={{ position: "absolute", pointerEvents: "none", ...style }} aria-hidden>
      <path d="M2 4 C 30 24 70 34 120 42 M8 10 C 14 40 18 70 24 100 M40 30 C 46 46 46 58 44 66 M76 40 C 82 48 86 54 88 60" stroke="#8A5A2B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <Leaf key={i} {...l} c={col(i)} />
      ))}
      {berries.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.6" fill="#D49A3E" />
          <circle cx={x - 1.1} cy={y - 1.1} r="1.1" fill="#fff" opacity="0.55" />
        </g>
      ))}
    </svg>
  );
}

function Divider({ width = "46cqw" }: { width?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2cqw", width, margin: "0 auto" }}>
      <span style={{ flex: 1, height: "0.35cqw", background: TG.gold, opacity: 0.8 }} />
      <svg viewBox="0 0 24 22" style={{ width: "3.6cqw" }} aria-hidden>
        <path d="M12 21 C 4 14 0 10 0 6 C 0 2.6 2.6 0 6 0 C 8.4 0 10.6 1.4 12 3.4 C 13.4 1.4 15.6 0 18 0 C 21.4 0 24 2.6 24 6 C 24 10 20 14 12 21 Z" fill={TG.gold} />
      </svg>
      <span style={{ flex: 1, height: "0.35cqw", background: TG.gold, opacity: 0.8 }} />
    </div>
  );
}

function Panel({ children, seed }: { children: React.ReactNode; seed: number }) {
  return (
    <div style={{ containerType: "inline-size", width: "100%", aspectRatio: "5 / 3", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: TG.cream,
          overflow: "hidden",
          color: TG.wine,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <div style={{ position: "absolute", inset: "3.2cqw", border: `0.3cqw solid ${TG.gold}`, opacity: 0.85 }} />
        <Sprig seed={seed} style={{ left: "-1cqw", top: "-1cqw", width: "27cqw" }} />
        <Sprig seed={seed + 3} style={{ right: "-1cqw", bottom: "-1cqw", width: "27cqw", transform: "rotate(180deg)" }} />
        <div
          style={{
            position: "absolute",
            inset: "6cqw 10cqw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function nameSize(name: string) {
  const n = name.length;
  if (n <= 10) return 15;
  if (n <= 14) return 12.5;
  if (n <= 18) return 10.5;
  if (n <= 24) return 8.5;
  return 7;
}

export function PlaceCardFront({ name }: { name: string }) {
  return (
    <Panel seed={0}>
      {/* The logo file has wide cream margins: crop them and blend its background into the card */}
      <div style={{ width: "40cqw", height: "13cqw", overflow: "hidden", flexShrink: 0 }}>
        <img
          src="/logomain.png"
          alt="BURP"
          style={{
            width: "100%",
            marginTop: "-3.4cqw",
            mixBlendMode: "multiply",
            filter: "brightness(1.07) contrast(1.15)",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: TG.script,
          fontSize: `${nameSize(name)}cqw`,
          lineHeight: 1.15,
          padding: "0 2cqw",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
      <div style={{ marginTop: "1.5cqw", width: "100%" }}>
        <Divider width="56cqw" />
      </div>
      <div
        style={{
          fontFamily: "var(--font-accent)",
          fontSize: "2.6cqw",
          letterSpacing: "0.32em",
          marginTop: "1.6cqw",
          fontWeight: 600,
        }}
      >
        THANKSGIVING POTLUCK
      </div>
    </Panel>
  );
}

export function PlaceCardBack({ notes, placeholder }: { notes: string[]; placeholder?: string }) {
  const shown = notes.length ? notes : placeholder ? [placeholder] : [];
  const total = shown.join(" ").length;
  const noteSize = total > 220 ? 3 : total > 140 ? 3.4 : total > 80 ? 3.9 : 4.4;
  return (
    <Panel seed={2}>
      <div style={{ fontFamily: TG.script, fontSize: "8cqw", lineHeight: 1.1 }}>You are appreciated!</div>
      <div style={{ margin: "1.6cqw 0 2cqw", width: "100%" }}>
        <Divider width="34cqw" />
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: `${noteSize}cqw`,
          lineHeight: 1.3,
          fontWeight: 500,
          color: "#4A1820",
          opacity: notes.length ? 1 : 0.45,
          fontStyle: notes.length ? "normal" : "italic",
          display: "flex",
          flexDirection: "column",
          gap: "1.4cqw",
          maxWidth: "70cqw",
        }}
      >
        {shown.map((n, i) => (
          <p key={i} style={{ margin: 0 }}>
            {n}
          </p>
        ))}
      </div>
      <div style={{ fontFamily: TG.script, fontSize: "5.6cqw", marginTop: "2.4cqw" }}>Happy Thanksgiving!</div>
    </Panel>
  );
}
