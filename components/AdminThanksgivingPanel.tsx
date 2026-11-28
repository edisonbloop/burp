"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminAddThanksgivingGuest,
  adminDeleteThanksgivingRsvp,
  adminSetThanksgivingOpen,
  adminUpdateThanksgivingRsvp,
} from "@/lib/thanksgiving-actions";
import { THANKSGIVING_NOTE_MAX, type AdminThanksgivingRsvp } from "@/types/thanksgiving";

const accent = { fontFamily: "var(--font-accent)" };

/**
 * Thanksgiving potluck: who's coming, who writes for whom, the notes, and a
 * link to the printable place cards.
 */
export default function AdminThanksgivingPanel({ rsvps, open }: { rsvps: AdminThanksgivingRsvp[]; open: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; field: "note" | "extra_note" | "name"; value: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const byId = new Map(rsvps.map((r) => [r.id, r]));
  const writersFor = (id: string) => rsvps.filter((r) => r.target_id === id);
  const noteCount = (r: AdminThanksgivingRsvp) => writersFor(r.id).filter((w) => w.note).length + (r.extra_note ? 1 : 0);
  const written = rsvps.filter((r) => r.note).length;
  const withoutNote = rsvps.filter((r) => noteCount(r) === 0);

  function run(fn: () => Promise<{ error?: string }>, after?: () => void) {
    setError("");
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        after?.();
        router.refresh();
      }
    });
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/thanksgiving?me=${token}`);
      setCopied(token);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div className="flex flex-wrap gap-3">
          {[
            ["RSVPs", rsvps.length],
            ["Notes written", written],
            ["Cards without a note", withoutNote.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-stone-edge bg-white px-4 py-2.5 text-center min-w-28">
              <div className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
                {value}
              </div>
              <div className="text-[9px] font-bold tracking-widest uppercase text-stone-light" style={accent}>
                {label}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/thanksgiving" target="_blank" className="rounded-xl border border-stone-edge bg-white px-4 py-2.5 text-sm font-semibold text-ink">
            Open RSVP page ↗
          </a>
          <button
            disabled={pending}
            onClick={() => run(() => adminSetThanksgivingOpen(!open))}
            className="rounded-xl border border-stone-edge bg-white px-4 py-2.5 text-sm font-semibold text-ink"
          >
            {open ? "Close RSVPs" : "Reopen RSVPs"}
          </button>
          <a href="/thanksgiving/print" target="_blank" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ background: "#7A1F2E" }}>
            Generate place cards ↗
          </a>
        </div>
      </div>

      <p className="text-xs text-stone-mid">
        RSVPs are <strong>{open ? "open" : "closed"}</strong>. Everyone is matched automatically as they RSVP. Notes are
        anonymous to guests, but you can see and edit them here. Use “Card note” to add a note yourself for anyone whose card
        has none.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => adminAddThanksgivingGuest(newName), () => setNewName(""));
        }}
        className="flex gap-2 max-w-md"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a guest who can't RSVP themselves"
          className="flex-1 bg-white border border-stone-edge rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
        />
        <button disabled={pending || newName.trim().length < 2} className="rounded-xl bg-ink text-vellum px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
          Add
        </button>
      </form>

      {error && <p className="text-sm text-danger-earthen">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-stone-edge bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-light border-b border-stone-edge" style={accent}>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Writes for</th>
              <th className="px-4 py-3 min-w-64">Their note</th>
              <th className="px-4 py-3">On their card</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => {
              const target = r.target_id ? byId.get(r.target_id) : null;
              const count = noteCount(r);
              const isEditing = (f: "note" | "extra_note" | "name") => editing?.id === r.id && editing.field === f;
              return (
                <tr key={r.id} className="border-b border-stone-edge/60 align-top">
                  <td className="px-4 py-3">
                    {isEditing("name") ? (
                      <InlineEdit
                        value={editing!.value}
                        max={40}
                        onChange={(v) => setEditing({ ...editing!, value: v })}
                        onCancel={() => setEditing(null)}
                        onSave={() => run(() => adminUpdateThanksgivingRsvp(r.id, { name: editing!.value }), () => setEditing(null))}
                      />
                    ) : (
                      <button onClick={() => setEditing({ id: r.id, field: "name", value: r.name })} className="font-semibold text-ink text-left hover:underline">
                        {r.name}
                      </button>
                    )}
                    {r.dish && <div className="text-xs text-stone-mid mt-0.5">🍽 {r.dish}</div>}
                  </td>
                  <td className="px-4 py-3 text-ink">{target?.name ?? <span className="text-stone-light italic">Waiting for a match</span>}</td>
                  <td className="px-4 py-3">
                    {isEditing("note") ? (
                      <InlineEdit
                        value={editing!.value}
                        max={THANKSGIVING_NOTE_MAX}
                        multiline
                        onChange={(v) => setEditing({ ...editing!, value: v })}
                        onCancel={() => setEditing(null)}
                        onSave={() => run(() => adminUpdateThanksgivingRsvp(r.id, { note: editing!.value }), () => setEditing(null))}
                      />
                    ) : r.note ? (
                      <button onClick={() => setEditing({ id: r.id, field: "note", value: r.note ?? "" })} className="text-left text-ink hover:underline">
                        “{r.note}”
                      </button>
                    ) : (
                      <span className="text-stone-light italic">{target ? "Not written yet" : "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${count ? "text-success-earthen" : "text-amber-700"}`}>
                      {count ? `${count} note${count > 1 ? "s" : ""}` : "No note yet"}
                    </span>
                    {isEditing("extra_note") ? (
                      <div className="mt-1">
                        <InlineEdit
                          value={editing!.value}
                          max={THANKSGIVING_NOTE_MAX}
                          multiline
                          onChange={(v) => setEditing({ ...editing!, value: v })}
                          onCancel={() => setEditing(null)}
                          onSave={() => run(() => adminUpdateThanksgivingRsvp(r.id, { extra_note: editing!.value }), () => setEditing(null))}
                        />
                      </div>
                    ) : (
                      <div className="mt-1">
                        {r.extra_note && <div className="text-xs text-ink mb-1">Card note: “{r.extra_note}”</div>}
                        <button
                          onClick={() => setEditing({ id: r.id, field: "extra_note", value: r.extra_note ?? "" })}
                          className="text-xs text-gold-deep hover:text-gold underline underline-offset-2"
                        >
                          {r.extra_note ? "Edit card note" : "+ Card note"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button onClick={() => copy(r.token)} className="text-xs text-stone-mid hover:text-ink mr-3">
                      {copied === r.token ? "Copied" : "Copy link"}
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`Remove ${r.name}? Whoever was writing for them will get someone new.`)) run(() => adminDeleteThanksgivingRsvp(r.id));
                      }}
                      className="text-xs text-danger-earthen hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {!rsvps.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-mid">
                  No RSVPs yet. Share <strong>/thanksgiving</strong> with the group.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineEdit({
  value,
  max,
  multiline,
  onChange,
  onSave,
  onCancel,
}: {
  value: string;
  max: number;
  multiline?: boolean;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const cls = "w-full bg-parchment-soft border border-stone-edge rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-gold";
  return (
    <div className="space-y-1.5">
      {multiline ? (
        <textarea autoFocus rows={2} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} />
      ) : (
        <input autoFocus maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      <div className="flex gap-2 text-xs">
        <button onClick={onSave} className="font-semibold text-ink hover:underline">
          Save
        </button>
        <button onClick={onCancel} className="text-stone-mid hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
