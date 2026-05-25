"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (data.success) router.refresh();
      else setError(data.message ?? "Incorrect password.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-vellum">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gold-wash border border-gold-soft flex items-center justify-center text-2xl text-gold-deep">
            ⚿
          </div>
        </div>

        <h1
          className="text-4xl font-bold text-center text-ink mb-2 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Admin Access
        </h1>
        <p className="text-center text-sm text-stone-mid mb-8">
          Enter the admin password to manage submissions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-parchment-soft text-ink placeholder:text-stone-light focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm"
          />

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs tracking-widest uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {loading ? "Verifying…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
