"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteBirthdayMessage, updateBirthdayCard } from "@/lib/birthday-actions";
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

  function remove(m: BirthdayMessage) {
    if (!confirm(`Remove ${m.author_name}'s message? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteBirthdayMessage(card.slug, manageKey, m.id);
      if (res.error) setStatus({ error: res.error });
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
          {messages.length} {messages.length === 1 ? "message" : "messages"} so far ·{" "}
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

      <section>
        <h2 className="text-3xl font-bold text-ink mb-5" style={display}>Messages</h2>
        {messages.length === 0 ? (
          <p className="text-stone-mid bg-parchment-soft border border-dashed border-stone-edge rounded-2xl p-8 text-center">
            No messages yet — share the signing link to get things going.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="flex gap-4 bg-white border border-stone-edge rounded-2xl p-4">
                {m.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink" style={display}>{m.author_name}</p>
                  <p className="text-sm text-stone-mid whitespace-pre-line line-clamp-3">{m.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(m)}
                  className="self-start text-[10px] font-bold uppercase tracking-widest text-stone-light hover:text-danger-earthen transition-colors"
                  style={accent}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

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
