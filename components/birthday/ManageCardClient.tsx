"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteBirthdayMessage, editBirthdayMessage, setBirthdayMessagesApproved, updateBirthdayCard } from "@/lib/birthday-actions";
import type { BirthdayCard, BirthdayCardInput, BirthdayMessage } from "@/types/birthday";
import CardDetailsFields from "./CardDetailsFields";
import CardLinks from "./CardLinks";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

export default function ManageCardClient({
  card,
  messages,
  manageKey,
}: {
  card: BirthdayCard;
  messages: BirthdayMessage[];
  manageKey: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<BirthdayCardInput>({
    honoree_name: card.honoree_name,
    turning_age: card.turning_age,
    birthday: card.birthday,
    headline: card.headline ?? "",
    organiser_name: card.organiser_name,
    organiser_note: card.organiser_note ?? "",
    photo_urls: card.photo_urls,
    theme: card.theme,
  });
  const [open, setOpen] = useState(card.accepting_messages);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const [listError, setListError] = useState("");
  const [pending, startTransition] = useTransition();

  function save(e?: React.FormEvent, accepting = open) {
    e?.preventDefault();
    setStatus({});
    startTransition(async () => {
      const res = await updateBirthdayCard(card.slug, manageKey, { ...form, accepting_messages: accepting });
      setStatus(res.error ? { error: res.error } : { ok: "Saved ✓" });
      if (!res.error) router.refresh();
    });
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    save(undefined, next);
  }

  const waiting = messages.filter((m) => !m.approved);
  const shown = messages.filter((m) => m.approved);

  function setApproved(ids: string[], approved: boolean) {
    setListError("");
    startTransition(async () => {
      const res = await setBirthdayMessagesApproved(card.slug, manageKey, ids, approved);
      if (res.error) setListError(res.error);
      else router.refresh();
    });
  }

  function remove(m: BirthdayMessage) {
    if (!confirm(`Remove ${m.author_name}'s message? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteBirthdayMessage(card.slug, manageKey, m.id);
      if (res.error) setListError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-5 py-12 space-y-12">
      <header className="text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-deep mb-3" style={accent}>Organiser view</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-3" style={display}>
          {card.honoree_name}&rsquo;s card
        </h1>
        <p className="text-stone-mid">
          {shown.length} on the card{waiting.length > 0 && <> · <strong className="text-gold-deep">{waiting.length} waiting for you</strong></>} ·{" "}
          <Link href={`/birthday/${card.slug}`} className="text-gold-deep underline underline-offset-2">open the card</Link>
        </p>
      </header>

      <CardLinks slug={card.slug} manageKey={manageKey} honoree={card.honoree_name} />

      <div className="flex items-center justify-between gap-4 bg-parchment-soft border border-stone-edge rounded-2xl p-5">
        <div>
          <p className="font-bold text-ink text-lg" style={display}>{open ? "Open for messages" : "Sealed"}</p>
          <p className="text-xs text-stone-mid">{open ? "Anyone with the signing link can add a message." : "No new messages can be added."}</p>
        </div>
        <button
          type="button"
          onClick={toggleOpen}
          disabled={pending}
          role="switch"
          aria-checked={open}
          className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${open ? "bg-success-earthen" : "bg-stone-light"}`}
        >
          <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${open ? "left-7" : "left-1"}`} />
        </button>
      </div>

      {listError && <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{listError}</p>}

      <section>
        <div className="flex items-end justify-between gap-4 mb-2">
          <h2 className="text-3xl font-bold text-ink" style={display}>Waiting for approval</h2>
          {waiting.length > 1 && (
            <button
              type="button"
              onClick={() => setApproved(waiting.map((m) => m.id), true)}
              disabled={pending}
              className="shrink-0 px-4 py-2 rounded-full bg-success-earthen text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-60"
              style={accent}
            >
              Approve all {waiting.length}
            </button>
          )}
        </div>
        <p className="text-xs text-stone-mid mb-5">New messages stay hidden until you approve them, so nothing appears on {card.honoree_name}&rsquo;s card without you seeing it first.</p>
        {waiting.length === 0 ? (
          <p className="text-stone-mid bg-parchment-soft border border-dashed border-stone-edge rounded-2xl p-6 text-center text-sm">
            {messages.length === 0 ? "No messages yet — share the signing link to get things going." : "All caught up ✓"}
          </p>
        ) : (
          <ul className="space-y-3">
            {waiting.map((m) => (
              <MessageRow key={m.id} m={m} slug={card.slug} manageKey={manageKey}>
                <button
                  type="button"
                  onClick={() => setApproved([m.id], true)}
                  disabled={pending}
                  className="px-4 py-2 rounded-full bg-success-earthen text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={accent}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => remove(m)}
                  disabled={pending}
                  className="px-4 py-2 rounded-full border border-stone-edge text-stone-mid text-[10px] font-bold uppercase tracking-widest hover:border-danger-earthen hover:text-danger-earthen transition-colors"
                  style={accent}
                >
                  Remove
                </button>
              </MessageRow>
            ))}
          </ul>
        )}
      </section>

      {shown.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-ink mb-5" style={display}>On the card</h2>
          <ul className="space-y-3">
            {shown.map((m) => (
              <MessageRow key={m.id} m={m} slug={card.slug} manageKey={manageKey} clamp>
                <button
                  type="button"
                  onClick={() => setApproved([m.id], false)}
                  disabled={pending}
                  className="text-[10px] font-bold uppercase tracking-widest text-stone-light hover:text-ink transition-colors"
                  style={accent}
                >
                  Hide
                </button>
                <button
                  type="button"
                  onClick={() => remove(m)}
                  disabled={pending}
                  className="text-[10px] font-bold uppercase tracking-widest text-stone-light hover:text-danger-earthen transition-colors"
                  style={accent}
                >
                  Remove
                </button>
              </MessageRow>
            ))}
          </ul>
        </section>
      )}

      <form onSubmit={save} className="bg-white/70 border border-stone-edge rounded-[2rem] p-6 sm:p-10 shadow-sm">
        <h2 className="text-3xl font-bold text-ink mb-8" style={display}>Card details</h2>
        <CardDetailsFields value={form} onChange={setForm} onBusyChange={setBusy} slug={card.slug} />
        {status.error && <p className="mt-6 text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{status.error}</p>}
        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={pending || busy}
            className="flex-1 py-4 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-[0.25em] hover:bg-stone transition-colors disabled:opacity-60"
            style={accent}
          >
            {busy ? "Uploading photos…" : pending ? "Saving…" : "Save changes"}
          </button>
          {status.ok && <span className="text-sm text-success-earthen">{status.ok}</span>}
        </div>
      </form>
    </div>
  );
}

/** One message in the organiser's list, with in-place editing. */
function MessageRow({
  m,
  slug,
  manageKey,
  clamp,
  children,
}: {
  m: BirthdayMessage;
  slug: string;
  manageKey: string;
  clamp?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(m.author_name);
  const [text, setText] = useState(m.message);
  const [dropPhoto, setDropPhoto] = useState(false);
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();

  function cancel() {
    setName(m.author_name);
    setText(m.message);
    setDropPhoto(false);
    setError("");
    setEditing(false);
  }

  function save() {
    setError("");
    startSaving(async () => {
      const res = await editBirthdayMessage(slug, manageKey, m.id, { author_name: name, message: text, remove_photo: dropPhoto });
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <li className="bg-white border-2 border-gold rounded-2xl p-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          aria-label="Name"
          className="w-full bg-parchment-soft border border-stone-edge rounded-xl px-3 py-2 font-bold text-ink focus:outline-none focus:border-gold"
          style={display}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1500}
          aria-label="Message"
          className="w-full min-h-32 bg-parchment-soft border border-stone-edge rounded-xl px-3 py-2 text-sm text-ink resize-y focus:outline-none focus:border-gold"
        />
        {m.photo_url && (
          <label className="flex items-center gap-3 text-sm text-stone-mid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.photo_url} alt="" className={`w-12 h-12 rounded-lg object-cover ${dropPhoto ? "opacity-30" : ""}`} />
            <input type="checkbox" checked={dropPhoto} onChange={(e) => setDropPhoto(e.target.checked)} />
            Remove the photo
          </label>
        )}
        {error && <p className="text-sm text-danger-earthen">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={cancel}
            className="px-4 py-2 rounded-full border border-stone-edge text-stone-mid text-[10px] font-bold uppercase tracking-widest hover:text-ink transition-colors"
            style={accent}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-full bg-ink text-vellum text-[10px] font-bold uppercase tracking-widest hover:bg-stone transition-colors disabled:opacity-60"
            style={accent}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col sm:flex-row gap-4 bg-white border border-stone-edge rounded-2xl p-4">
      {m.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.photo_url} alt="" className={`rounded-lg object-cover shrink-0 ${clamp ? "w-16 h-16" : "w-full sm:w-28 h-40 sm:h-28"}`} />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink" style={display}>{m.author_name}</p>
        <p className={`text-sm text-stone-mid whitespace-pre-line ${clamp ? "line-clamp-3" : ""}`}>{m.message}</p>
      </div>
      <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
        {children}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={clamp
            ? "text-[10px] font-bold uppercase tracking-widest text-stone-light hover:text-ink transition-colors"
            : "px-4 py-2 rounded-full border border-stone-edge text-stone-mid text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors"}
          style={accent}
        >
          Edit
        </button>
      </div>
    </li>
  );
}
