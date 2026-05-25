"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type Mode = "signin" | "signup";

/* ── Inner component (uses useSearchParams — must be inside <Suspense>) ── */
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        /* Sign up */
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data.user) {
          // Persist the display name immediately
          await supabase
            .from("profiles")
            .upsert({ id: data.user.id, full_name: fullName.trim() });

          if (!data.session) {
            // Supabase sent a confirmation email
            router.push("/signin/check-email");
          } else {
            router.push(redirectTo);
            router.refresh();
          }
        }
      }
    });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light text-sm focus:outline-none focus:border-gold transition-colors duration-140";
  const labelClass =
    "block text-[10px] font-bold text-stone-mid uppercase tracking-widest mb-1.5";

  return (
    <main className="min-h-screen bg-vellum flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
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
        {/* Mode toggle */}
        <div className="flex border-b border-stone-edge">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-4 text-[10px] font-bold tracking-widest uppercase transition-colors duration-140 ${
                mode === m
                  ? "text-gold bg-gold-wash"
                  : "text-stone-mid hover:text-ink"
              }`}
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-8 pt-8 pb-6 space-y-5">
          {/* Heading */}
          <div className="text-center mb-2">
            <h1
              className="text-3xl font-bold text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {mode === "signin" ? "Welcome back" : "Join BURP"}
            </h1>
            <p className="text-sm text-stone-mid mt-1.5 leading-relaxed">
              {mode === "signin"
                ? "Sign in to continue to your dashboard."
                : "Create an account and join the community."}
            </p>
          </div>

          {/* Full name — sign up only */}
          {mode === "signup" && (
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-accent)" }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Your full name"
                className={inputClass}
                autoComplete="name"
              />
            </div>
          )}

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-accent)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputClass}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors duration-200 disabled:opacity-60"
          >
            {pending
              ? "Please wait…"
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Switch mode */}
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-stone-mid">
            {mode === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() =>
                switchMode(mode === "signin" ? "signup" : "signin")
              }
              className="text-gold font-semibold hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
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

/* ── Page export — wraps content in Suspense for useSearchParams ── */
export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
