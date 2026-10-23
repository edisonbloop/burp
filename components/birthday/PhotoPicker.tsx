"use client";

import { useEffect, useRef, useState } from "react";
import { uploadBirthdayPhoto } from "@/lib/birthday-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { compressImage } from "./compress";

const accent = { fontFamily: "var(--font-accent)" };

/**
 * Pick, compress and upload photos. `max` 1 renders a single-photo picker.
 * Uploads need a signed-in member, or `slug` of an open card being signed.
 */
export default function PhotoPicker({
  value,
  onChange,
  max,
  onBusyChange,
  slug,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max: number;
  onBusyChange?: (busy: boolean) => void;
  slug?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  // Uploads finish one by one; track the newest list so they don't clobber each other.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(() => {
    onBusyChange?.(pending > 0);
  }, [pending, onBusyChange]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const room = max - latest.current.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    if (!chosen.length) {
      setError(`That's the limit — ${max} photo${max > 1 ? "s" : ""}.`);
      return;
    }
    setPending((n) => n + chosen.length);
    const { data } = await getSupabaseBrowserClient().auth.getSession();
    const token = data.session?.access_token;

    await Promise.all(
      chosen.map(async (file) => {
        try {
          const small = await compressImage(file);
          const fd = new FormData();
          fd.append("file", small);
          if (token) fd.append("token", token);
          if (slug) fd.append("slug", slug);
          const res = await uploadBirthdayPhoto(fd);
          if (res.url) {
            latest.current = [...latest.current, res.url].slice(0, max);
            onChange(latest.current);
          } else setError(res.error ?? "Upload failed.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed.");
        } finally {
          setPending((n) => n - 1);
        }
      })
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  const canAdd = value.length + pending < max;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={url}
            className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white p-1.5 pb-4 shadow-md rounded-sm"
            style={{ transform: `rotate(${((i * 37) % 7) - 3}deg)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Remove photo"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-vellum text-xs flex items-center justify-center shadow hover:bg-danger-earthen transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        {Array.from({ length: pending }).map((_, i) => (
          <div key={`p${i}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-sm bg-parchment-deep animate-pulse flex items-center justify-center text-2xl">
            📷
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-stone-edge hover:border-gold hover:bg-gold-wash/50 text-stone-mid hover:text-gold-deep transition-colors flex flex-col items-center justify-center gap-1"
          >
            <span className="text-2xl">＋</span>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={accent}>
              {value.length ? "More" : max > 1 ? "Add photos" : "Add photo"}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-danger-earthen">{error}</p>}
    </div>
  );
}
