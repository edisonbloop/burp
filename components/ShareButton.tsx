"use client";

import { useState, useRef, useEffect } from "react";

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getUrl = () => (typeof window !== "undefined" ? window.location.href : "");
  const getTitle = () => (typeof window !== "undefined" ? document.title : "BURP Content Library");

  async function handleClick() {
    // On mobile, prefer the native share sheet
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: getTitle(), url: getUrl() });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    setOpen((v) => !v);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function shareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(getTitle() + "\n" + getUrl())}`,
      "_blank"
    );
    setOpen(false);
  }

  function shareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(getTitle())}&url=${encodeURIComponent(getUrl())}`,
      "_blank"
    );
    setOpen(false);
  }

  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`,
      "_blank"
    );
    setOpen(false);
  }

  function shareTelegram() {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(getUrl())}&text=${encodeURIComponent(getTitle())}`,
      "_blank"
    );
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleClick}
        className={`px-5 py-2.5 rounded-full border text-xs font-semibold tracking-wider uppercase transition-all duration-140 flex items-center gap-2 shadow-sm ${
          open
            ? "bg-gold-wash border-gold text-ink"
            : "bg-vellum border-stone-edge hover:border-gold text-stone hover:text-ink"
        }`}
        style={{ fontFamily: "var(--font-accent)" }}
      >
        <ShareIcon />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-stone-edge shadow-lg overflow-hidden z-50">
          <div className="px-4 py-2.5 border-b border-stone-edge/50">
            <p
              className="text-[10px] font-bold tracking-widest uppercase text-stone-light"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Share this
            </p>
          </div>

          <ShareOption onClick={shareWhatsApp} icon={<WhatsAppIcon />} label="WhatsApp" color="text-[#25D366]" />
          <ShareOption onClick={shareTwitter} icon={<XIcon />} label="X (Twitter)" color="text-[#000]" />
          <ShareOption onClick={shareFacebook} icon={<FacebookIcon />} label="Facebook" color="text-[#1877F2]" />
          <ShareOption onClick={shareTelegram} icon={<TelegramIcon />} label="Telegram" color="text-[#229ED9]" />

          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone hover:bg-gold-wash transition-colors border-t border-stone-edge/50"
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
            <span className="font-medium">{copied ? "Copied!" : "Copy link"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ShareOption({
  onClick,
  icon,
  label,
  color,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone hover:bg-gold-wash transition-colors"
    >
      <span className={`w-5 h-5 flex-shrink-0 ${color}`}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────── */

function ShareIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4 text-stone-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-success-earthen" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
