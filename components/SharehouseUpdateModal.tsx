"use client";

import { useState } from "react";
import { verifyAndUpdateNeedStatus } from "@/lib/sharehouse-actions";

interface SharehouseUpdateModalProps {
  needId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SharehouseUpdateModal({
  needId,
  onClose,
  onSuccess,
}: SharehouseUpdateModalProps) {
  const [contactInfo, setContactInfo] = useState("");
  const [testimony, setTestimony] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await verifyAndUpdateNeedStatus(needId, contactInfo, testimony);

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2200);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a1714]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-vellum border border-stone-edge rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-light hover:text-ink transition-colors p-2 text-xl"
        >
          ✕
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 text-gold">✓</div>
            <h3
              className="text-2xl font-bold text-ink mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Testimony Set in Stone
            </h3>
            <p className="text-xs text-stone-mid max-w-sm mx-auto leading-relaxed">
              Your testimony has been registered. The need has been marked as met, and the community will feast on this good report! Thank you for sharing His faithfulness.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <span
                className="text-[9px] font-bold tracking-widest text-gold-deep uppercase block mb-1"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Galatians 6:2 · Testimony
              </span>
              <h3
                className="text-2xl font-bold text-ink mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Mark Need as Met
              </h3>
              <p className="text-xs text-stone-mid max-w-sm mx-auto leading-relaxed">
                Provide your registration contact details for verification, then share what God did to lift this burden.
              </p>
            </div>

            <hr className="border-stone-edge/40" />

            {/* Verification Field */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                Verification Contact details <span className="text-gold-deep">*</span>
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Enter the email or phone number used when submitting"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans"
              />
              <span className="text-[10px] text-stone-light mt-1 block leading-relaxed">
                This must exactly match the contact details provided in your original submission.
              </span>
            </div>

            {/* Testimony Field */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-mid mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
                Update & Testimony <span className="text-gold-deep">*</span>
              </label>
              <textarea
                value={testimony}
                onChange={(e) => setTestimony(e.target.value)}
                rows={4}
                placeholder="How was this need met? Share your testimony of God's provision, whether it was through a member of this community, an unexpected channel, or direct spiritual strength."
                required
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl border border-stone-edge bg-white text-ink placeholder:text-stone-light/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition text-sm font-sans resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-light mt-1 font-medium">
                <span />
                <span>{testimony.length}/1000</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-edge text-stone hover:text-ink font-semibold transition-colors text-xs uppercase tracking-wider"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold transition-colors text-xs uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {loading ? "Verifying..." : "Mark as Met & Save Testimony"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
