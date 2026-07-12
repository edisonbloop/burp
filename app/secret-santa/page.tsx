"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getMyAssignmentStatus, pickMySecretSanta } from "@/lib/secretsanta-actions";
import { MONTH_NAMES } from "@/types/crm";
import type { MyAssignmentStatus } from "@/types/secretsanta";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

/* ── Decorative: gentle falling snow, purely CSS-driven ─────────────────── */
function Snowfall() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 6.3) % 100,
        delay: (i * 1.7) % 12,
        duration: 10 + ((i * 3) % 8),
        drift: (i % 2 === 0 ? 1 : -1) * (20 + ((i * 5) % 40)),
        size: 4 + (i % 3) * 3,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-white/70 animate-santa-snowfall"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            ["--drift" as string]: `${f.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Decorative: one-shot confetti burst for the reveal moment ──────────── */
function ConfettiBurst() {
  const colors = ["var(--color-gold)", "var(--color-gold-soft)", "var(--color-success-earthen)", "var(--color-danger-earthen)"];
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 3.7) % 100,
        delay: (i * 0.05) % 1.2,
        duration: 2 + (i % 3) * 0.6,
        color: colors[i % colors.length],
        size: 6 + (i % 3) * 3,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-santa-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

function daysUntilChristmas(): number {
  const now = new Date();
  let christmas = new Date(now.getFullYear(), 11, 25);
  if (now > christmas) christmas = new Date(now.getFullYear() + 1, 11, 25);
  return Math.max(0, Math.ceil((christmas.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

export default function SecretSantaPage() {
  const supabase = getSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState<MyAssignmentStatus | null>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!active) return;
        const uid = session?.user?.id ?? null;
        setUserId(uid);
        const s = await getMyAssignmentStatus(uid);
        if (!active) return;
        setStatus(s);
      } catch (e) {
        if (!active) return;
        setLoadError(
          e instanceof Error ? e.message : "Something went wrong loading Secret Santa."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [supabase, retryCount]);

  async function handlePick() {
    if (!userId) return;
    setError("");
    setPicking(true);
    try {
      const res = await pickMySecretSanta(userId);
      if (res.error) {
        setError(res.error);
        return;
      }
      const refreshed = await getMyAssignmentStatus(userId);
      setStatus(refreshed);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPicking(false);
    }
  }

  const daysLeft = daysUntilChristmas();

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={accent}
          >
            ← B U R P
          </Link>
        </div>
      </div>

      {/* Festive hero */}
      <section
        className="relative py-16 px-4 text-center border-b border-stone-edge/50 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)",
        }}
      >
        <Snowfall />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4 text-2xl">
            <span className="animate-santa-twinkle" style={{ animationDelay: "0s" }}>✨</span>
            <span className="text-4xl">🎄</span>
            <span className="animate-santa-twinkle" style={{ animationDelay: "1.1s" }}>✨</span>
          </div>
          <span
            className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
            style={accent}
          >
            A Little Christmas Cheer
          </span>
          <h1
            className="text-5xl sm:text-6xl font-bold text-ink tracking-tight leading-tight mb-3"
            style={display}
          >
            Secret Santa
          </h1>
          <p className="text-xs text-stone-mid uppercase tracking-widest font-semibold" style={accent}>
            🎅 {daysLeft} {daysLeft === 1 ? "day" : "days"} until Christmas
          </p>
        </div>
      </section>

      <section className="relative flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-14 text-center">
        {loading && (
          <div className="py-10">
            <div className="text-3xl mb-3 animate-santa-twinkle">🎁</div>
            <p className="text-sm text-stone-mid">Loading…</p>
          </div>
        )}

        {!loading && loadError && (
          <div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={display}>
              Couldn&rsquo;t load Secret Santa
            </h2>
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              {loadError}
            </p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !loadError && status?.state === "not_signed_in" && (
          <div className="p-8 rounded-3xl border border-stone-edge bg-parchment-soft">
            <div className="text-3xl mb-4">🎄</div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={display}>
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

        {!loading && !loadError && status?.state === "not_in_roster" && (
          <div className="p-8 rounded-3xl border border-stone-edge bg-parchment-soft">
            <div className="text-3xl mb-4">🎀</div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={display}>
              Not quite yet
            </h2>
            <p className="text-sm text-stone-mid leading-relaxed">
              You&rsquo;re not part of this year&rsquo;s Secret Santa roster. Reach out to an admin to get added.
            </p>
          </div>
        )}

        {!loading && !loadError && status?.state === "no_active_round" && (
          <div className="p-8 rounded-3xl border border-stone-edge bg-parchment-soft">
            <div className="text-3xl mb-4">⛄</div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={display}>
              Not started yet
            </h2>
            <p className="text-sm text-stone-mid leading-relaxed">
              Secret Santa hasn&rsquo;t begun this year. Check back soon!
            </p>
          </div>
        )}

        {!loading && !loadError && status?.state === "not_picked_yet" && (
          <div className="p-8 rounded-3xl border-2 border-gold-soft/60 bg-gradient-to-b from-gold-wash/40 to-parchment-soft">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold text-ink mb-3" style={display}>
              It&rsquo;s time to pick!
            </h2>
            <p className="text-sm text-stone-mid mb-7 leading-relaxed max-w-sm mx-auto">
              Pick your person for the {status.roundYear}{" "}
              Secret Santa. Once picked, it&rsquo;s final — only you will know who you&rsquo;re gifting. 🤫
            </p>
            <button
              onClick={handlePick}
              disabled={picking}
              className="px-9 py-4 rounded-full bg-ink hover:bg-stone text-vellum font-bold text-sm tracking-wide uppercase transition-all disabled:opacity-60 animate-santa-glow hover:scale-105"
              style={accent}
            >
              {picking ? "Picking…" : "🎁 Pick My Secret Santa"}
            </button>
            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}
          </div>
        )}

        {!loading && !loadError && status?.state === "assigned" && (
          <div className="relative">
            {showConfetti && <ConfettiBurst />}
            <div className="relative z-20 animate-santa-reveal">
              <span
                className="text-[10px] font-bold tracking-widest text-gold-deep uppercase inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-wash border border-gold-soft/50 mb-5"
                style={accent}
              >
                🔒 {status.roundYear} · Shhh, it&rsquo;s a secret
              </span>

              <p className="text-sm text-stone-mid mb-2">You&rsquo;re gifting</p>
              <h2 className="text-5xl font-bold text-ink mb-1 leading-tight" style={display}>
                {status.recipientName}
              </h2>
              {status.recipientBirthdayMonth && status.recipientBirthdayDay && (
                <p className="text-xs text-gold-deep font-semibold mb-6">
                  🎂 Birthday: {MONTH_NAMES[status.recipientBirthdayMonth - 1]} {status.recipientBirthdayDay}
                </p>
              )}

              {/* Contact details */}
              <div className="mb-6 p-5 rounded-2xl bg-ink text-vellum text-left">
                <p
                  className="text-[10px] font-bold tracking-widest uppercase text-gold mb-3"
                  style={accent}
                >
                  Reach Out to Them
                </p>
                {status.recipientPhone || status.recipientEmail ? (
                  <div className="flex flex-wrap gap-2">
                    {status.recipientPhone && (
                      <>
                        <a
                          href={waLink(status.recipientPhone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366]/15 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/25 transition-colors"
                        >
                          💬 WhatsApp
                        </a>
                        <a
                          href={`tel:${status.recipientPhone}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-vellum/10 text-vellum text-xs font-bold hover:bg-vellum/20 transition-colors"
                        >
                          📱 {status.recipientPhone}
                        </a>
                      </>
                    )}
                    {status.recipientEmail && (
                      <a
                        href={`mailto:${status.recipientEmail}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-vellum/10 text-vellum text-xs font-bold hover:bg-vellum/20 transition-colors"
                      >
                        ✉️ {status.recipientEmail}
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-vellum/70">
                    No contact details on file yet — reach out through the community to connect with them.
                  </p>
                )}
              </div>

              {status.recipientNotes && (
                <div className="text-left mb-6 p-4 rounded-2xl bg-parchment-soft border border-stone-edge">
                  <p
                    className="text-[10px] font-bold tracking-widest uppercase text-stone-light mb-1.5"
                    style={accent}
                  >
                    Notes to help you choose
                  </p>
                  <p className="text-sm text-stone-mid whitespace-pre-wrap">{status.recipientNotes}</p>
                </div>
              )}

              <p className="text-xs text-stone-light leading-relaxed">
                Reach out to them, get to know them a little, and surprise them with a gift by December 25.
                Keep it a secret — that&rsquo;s the fun part! 🤫🎄
              </p>
            </div>
          </div>
        )}
      </section>

      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p
          className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest"
          style={accent}
        >
          BURP · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
