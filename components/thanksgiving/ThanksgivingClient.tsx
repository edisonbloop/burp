"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getMyThanksgivingRsvp,
  rsvpThanksgiving,
  saveMyThanksgivingNote,
} from "@/lib/thanksgiving-actions";
import { THANKSGIVING_NOTE_MAX, type MyThanksgivingRsvp } from "@/types/thanksgiving";
import { PlaceCardBack } from "./PlaceCard";
import { MIN_GUESTS_TO_MATCH } from "@/lib/thanksgiving-match";

const STORE = "burp-thanksgiving-token";
const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };
const script = { fontFamily: "var(--font-tg-script), cursive" };

const IDEAS = [
  "always makes everyone feel welcome",
  "asks the questions that make us think",
  "has a laugh that lights up the room",
  "is so faithful in showing up for people",
];

function readStoredToken() {
  try {
    return localStorage.getItem(STORE);
  } catch {
    return null;
  }
}
function storeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORE, token);
    else localStorage.removeItem(STORE);
  } catch {}
}

function personalLink(token: string) {
  return `${window.location.origin}/thanksgiving?me=${token}`;
}

export default function ThanksgivingClient({ initialOpen, initialCount }: { initialOpen: boolean; initialCount: number }) {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<MyThanksgivingRsvp | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (t: string) => {
    const data = await getMyThanksgivingRsvp(t);
    if (data) {
      setMe(data);
      setToken(t);
      storeToken(t);
    } else {
      setMe(null);
      setToken(null);
      storeToken(null);
    }
    setLoading(false);
  }, []);

  // Who's here? A ?me= link wins over this browser's remembered RSVP.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("me");
    const t = fromUrl || readStoredToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t) load(t);
    else setLoading(false);
  }, [load]);

  // While waiting for a match, check again whenever they come back to the tab.
  useEffect(() => {
    if (!token || me?.target_name) return;
    const again = () => document.visibilityState === "visible" && load(token);
    document.addEventListener("visibilitychange", again);
    const timer = setInterval(again, 20000);
    return () => {
      document.removeEventListener("visibilitychange", again);
      clearInterval(timer);
    };
  }, [token, me?.target_name, load]);

  function onRsvped(t: string, data?: MyThanksgivingRsvp) {
    window.history.replaceState(null, "", `/thanksgiving?me=${t}`);
    storeToken(t);
    setToken(t);
    if (data) setMe(data);
    else load(t);
  }

  function notMe() {
    storeToken(null);
    setToken(null);
    setMe(null);
    window.history.replaceState(null, "", "/thanksgiving");
  }

  if (loading) {
    return <div className="text-center text-sm text-stone-mid py-16">Loading…</div>;
  }
  if (!me || !token) return <RsvpForm open={initialOpen} count={initialCount} onDone={onRsvped} />;
  return <MyMatch me={me} token={token} onRefresh={() => load(token)} onNotMe={notMe} />;
}

/* ── Step 1: RSVP ───────────────────────────────────────────────────────── */

function RsvpForm({
  open,
  count,
  onDone,
}: {
  open: boolean;
  count: number;
  onDone: (token: string, me?: MyThanksgivingRsvp) => void;
}) {
  const [name, setName] = useState("");
  const [dish, setDish] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <div className="rounded-3xl border border-stone-edge bg-white p-8 text-center">
        <p className="text-2xl text-ink mb-2" style={display}>
          RSVPs are closed
        </p>
        <p className="text-sm text-stone-mid">
          If you already RSVP’d, open the link you saved. Otherwise, speak to one of the organisers.
        </p>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await rsvpThanksgiving({ name, dish });
      if (res.error || !res.token) setError(res.error ?? "Something went wrong.");
      else onDone(res.token, res.me);
    });
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-stone-edge bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold-deep mb-1" style={accent}>
          Step 1 of 2
        </p>
        <h2 className="text-3xl font-bold text-ink" style={display}>
          RSVP
        </h2>
        {count > 0 && (
          <p className="text-xs text-stone-mid mt-1">
            {count} {count === 1 ? "person has" : "people have"} RSVP’d so far.
          </p>
        )}
      </div>

      <label className="block">
        <span className="block text-sm font-semibold text-ink mb-1.5">Your name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
          autoComplete="name"
          placeholder="As you'd like it on your place card"
          className="w-full bg-parchment-soft border border-stone-edge rounded-xl px-4 py-3 text-base focus:outline-none focus:border-gold"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-semibold text-ink mb-1.5">
          What are you bringing? <span className="font-normal text-stone-light">(optional)</span>
        </span>
        <input
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          maxLength={80}
          placeholder="e.g. mac and cheese, a salad, drinks"
          className="w-full bg-parchment-soft border border-stone-edge rounded-xl px-4 py-3 text-base focus:outline-none focus:border-gold"
        />
      </label>

      {error && <p className="text-sm text-danger-earthen">{error}</p>}

      <button
        type="submit"
        disabled={pending || name.trim().length < 2}
        className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide text-white transition-opacity disabled:opacity-50"
        style={{ background: "#7A1F2E" }}
      >
        {pending ? "Saving…" : "RSVP and get my person"}
      </button>
    </form>
  );
}

/* ── Step 2: your match and your note ───────────────────────────────────── */

function MyMatch({
  me,
  token,
  onRefresh,
  onNotMe,
}: {
  me: MyThanksgivingRsvp;
  token: string;
  onRefresh: () => void;
  onNotMe: () => void;
}) {
  const [note, setNote] = useState(me.note ?? "");
  const [saved, setSaved] = useState(!!me.note);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const firstName = me.target_name?.split(" ")[0] ?? "";

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveMyThanksgivingNote(token, note);
      if (res.error) setError(res.error);
      else setSaved(true);
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(personalLink(token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold-deep mb-1" style={accent}>
          You’re coming
        </p>
        <p className="text-4xl text-[#7A1F2E]" style={script}>
          Thank you, {me.name.split(" ")[0]}!
        </p>
        {me.dish && <p className="text-xs text-stone-mid mt-1">Bringing: {me.dish}</p>}
      </div>

      {!me.target_name ? (
        <div className="rounded-3xl border border-stone-edge bg-white p-7 text-center space-y-3">
          <p className="text-2xl text-ink" style={display}>
            You’re one of the first!
          </p>
          <p className="text-sm text-stone-mid leading-relaxed">
            We’ll give you someone to write about once {MIN_GUESTS_TO_MATCH} people have RSVP’d, so nobody can guess who wrote
            their note. Keep this page open, or come back later with your link below.
          </p>
          <p className="text-xs font-semibold text-gold-deep">
            {Math.min(me.guest_count, MIN_GUESTS_TO_MATCH)} of {MIN_GUESTS_TO_MATCH} so far
          </p>
          <button onClick={onRefresh} className="text-sm font-semibold text-gold-deep hover:text-gold underline underline-offset-4">
            Check again
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="rounded-3xl border border-stone-edge bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold-deep mb-1" style={accent}>
              Step 2 of 2 · Your person is
            </p>
            <p className="text-5xl text-[#7A1F2E] leading-tight" style={script}>
              {me.target_name}
            </p>
            <p className="text-sm text-stone-mid mt-2 leading-relaxed">
              Write <strong>one sentence</strong> about something you appreciate about {firstName}. It’ll be printed on the back
              of their place card — they won’t know it’s from you, so keep it a secret!
            </p>
          </div>

          <label className="block">
            <span className="sr-only">Your note</span>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value.replace(/\n/g, " "));
                setSaved(false);
              }}
              maxLength={THANKSGIVING_NOTE_MAX}
              rows={3}
              placeholder={`I appreciate how ${firstName} ${IDEAS[firstName.length % IDEAS.length]}.`}
              className="w-full bg-parchment-soft border border-stone-edge rounded-xl px-4 py-3 text-base leading-relaxed focus:outline-none focus:border-gold resize-none"
            />
            <span className="block text-right text-[11px] text-stone-light mt-1">
              {note.length}/{THANKSGIVING_NOTE_MAX}
            </span>
          </label>

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-light mb-2" style={accent}>
              The back of {firstName}’s card
            </p>
            <div className="rounded-lg overflow-hidden shadow-md border border-stone-edge">
              <PlaceCardBack notes={note.trim() ? [note.trim()] : []} placeholder="Your note will appear here." />
            </div>
          </div>

          {error && <p className="text-sm text-danger-earthen">{error}</p>}

          <button
            type="submit"
            disabled={pending || note.trim().length < 3 || saved}
            className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide text-white transition-opacity disabled:opacity-50"
            style={{ background: "#7A1F2E" }}
          >
            {pending ? "Saving…" : saved ? "Saved ✓ — you can edit it until we print" : "Save my note"}
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-dashed border-stone-edge bg-parchment-soft p-4 text-xs text-stone-mid space-y-2">
        <p>
          <strong className="text-ink">Your personal link</strong> — save it to come back to this page on another device.
        </p>
        <div className="flex gap-2">
          <code className="flex-1 truncate bg-white border border-stone-edge rounded-lg px-3 py-2 text-[11px]">
            /thanksgiving?me={token}
          </code>
          <button onClick={copyLink} type="button" className="shrink-0 rounded-lg bg-ink text-vellum px-3 py-2 font-semibold">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button onClick={onNotMe} type="button" className="underline underline-offset-4 hover:text-ink">
          Not {me.name.split(" ")[0]}? RSVP as someone else
        </button>
      </div>
    </div>
  );
}
