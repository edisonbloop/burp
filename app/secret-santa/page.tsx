"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getMyAssignmentStatus, pickMySecretSanta } from "@/lib/secretsanta-actions";
import type { MyAssignmentStatus } from "@/types/secretsanta";

export default function SecretSantaPage() {
  const supabase = getSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<MyAssignmentStatus | null>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      const s = await getMyAssignmentStatus(uid);
      if (!active) return;
      setStatus(s);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function handlePick() {
    if (!userId) return;
    setError("");
    setPicking(true);
    const res = await pickMySecretSanta(userId);
    setPicking(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    const refreshed = await getMyAssignmentStatus(userId);
    setStatus(refreshed);
  }

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← B U R P
          </Link>
        </div>
      </div>

      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
        }}
      >
        <span
          className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          🎁 A Little Christmas Cheer
        </span>
        <h1
          className="text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Secret Santa
        </h1>
      </section>

      <section className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-14 text-center">
        {loading && <p className="text-sm text-stone-mid">Loading…</p>}

        {!loading && status?.state === "not_signed_in" && (
          <div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Please sign in
            </h2>
            <p className="text-sm text-stone-mid mb-6">Sign in to pick your Secret Santa.</p>
            <Link
              href="/signin?redirect=/secret-santa"
              className="inline-block px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {!loading && status?.state === "not_in_roster" && (
          <div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Not quite yet
            </h2>
            <p className="text-sm text-stone-mid leading-relaxed">
              You&rsquo;re not part of this year&rsquo;s Secret Santa roster. Reach out to an admin to get added.
            </p>
          </div>
        )}

        {!loading && status?.state === "no_active_round" && (
          <div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Not started yet
            </h2>
            <p className="text-sm text-stone-mid leading-relaxed">
              Secret Santa hasn&rsquo;t begun this year. Check back soon!
            </p>
          </div>
        )}

        {!loading && status?.state === "not_picked_yet" && (
          <div>
            <p className="text-sm text-stone-mid mb-6 leading-relaxed">
              It&rsquo;s time! Pick your person for the {status.roundYear} Secret Santa. Once picked, it&rsquo;s final —
              only you will know who you&rsquo;re gifting.
            </p>
            <button
              onClick={handlePick}
              disabled={picking}
              className="px-8 py-4 rounded-full bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-colors disabled:opacity-60"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {picking ? "Picking…" : "🎁 Pick My Secret Santa"}
            </button>
            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}
          </div>
        )}

        {!loading && status?.state === "assigned" && (
          <div>
            <span
              className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {status.roundYear} · Shhh, it&rsquo;s a secret
            </span>
            <p className="text-sm text-stone-mid mb-2">You&rsquo;re gifting</p>
            <h2 className="text-4xl font-bold text-ink mb-6" style={{ fontFamily: "var(--font-display)" }}>
              {status.recipientName}
            </h2>

            {status.recipientNotes && (
              <div className="text-left mb-6 p-4 rounded-2xl bg-parchment-soft border border-stone-edge">
                <p
                  className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-1.5"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Notes to help you choose
                </p>
                <p className="text-sm text-stone-mid whitespace-pre-wrap">{status.recipientNotes}</p>
              </div>
            )}

            <p className="text-xs text-stone-light leading-relaxed">
              Reach out to them, get to know them a little, and surprise them with a gift by December.
              Keep it a secret — that&rsquo;s the fun part! 🤫
            </p>
          </div>
        )}
      </section>

      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p
          className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          BURP · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
