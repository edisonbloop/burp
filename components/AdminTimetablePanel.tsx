"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminUpdateFacilitationTimetable,
  searchMembers,
} from "@/lib/timetable-actions";
import { TIMETABLE_DAYS } from "@/types/timetable";
import type {
  FacilitationTimetable,
  FacilitationTimetableInput,
  MemberSuggestion,
  TimetableAssignment,
  TimetableDay,
} from "@/types/timetable";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";

function FacilitatorInput({
  value,
  linked,
  onChange,
}: {
  value: string;
  linked: boolean;
  onChange: (assignment: TimetableAssignment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MemberSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleType(v: string) {
    onChange({ name: v, userId: null }); // typing = free text until a member is picked
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchMembers(v.trim());
      setSuggestions(res);
      setOpen(true);
      setLoading(false);
    }, 300);
  }

  function pick(m: MemberSuggestion) {
    onChange({ name: m.full_name, userId: m.id });
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="relative flex-1">
      <input
        value={value}
        onChange={(e) => handleType(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Start typing a member's name…"
        className={`${inputCls} ${linked ? "pr-24" : ""}`}
        autoComplete="off"
      />
      {linked && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-full bg-gold-wash text-gold-deep border border-gold-soft/50">
          ✓ Member
        </span>
      )}

      {open && (loading || suggestions.length > 0) && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-stone-edge rounded-xl shadow-lg overflow-hidden">
          {loading && suggestions.length === 0 && (
            <li className="px-4 py-2.5 text-xs text-stone-light">Searching…</li>
          )}
          {suggestions.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onMouseDown={() => pick(m)}
                className="w-full text-left px-4 py-2.5 hover:bg-gold-wash transition-colors flex items-center gap-2"
              >
                <span className="text-sm font-semibold text-ink">{m.full_name}</span>
                {m.username && (
                  <span className="text-[11px] text-stone-light">@{m.username}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminTimetablePanel({
  timetable,
}: {
  timetable: FacilitationTimetable | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  const initial = (): Record<TimetableDay, TimetableAssignment> => {
    const out = {} as Record<TimetableDay, TimetableAssignment>;
    for (const day of TIMETABLE_DAYS) {
      out[day] = {
        name: timetable?.[day] ?? "",
        userId:
          (timetable?.[`${day}_user_id` as keyof FacilitationTimetable] as string | null) ?? null,
      };
    }
    return out;
  };

  const [assignments, setAssignments] = useState<Record<TimetableDay, TimetableAssignment>>(initial);
  const [note, setNote] = useState(timetable?.note ?? "");

  function setDay(day: TimetableDay, assignment: TimetableAssignment) {
    setSavedMsg("");
    setAssignments((prev) => ({ ...prev, [day]: assignment }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSavedMsg("");
    const payload = { ...assignments, note } as unknown as FacilitationTimetableInput;
    startTransition(async () => {
      const res = await adminUpdateFacilitationTimetable(payload);
      if (res.error) {
        setError(res.error);
      } else {
        setSavedMsg(
          res.emailed
            ? `Saved — emailed ${res.emailed} member${res.emailed === 1 ? "" : "s"}.`
            : "Saved."
        );
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <p className="text-sm text-stone-mid font-sans">
        Start typing to find a registered member — pick them and they&rsquo;ll be emailed when you
        save. You can also type a plain name for non-members. Signed-in members see this on the{" "}
        <span className="font-semibold text-ink">Timetable</span> page.
      </p>

      <div className="space-y-3">
        {TIMETABLE_DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <label
              className="w-24 flex-shrink-0 text-xs font-bold tracking-widest uppercase text-stone-mid capitalize"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {day}
            </label>
            <FacilitatorInput
              value={assignments[day].name}
              linked={!!assignments[day].userId}
              onChange={(a) => setDay(day, a)}
            />
          </div>
        ))}
      </div>

      <div>
        <label
          className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Note <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => {
            setSavedMsg("");
            setNote(e.target.value);
          }}
          rows={3}
          placeholder="e.g. Thank you all for the effort, God bless 🙏💙"
          className={`${inputCls} resize-none`}
        />
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="px-8 py-3 rounded-full bg-ink hover:bg-stone text-vellum font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {pending ? "Saving…" : "Save Timetable"}
        </button>
        {savedMsg && (
          <span className="text-sm text-gold-deep flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l4 4 6-7" />
            </svg>
            {savedMsg}
          </span>
        )}
      </div>
    </form>
  );
}
