"use client";

import { useState } from "react";

interface PasswordGateProps {
  verifyEndpoint: string;
  storageKey: string;
  title: string;
  description: string;
  onSuccess: () => void;
}

export default function PasswordGate({
  verifyEndpoint,
  storageKey,
  title,
  description,
  onSuccess,
}: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };

      if (data.success) {
        if (storageKey) {
          localStorage.setItem(storageKey, "true");
        }
        onSuccess();
      } else {
        setError(data.message ?? "Incorrect password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md">
        {/* Stone icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#f0d9b0] flex items-center justify-center text-2xl text-[#a96e28]">
            ◉
          </div>
        </div>

        <h1
          className="text-3xl font-bold text-center text-[#2d1f0e] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {title}
        </h1>
        <p className="text-center text-[#7a5a3a] mb-8 leading-relaxed">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#4d2c11] mb-1.5"
            >
              Access Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the event password"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e8d4b0] bg-white text-[#2d1f0e] placeholder-[#c4b090] focus:outline-none focus:ring-2 focus:ring-[#c4893a] focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-[#c4893a] hover:bg-[#a96e28] text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
