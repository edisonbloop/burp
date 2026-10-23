"use client";

import { useState } from "react";
import { IDEA_KINDS, pickIdea, type IdeaKind } from "./wishes";

const accent = { fontFamily: "var(--font-accent)" };

/**
 * "Need words?" chips. Clicking one fills the message with a suggestion
 * (clicking again shuffles to another). If they've already written something
 * of their own, the suggestion is added below instead of replacing it.
 */
export default function MessageIdeas({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [last, setLast] = useState<string | null>(null);

  function use(kind: IdeaKind) {
    const idea = pickIdea(kind, name, last ?? undefined);
    // Swap out an untouched suggestion; never overwrite their own words.
    const replacing = !value.trim() || value === last;
    onChange((replacing ? idea : `${value.trimEnd()}\n\n${idea}`).slice(0, 1500));
    setLast(replacing ? idea : null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-light mr-1" style={accent}>Need words?</span>
      {IDEA_KINDS.map((k) => (
        <button
          key={k.id}
          type="button"
          onClick={() => use(k.id)}
          className="text-[11px] px-3 py-1.5 rounded-full bg-gold-wash text-gold-deep hover:bg-gold-glow transition-colors"
        >
          {k.emoji} {k.label}
        </button>
      ))}
      {last && value === last && <span className="text-[11px] text-stone-light">Tap again to shuffle · edit it to make it yours</span>}
    </div>
  );
}
