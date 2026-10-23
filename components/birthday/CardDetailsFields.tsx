"use client";

import { useState } from "react";
import type { BirthdayCardInput, Celebrant } from "@/types/birthday";
import MessageIdeas from "./MessageIdeas";
import PhotoPicker from "./PhotoPicker";
import { THEME_LIST } from "./themes";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

export const inputCls =
  "w-full bg-white border border-stone-edge rounded-2xl px-4 py-3 text-ink placeholder:text-stone-light focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold-wash transition";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="flex items-baseline justify-between gap-3 mb-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep" style={accent}>{children}</span>
      {hint && <span className="text-[11px] text-stone-light">{hint}</span>}
    </span>
  );
}

export function formatBirthday(c: Celebrant) {
  const date = new Date(`${c.next_birthday}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const when = c.days_away === 0 ? "today 🎉" : c.days_away === 1 ? "tomorrow" : `in ${c.days_away} days`;
  return `${date} · ${when}`;
}

/** The fields shared by "create a card" and "manage your card". */
export default function CardDetailsFields({
  value,
  onChange,
  onBusyChange,
  celebrants,
  onPickCelebrant,
}: {
  value: BirthdayCardInput;
  onChange: (v: BirthdayCardInput) => void;
  onBusyChange?: (busy: boolean) => void;
  /** Community birthdays to suggest while typing a name (create page only). */
  celebrants?: Celebrant[];
  onPickCelebrant?: (c: Celebrant) => void;
}) {
  const set = <K extends keyof BirthdayCardInput>(k: K, v: BirthdayCardInput[K]) => onChange({ ...value, [k]: v });
  const [suggesting, setSuggesting] = useState(false);
  const query = value.honoree_name.trim().toLowerCase();
  const matches =
    celebrants && query && !value.person_id
      ? celebrants.filter((c) => c.full_name.toLowerCase().split(/\s+/).some((part) => part.startsWith(query)) || c.full_name.toLowerCase().startsWith(query)).slice(0, 6)
      : [];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-[1fr_8rem] gap-4">
        <div className="relative">
          <label className="block">
            <Label hint={value.person_id ? "from the community list ✓" : undefined}>Who&rsquo;s celebrating?</Label>
            <input
              className={`${inputCls} text-lg`}
              style={display}
              placeholder={celebrants?.length ? "Start typing a name…" : "e.g. Grace"}
              maxLength={60}
              autoComplete="off"
              role="combobox"
              aria-controls="celebrant-options"
              aria-expanded={suggesting && matches.length > 0}
              value={value.honoree_name}
              onFocus={() => setSuggesting(true)}
              onBlur={() => setTimeout(() => setSuggesting(false), 150)}
              // Typing over a picked person unlinks them — it's someone else now.
              onChange={(e) => onChange({ ...value, honoree_name: e.target.value, person_id: null })}
            />
          </label>
          {suggesting && matches.length > 0 && (
            <ul id="celebrant-options" role="listbox" className="absolute z-20 left-0 right-0 mt-2 bg-white border border-stone-edge rounded-2xl shadow-xl overflow-hidden">
              {matches.map((c) => (
                <li key={c.person_id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onPickCelebrant?.(c);
                      setSuggesting(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gold-wash flex items-center justify-between gap-3 transition-colors"
                  >
                    <span className="font-semibold text-ink" style={display}>{c.full_name}</span>
                    <span className="text-[11px] text-stone-mid shrink-0">
                      🎂 {formatBirthday(c)}
                      {c.existing_card && " · card started"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="block">
          <Label hint="optional">Turning</Label>
          <input
            className={inputCls}
            type="number"
            min={1}
            max={130}
            placeholder="30"
            value={value.turning_age ?? ""}
            onChange={(e) => set("turning_age", e.target.value ? Number(e.target.value) : null)}
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <Label hint="optional">Birthday</Label>
          <input
            className={inputCls}
            type="date"
            value={value.birthday ?? ""}
            onChange={(e) => set("birthday", e.target.value || null)}
          />
        </label>
        <label className="block">
          <Label hint="optional">Headline</Label>
          <input
            className={inputCls}
            placeholder={`Happy Birthday, ${value.honoree_name.trim() || "Grace"}!`}
            maxLength={80}
            value={value.headline ?? ""}
            onChange={(e) => set("headline", e.target.value)}
          />
        </label>
      </div>

      <div>
        <Label hint="up to 12">Photos of them</Label>
        <PhotoPicker max={12} value={value.photo_urls} onChange={(urls) => set("photo_urls", urls)} onBusyChange={onBusyChange} />
        <p className="text-[11px] text-stone-light mt-3">The first photo is the cover. Friends can add their own photos when they sign.</p>
      </div>

      <div>
        <Label>Pick a look</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEME_LIST.map((t) => {
            const active = value.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => set("theme", t.id)}
                aria-pressed={active}
                className={`group text-left rounded-2xl overflow-hidden border-2 transition-all ${active ? "border-gold shadow-lg -translate-y-0.5" : "border-stone-edge hover:border-gold-soft"}`}
              >
                <div className="relative h-20 flex items-center justify-center" style={{ background: t.bg }}>
                  {/* mini envelope */}
                  <div className="relative w-14 h-9 rounded-[3px] shadow" style={{ background: t.envelope }}>
                    <div
                      className="absolute inset-x-0 top-0 h-5"
                      style={{ background: t.envelopeFlap, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                    />
                    <div className="absolute left-1/2 top-3 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: t.accent }} />
                  </div>
                  <div className="absolute bottom-1.5 right-2 flex gap-0.5">
                    {t.confetti.slice(0, 4).map((c) => (
                      <span key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  {active && <span className="absolute top-1.5 right-2 text-xs">✓</span>}
                </div>
                <div className="px-3 py-2 bg-white">
                  <p className="text-sm font-bold text-ink leading-tight" style={display}>{t.label}</p>
                  <p className="text-[10px] text-stone-light">{t.blurb}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_2fr] gap-4">
        <label className="block">
          <Label>Your name</Label>
          <input
            className={inputCls}
            placeholder="Who's organising?"
            maxLength={60}
            value={value.organiser_name}
            onChange={(e) => set("organiser_name", e.target.value)}
          />
        </label>
        <label className="block">
          <Label hint="optional · shown first">Your message</Label>
          <MessageIdeas name={value.honoree_name} value={value.organiser_note ?? ""} onChange={(v) => set("organiser_note", v)} />
          <textarea
            className={`${inputCls} min-h-28 resize-y`}
            placeholder="Start the card off with a few words…"
            maxLength={1500}
            value={value.organiser_note ?? ""}
            onChange={(e) => set("organiser_note", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
