"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function ForgotPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light text-sm focus:outline-none focus:border-gold transition-colors duration-140";
  const labelClass =
    "block text-[10px] font-bold text-stone-mid uppercase tracking-widest mb-1.5";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/signin/reset`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    });
  };

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
        {sent ? (
          <div className="px-8 py-10 text-center">
            {/* Envelope icon */}
            <div className="w-16 h-16 bg-gold-wash rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-soft">
              <svg
                className="w-8 h-8 text-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </div>
            <h1
              className="text-3xl font-bold text-ink mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Check your email
            </h1>
            <p className="text-sm text-stone-mid leading-relaxed mb-3">
              If an account exists for <span className="text-ink font-semibold">{email}</span>,
              we&rsquo;ve sent a link to reset your password.
            </p>
            <p className="text-xs text-stone-light mb-8">
              Don&rsquo;t see it? Check your spam or junk folder.
            </p>
            <Link
              href="/signin"
              className="inline-block w-full py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors text-center"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 pt-8 pb-8 space-y-5">
            <div className="text-center mb-2">
              <h1
                className="text-3xl font-bold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Reset your password
              </h1>
              <p className="text-sm text-stone-mid mt-1.5 leading-relaxed">
                Enter your email and we&rsquo;ll send you a link to set a new
                password.
              </p>
            </div>

            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-accent)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
                autoComplete="email"
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
              {pending ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center text-xs text-stone-mid">
              Remembered it?{" "}
              <Link href="/signin" className="text-gold font-semibold hover:underline">
                Back to sign in
              </Link>
            </p>
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
