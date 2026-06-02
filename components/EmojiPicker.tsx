"use client";

import { useEffect, useRef, useState } from "react";

const CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: ["😊","😂","🥹","😭","😍","🥰","😇","🤩","😎","🤔","🙄","😅","😬","😴","🤯","😤","😢","😁","😆","🥲","😏","😌","🥺","😻"],
  },
  {
    label: "Hands",
    emojis: ["🙏","👏","🙌","🤝","💪","👍","👎","✌️","🤞","🫶","💅","👋","🫂","🤲","🫴","🤌","☝️","✋","👐","🫳"],
  },
  {
    label: "Hearts",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💕","💞","💓","💗","💖","💝","💘","❤️‍🔥","❤️‍🩹","💟","♥️"],
  },
  {
    label: "Faith",
    emojis: ["✝️","🕊️","📖","🙏","⛪","🕯️","🌿","⭐","🌟","✨","🌈","🕍","🫧","🌾","🍷","🥛","📜","🗺️","⛰️","🌅"],
  },
  {
    label: "Nature",
    emojis: ["🌸","🌺","🌻","🌹","🌷","🪷","🍃","🌿","🍀","☀️","🌙","⭐","🌊","🔥","💧","🌱","🌳","🦋","🐦","🕊️"],
  },
  {
    label: "Objects",
    emojis: ["🎉","🎊","🎵","🎶","💡","📚","📝","✏️","🖊️","💬","📢","🔔","🎁","🏆","🥇","🎯","⚡","🌠","💎","🔑"],
  },
];

interface Props {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Add emoji"
        className={`w-8 h-8 flex items-center justify-center rounded-xl text-base transition-colors ${
          open ? "bg-gold-wash text-gold-deep" : "text-stone-light hover:text-stone-mid hover:bg-parchment-deep"
        }`}
      >
        😊
      </button>

      {open && (
        <div className="absolute bottom-10 left-0 z-50 w-72 bg-white border border-stone-edge rounded-2xl shadow-xl overflow-hidden">
          {/* Category tabs */}
          <div className="flex border-b border-stone-edge overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setTab(i)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-semibold transition-colors ${
                  tab === i
                    ? "text-gold-deep border-b-2 border-gold bg-gold-wash"
                    : "text-stone-light hover:text-stone-mid"
                }`}
              >
                {CATEGORIES[i].emojis[0]}
              </button>
            ))}
          </div>

          {/* Label */}
          <div className="px-3 pt-2 pb-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
              {CATEGORIES[tab].label}
            </p>
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0 px-2 pb-3">
            {CATEGORIES[tab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onSelect(emoji); setOpen(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-parchment-soft transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
