"use client";

import { useState, useSyncExternalStore } from "react";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

const noop = () => () => {};

function CopyRow({ icon, title, note, url, share }: { icon: string; title: string; note: string; url: string; share?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the link is visible to copy by hand */
    }
  }
  return (
    <div className="bg-white border border-stone-edge rounded-2xl p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl leading-none">{icon}</span>
        <div className="min-w-0">
          <p className="font-bold text-ink text-lg leading-tight" style={display}>{title}</p>
          <p className="text-xs text-stone-mid">{note}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input readOnly value={url} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 bg-parchment-soft border border-stone-edge rounded-xl px-3 py-2 text-xs text-stone-mid font-mono" />
        <div className="flex gap-2">
          <button onClick={copy} className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-ink text-vellum text-[10px] font-bold uppercase tracking-widest hover:bg-stone transition-colors" style={accent}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
          {share && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(share + " " + url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity text-center"
              style={accent}
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/** The three links an organiser needs: sign, reveal, manage. */
export default function CardLinks({ slug, manageKey, honoree }: { slug: string; manageKey: string; honoree: string }) {
  const origin = useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => "https://www.burp.ink"
  );

  return (
    <div className="space-y-3">
      <CopyRow
        icon="✍️"
        title="Invite friends to sign"
        note="Share this in your group chat — anyone with it can add a message and photo."
        url={`${origin}/birthday/${slug}/sign`}
        share={`We're making a birthday card for ${honoree} 🎂 Add your message here:`}
      />
      <CopyRow
        icon="🎁"
        title={`Send to ${honoree} on the day`}
        note="The finished card — envelope, music, candles and every message."
        url={`${origin}/birthday/${slug}`}
        share={`Happy birthday ${honoree}! 🎉 We made you something — open it with sound on:`}
      />
      <CopyRow
        icon="🔑"
        title="Your private manage link"
        note="Keep this one to yourself — it lets you edit the card and remove messages."
        url={`${origin}/birthday/${slug}/manage?key=${manageKey}`}
      />
    </div>
  );
}
