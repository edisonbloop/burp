"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  bulkImportPeople,
  createPerson,
  deletePerson,
  linkPersonToAccount,
  updatePerson,
} from "@/lib/crm-actions";
import { searchMembers } from "@/lib/timetable-actions";
import { MONTH_NAMES, PERSON_STATUSES } from "@/types/crm";
import type { Person, PersonFormData, PersonStatus } from "@/types/crm";
import type { MemberSuggestion } from "@/types/timetable";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm";
const labelCls = "block text-[10px] font-bold tracking-widest uppercase text-stone-mid mb-1.5";
const accent = { fontFamily: "var(--font-accent)" };

const STATUS_STYLES: Record<PersonStatus, { bg: string; text: string }> = {
  active: { bg: "bg-green-50", text: "text-success-earthen" },
  semi_active: { bg: "bg-blue-50", text: "text-info-earthen" },
  occasional: { bg: "bg-amber-50", text: "text-amber-700" },
  inactive: { bg: "bg-stone-edge/30", text: "text-stone-mid" },
};

function emptyForm(): PersonFormData {
  return {
    full_name: "",
    birthday_month: undefined,
    birthday_day: undefined,
    phone: "",
    email: "",
    notes: "",
    status: "active",
    secret_santa_opt_out: false,
  };
}

function AccountLinkPicker({
  person,
  onLinked,
}: {
  person: Person;
  onLinked: () => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MemberSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleType(v: string) {
    setQuery(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const res = await searchMembers(v.trim());
      setSuggestions(res);
      setOpen(true);
    }, 300);
  }

  function link(m: MemberSuggestion) {
    startTransition(async () => {
      await linkPersonToAccount(person.id, m.id);
      onLinked();
    });
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  }

  function unlink() {
    startTransition(async () => {
      await linkPersonToAccount(person.id, null);
      onLinked();
    });
  }

  if (person.linked_user_id) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-gold-wash text-gold-deep border border-gold-soft/50">
          ✓ Linked to a BURP account
        </span>
        <button
          type="button"
          onClick={unlink}
          disabled={pending}
          className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wider disabled:opacity-50"
        >
          Unlink
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => handleType(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search for their BURP account by name…"
        className={inputCls}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-stone-edge rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onMouseDown={() => link(m)}
                className="w-full text-left px-4 py-2.5 hover:bg-gold-wash transition-colors flex items-center gap-2"
              >
                <span className="text-sm font-semibold text-ink">{m.full_name}</span>
                {m.username && <span className="text-[11px] text-stone-light">@{m.username}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PersonForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: PersonFormData;
  onSave: (data: PersonFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={accent}>Full Name *</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            className={inputCls}
            placeholder="e.g. Benjamin"
          />
        </div>
        <div>
          <label className={labelCls} style={accent}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PersonStatus }))}
            className={inputCls}
          >
            {PERSON_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={accent}>Birthday Month</label>
          <select
            value={form.birthday_month ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, birthday_month: e.target.value ? Number(e.target.value) : undefined }))}
            className={inputCls}
          >
            <option value="">—</option>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} style={accent}>Birthday Day</label>
          <input
            type="number"
            min={1}
            max={31}
            value={form.birthday_day ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, birthday_day: e.target.value ? Number(e.target.value) : undefined }))}
            className={inputCls}
            placeholder="e.g. 9"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={accent}>Phone <span className="normal-case font-normal text-stone-light">(optional)</span></label>
          <input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} style={accent}>Email <span className="normal-case font-normal text-stone-light">(optional)</span></label>
          <input value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} style={accent}>Notes <span className="normal-case font-normal text-stone-light">(interests, gift ideas, context…)</span></label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.secret_santa_opt_out ?? false}
          onChange={(e) => setForm((f) => ({ ...f, secret_santa_opt_out: e.target.checked }))}
          className="w-4 h-4 accent-gold"
        />
        <span className="text-xs text-stone-mid">Opt out of Secret Santa</span>
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          className="px-5 py-2.5 rounded-xl bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider"
          style={accent}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-stone-edge text-stone hover:text-ink text-xs font-bold uppercase tracking-wider"
          style={accent}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCrmPanel({ people }: { people: Person[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<PersonStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<string>("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(q) ||
        (p.notes?.toLowerCase().includes(q) ?? false) ||
        (p.phone?.toLowerCase().includes(q) ?? false) ||
        (p.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [people, statusFilter, search]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: people.length };
    for (const s of PERSON_STATUSES) out[s.value] = people.filter((p) => p.status === s.value).length;
    return out;
  }, [people]);

  function act(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function birthdayLabel(p: Person) {
    if (!p.birthday_month || !p.birthday_day) return null;
    return `${MONTH_NAMES[p.birthday_month - 1].slice(0, 3)} ${p.birthday_day}`;
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 font-medium">{error}</p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search by name, phone, email, notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { setAdding((v) => !v); setShowImport(false); }}
            className="px-4 py-2 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink text-xs font-bold uppercase tracking-wider"
            style={accent}
          >
            {adding ? "Cancel" : "+ Add Person"}
          </button>
          <button
            onClick={() => { setShowImport((v) => !v); setAdding(false); }}
            className="px-4 py-2 rounded-lg border border-stone-edge text-stone-mid hover:border-gold hover:text-ink text-xs font-bold uppercase tracking-wider"
            style={accent}
          >
            {showImport ? "Cancel" : "Bulk Import"}
          </button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setStatusFilter("all")}
          className={`text-xs px-4 py-2 rounded-lg border font-bold tracking-widest uppercase transition-colors ${
            statusFilter === "all" ? "bg-ink text-vellum border-ink" : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
          }`}
          style={accent}
        >
          All <span className="ml-1 opacity-70">{counts.all}</span>
        </button>
        {PERSON_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`text-xs px-4 py-2 rounded-lg border font-bold tracking-widest uppercase transition-colors ${
              statusFilter === s.value ? "bg-ink text-vellum border-ink" : "border-stone-edge text-stone-mid hover:border-gold hover:text-ink"
            }`}
            style={accent}
          >
            {s.label} <span className="ml-1 opacity-70">{counts[s.value]}</span>
          </button>
        ))}
      </div>

      {/* Bulk import */}
      {showImport && (
        <div className="mb-6 p-5 rounded-2xl border border-stone-edge bg-parchment-soft space-y-3">
          <p className="text-xs text-stone-mid">
            Paste lines like <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">1. Benjamin — January 9</code>. Existing names are skipped automatically.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={8}
            placeholder="1. Benjamin — January 9&#10;2. Neubeck - January 10&#10;..."
            className={`${inputCls} resize-none font-mono text-xs`}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setError("");
                startTransition(async () => {
                  const res = await bulkImportPeople(importText);
                  if (res.error) {
                    setError(res.error);
                    return;
                  }
                  setImportResult(
                    `Imported ${res.imported}. Skipped ${res.skippedDuplicates.length} duplicate(s)` +
                      (res.unparsedLines.length ? `, couldn't parse ${res.unparsedLines.length} line(s).` : ".")
                  );
                  setImportText("");
                  router.refresh();
                });
              }}
              disabled={!importText.trim()}
              className="px-5 py-2.5 rounded-xl bg-ink hover:bg-stone text-vellum text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              style={accent}
            >
              Import
            </button>
            {importResult && <span className="text-xs text-gold-deep font-medium">{importResult}</span>}
          </div>
        </div>
      )}

      {/* Add person */}
      {adding && (
        <div className="mb-6 p-5 rounded-2xl border border-stone-edge bg-white">
          <PersonForm
            initial={emptyForm()}
            onCancel={() => setAdding(false)}
            onSave={(data) => {
              act(() => createPerson(data));
              setAdding(false);
            }}
          />
        </div>
      )}

      <p className="text-sm text-stone-mid mb-4 font-medium">
        {filtered.length} of {people.length} people
      </p>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((p) => {
          const style = STATUS_STYLES[p.status];
          const bday = birthdayLabel(p);
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} className="rounded-2xl border border-stone-edge bg-white overflow-hidden">
              <div
                className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-parchment-soft/50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-semibold text-ink truncate">{p.full_name}</span>
                  {bday && <span className="text-xs text-stone-light font-mono flex-shrink-0">🎂 {bday}</span>}
                  <span
                    className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${style.bg} ${style.text}`}
                    style={accent}
                  >
                    {PERSON_STATUSES.find((s) => s.value === p.status)?.label}
                  </span>
                  {p.linked_user_id && (
                    <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-gold-wash text-gold-deep flex-shrink-0">
                      Linked
                    </span>
                  )}
                  {p.secret_santa_opt_out && (
                    <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-stone-edge/30 text-stone-mid flex-shrink-0">
                      Opted Out
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${p.full_name}? This cannot be undone.`)) act(() => deletePerson(p.id));
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider flex-shrink-0"
                  style={accent}
                >
                  Delete
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-stone-edge/50 p-5 bg-parchment-soft space-y-5">
                  <PersonForm
                    initial={{
                      full_name: p.full_name,
                      birthday_month: p.birthday_month ?? undefined,
                      birthday_day: p.birthday_day ?? undefined,
                      phone: p.phone ?? "",
                      email: p.email ?? "",
                      notes: p.notes ?? "",
                      status: p.status,
                      secret_santa_opt_out: p.secret_santa_opt_out,
                    }}
                    onCancel={() => setExpanded(null)}
                    onSave={(data) => {
                      act(() => updatePerson(p.id, data));
                      setExpanded(null);
                    }}
                  />
                  <div className="pt-4 border-t border-stone-edge/40">
                    <label className={labelCls} style={accent}>BURP Account Link</label>
                    <AccountLinkPicker person={p} onLinked={() => router.refresh()} />
                    <p className="text-[10px] text-stone-light mt-1.5">
                      Linking lets this person sign in and pick their own Secret Santa.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-mid text-sm italic">No one matches this filter.</div>
        )}
      </div>
    </div>
  );
}
