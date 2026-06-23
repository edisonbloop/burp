"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  // The email link drops a recovery session into the URL. The Supabase client
  // (detectSessionInUrl) picks it up automatically; we just wait for it.
  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setChecking(false);
      }
    });

    // getSession resolves only after the URL has been processed.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setReady(true);
      setChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light text-sm focus:outline-none focus:border-gold transition-colors duration-140";
  const labelClass =
    "block text-[10px] font-bold text-stone-mid uppercase tracking-widest mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1800);
  }

  return (
    <main className="min-h-screen bg-vellum flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-10 block">
        <Image
          src="/logomain.png"
          alt="BURP"
          width={140}
          height={35}
          priority
          className="h-9 w-auto object-contain"
        />
      </Link>

      <div className="w-full max-w-md bg-parchment-soft border border-stone-edge rounded-3xl shadow-sm overflow-hidden">
        {checking ? (
          <div className="px-8 py-12 text-center">
            <p className="text-sm text-stone-mid">Verifying your reset link…</p>
          </div>
        ) : done ? (
          <div className="px-8 py-10 text-center">
            <div className="w-16 h-16 bg-gold-wash rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-soft text-gold text-3xl">
              ✓
            </div>
            <h1
              className="text-3xl font-bold text-ink mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Password updated
            </h1>
            <p className="text-sm text-stone-mid leading-relaxed">
              Your new password is set. Taking you to your dashboard…
            </p>
          </div>
        ) : !ready ? (
          <div className="px-8 py-10 text-center">
            <h1
              className="text-2xl font-bold text-ink mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Link expired or invalid
            </h1>
            <p className="text-sm text-stone-mid leading-relaxed mb-8">
              This password reset link is no longer valid. Please request a new
              one.
            </p>
            <Link
              href="/signin/forgot"
              className="inline-block w-full py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors text-center"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 pt-8 pb-8 space-y-5">
            <div className="text-center mb-2">
              <h1
                className="text-3xl font-bold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Set a new password
              </h1>
              <p className="text-sm text-stone-mid mt-1.5 leading-relaxed">
                Choose a new password for your BURP account.
              </p>
            </div>

            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-accent)" }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-accent)" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors duration-200 disabled:opacity-60"
            >
              {pending ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>

      <Link
        href="/"
        className="mt-8 text-xs text-stone-light hover:text-stone-mid transition-colors"
      >
        ← Back to home
      </Link>
    </main>
  );
}
