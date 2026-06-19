"use client";

import { useEffect, useState } from "react";

// The beforeinstallprompt event isn't in the standard lib DOM types yet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "burp_install_dismissed_at";
// Re-surface the prompt after this long if the user dismissed it (14 days).
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed / running as an app → never show.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari exposes this non-standard flag when launched from the home screen.
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (isStandalone) return;

    // Respect a recent dismissal.
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    const ios =
      /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;

    // Chromium / Android: capture the native install event for a custom button.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Hide the banner permanently once the app is installed.
    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS gets no beforeinstallprompt — show the manual instructions after a beat.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (ios) {
      iosTimer = setTimeout(() => {
        setIsIOS(true);
        setVisible(true);
      }, 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-vellum border border-stone-edge rounded-2xl shadow-xl p-4 flex gap-3.5 items-start animate-fadeIn">
        {/* Burp icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-192.png"
          alt="BURP"
          className="w-12 h-12 rounded-xl border border-stone-edge flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-bold text-ink leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Add BURP to your home screen
          </h3>

          {isIOS ? (
            <p className="text-xs text-stone-mid leading-relaxed mt-1">
              Tap the Share button{" "}
              <span aria-label="share" className="font-semibold">
                ⎋
              </span>{" "}
              in Safari, then choose{" "}
              <span className="font-semibold text-ink">
                &ldquo;Add to Home Screen&rdquo;
              </span>{" "}
              <span aria-label="add">➕</span>.
            </p>
          ) : (
            <p className="text-xs text-stone-mid leading-relaxed mt-1">
              Install the app for a faster, full-screen experience — no app
              store needed.
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            {!isIOS && (
              <button
                onClick={install}
                className="px-4 py-2 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-xs uppercase tracking-wider transition-colors"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Install
              </button>
            )}
            <button
              onClick={dismiss}
              className="px-4 py-2 rounded-xl border border-stone-edge text-stone-mid hover:text-ink font-semibold text-xs uppercase tracking-wider transition-colors"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {isIOS ? "Got it" : "Not now"}
            </button>
          </div>
        </div>

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-stone-light hover:text-ink transition-colors text-lg leading-none flex-shrink-0 -mt-1 -mr-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
