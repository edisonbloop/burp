"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { createBirthdayCard, getCelebrants } from "@/lib/birthday-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { BirthdayCardInput, Celebrant } from "@/types/birthday";
import CardDetailsFields, { formatBirthday } from "./CardDetailsFields";
import CardLinks from "./CardLinks";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

type SavedCard = { slug: string; key: string; honoree: string; created: string };
const STORE = "burp-birthday-cards";

function rawSaved() {
  try {
    return localStorage.getItem(STORE) || "[]";
  } catch {
    return "[]";
  }
}

function parseSaved(raw: string): SavedCard[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function CreateCardClient() {
  const [form, setForm] = useState<BirthdayCardInput>({
    person_id: null,
    honoree_name: "",
    turning_age: null,
    birthday: null,
    headline: "",
    organiser_name: "",
    organiser_note: "",
    photo_urls: [],
    theme: "gold",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ slug: string; manageKey: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Community birthdays come from the private roster, so only for members.
  useEffect(() => {
    let cancelled = false;
    getSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => getCelebrants(data.session?.access_token ?? null))
      .then((res) => {
        if (cancelled) return;
        setSignedIn(res.signedIn);
        setCelebrants(res.celebrants);
      })
      .catch(() => !cancelled && setSignedIn(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = celebrants.filter((c) => c.days_away <= 45).slice(0, 8);
  const picked = celebrants.find((c) => c.person_id === form.person_id);

  function pickCelebrant(c: Celebrant) {
    setForm((f) => ({ ...f, person_id: c.person_id, honoree_name: c.first_name, birthday: c.next_birthday }));
  }

  function startFor(c: Celebrant) {
    pickCelebrant(c);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const savedRaw = useSyncExternalStore(() => () => {}, rawSaved, () => "[]");
  const saved = useMemo(() => parseSaved(savedRaw), [savedRaw]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const { data } = await getSupabaseBrowserClient().auth.getSession();
      const res = await createBirthdayCard(form, data.session?.access_token ?? null);
      if (!res.slug || !res.manageKey) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setCreated({ slug: res.slug, manageKey: res.manageKey });
      const next = [{ slug: res.slug, key: res.manageKey, honoree: form.honoree_name.trim(), created: new Date().toISOString() }, ...parseSaved(rawSaved())].slice(0, 20);
      try {
        localStorage.setItem(STORE, JSON.stringify(next));
      } catch {
        /* storage blocked — the links are on screen */
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (created) {
    return (
      <div className="max-w-2xl mx-auto w-full px-5 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-bounce">💌</div>
          <h2 className="text-4xl sm:text-5xl font-bold text-ink mb-3" style={display}>
            {form.honoree_name.trim()}&rsquo;s card is ready
          </h2>
          <p className="text-stone-mid max-w-md mx-auto">
            Now gather the love. Share the signing link, then send the card itself on the big day.
          </p>
        </div>
        <CardLinks slug={created.slug} manageKey={created.manageKey} honoree={form.honoree_name.trim()} />
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href={`/birthday/${created.slug}/sign`} className="px-8 py-3 rounded-full bg-gold text-vellum text-xs font-bold uppercase tracking-widest hover:bg-gold-deep transition-colors text-center" style={accent}>
            Sign it yourself
          </Link>
          <Link href={`/birthday/${created.slug}`} className="px-8 py-3 rounded-full border border-stone-edge text-stone-mid text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-ink transition-colors text-center" style={accent}>
            Preview the card
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-12">
      {saved.length > 0 && (
        <div className="mb-10 bg-parchment-soft border border-stone-edge rounded-3xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep mb-3" style={accent}>Cards you&rsquo;ve started</p>
          <ul className="flex flex-wrap gap-2">
            {saved.map((c) => (
              <li key={c.slug}>
                <Link href={`/birthday/${c.slug}/manage?key=${c.key}`} className="inline-flex items-center gap-2 bg-white border border-stone-edge rounded-full px-4 py-2 text-sm text-ink hover:border-gold transition-colors">
                  🎂 {c.honoree}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep mb-1" style={accent}>Coming up in the community</p>
          <p className="text-xs text-stone-mid mb-4">Pick someone to start their card — their name and birthday fill in for you.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {upcoming.map((c) => (
              <div
                key={c.person_id}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${c.days_away === 0 ? "bg-gold-wash border-gold" : "bg-white border-stone-edge"}`}
              >
                <span className="w-11 h-11 rounded-full bg-parchment-deep flex items-center justify-center text-lg font-bold text-gold-deep shrink-0" style={display}>
                  {c.first_name.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink leading-tight truncate" style={display}>{c.full_name}</p>
                  <p className="text-[11px] text-stone-mid">🎂 {formatBirthday(c)}</p>
                </div>
                {c.existing_card ? (
                  <Link
                    href={`/birthday/${c.existing_card.slug}/sign`}
                    title={`${c.existing_card.organiser_name} started a card`}
                    className="shrink-0 px-3 py-2 rounded-full bg-ink text-vellum text-[9px] font-bold uppercase tracking-widest hover:bg-stone transition-colors"
                    style={accent}
                  >
                    Sign card
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => startFor(c)}
                    className="shrink-0 px-3 py-2 rounded-full border border-gold text-gold-deep text-[9px] font-bold uppercase tracking-widest hover:bg-gold hover:text-vellum transition-colors"
                    style={accent}
                  >
                    Start card
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {signedIn === null && <div className="h-96 rounded-[2rem] bg-parchment-soft animate-pulse" aria-label="Loading" />}

      {signedIn === false && (
        <div className="text-center bg-white/70 border border-stone-edge rounded-[2rem] p-8 sm:p-12 shadow-sm">
          <p className="text-5xl mb-4">🎂</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-3" style={display}>Sign in to start a card</h2>
          <p className="text-stone-mid max-w-sm mx-auto mb-8">
            Cards are started by BURP members. Once you&rsquo;ve made one, anyone you share the link with can sign it — no account needed.
          </p>
          <Link
            href="/signin?redirect=/birthday"
            className="inline-block px-10 py-4 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-[0.25em] hover:bg-stone transition-colors"
            style={accent}
          >
            Sign in
          </Link>
          <p className="text-xs text-stone-light mt-6">Got a link to sign someone&rsquo;s card? Just open it — you don&rsquo;t need to sign in.</p>
        </div>
      )}

      {signedIn && (
        <form ref={formRef} onSubmit={submit} className="scroll-mt-24 bg-white/70 border border-stone-edge rounded-[2rem] p-6 sm:p-10 shadow-sm">
          {picked?.existing_card && (
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 bg-gold-wash border border-gold-soft rounded-2xl p-4">
              <p className="flex-1 text-sm text-ink">
                <strong>{picked.existing_card.organiser_name}</strong> has already started a card for {picked.first_name}. Add your message to theirs so it&rsquo;s all in one place?
              </p>
              <Link
                href={`/birthday/${picked.existing_card.slug}/sign`}
                className="shrink-0 px-5 py-2.5 rounded-full bg-ink text-vellum text-[10px] font-bold uppercase tracking-widest hover:bg-stone transition-colors text-center"
                style={accent}
              >
                Sign their card
              </Link>
            </div>
          )}
          <CardDetailsFields value={form} onChange={setForm} onBusyChange={setBusy} celebrants={celebrants} onPickCelebrant={pickCelebrant} />
          {error && <p className="mt-6 text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{error}</p>}
          <button
            type="submit"
            disabled={pending || busy}
            className="mt-8 w-full py-4 rounded-full bg-ink text-vellum text-xs font-bold uppercase tracking-[0.25em] hover:bg-stone transition-colors disabled:opacity-60"
            style={accent}
          >
            {busy ? "Uploading photos…" : pending ? "Sealing the envelope…" : "Create the card ✨"}
          </button>
        </form>
      )}
    </div>
  );
}
