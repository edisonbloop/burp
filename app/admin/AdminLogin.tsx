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

      if (data.success) {
        router.refresh();
      } else {
        setError(data.message ?? "Incorrect password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#f0d9b0] flex items-center justify-center text-xl text-[#a96e28]">
            ⚿
          </div>
        </div>

        <h1
          className="text-2xl font-bold text-center text-[#2d1f0e] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Admin Access
        </h1>
        <p className="text-center text-sm text-[#7a5a3a] mb-8">
          Enter the admin password to manage submissions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2d1f0e] hover:bg-[#4d2c11] text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
