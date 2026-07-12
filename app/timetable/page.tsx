"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getFacilitationTimetable } from "@/lib/timetable-actions";
import { TIMETABLE_DAYS } from "@/types/timetable";
import type { FacilitationTimetable, TimetableDay } from "@/types/timetable";

type Status = "loading" | "unauth" | "ready" | "error";

// JS getDay(): 0 = Sunday … 6 = Saturday → map to our Monday-first key.
const JS_DAY_TO_KEY: TimetableDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function TimetablePage() {
  const supabase = getSupabaseBrowserClient();
  const [status, setStatus] = useState<Status>("loading");
  const [loadError, setLoadError] = useState("");
  const [timetable, setTimetable] = useState<FacilitationTimetable | null>(null);
  const [today, setToday] = useState<TimetableDay | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setStatus("loading");
      try {
        setToday(JS_DAY_TO_KEY[new Date().getDay()]);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!active) return;
        if (!session) {
          setStatus("unauth");
          return;
        }
        const tt = await getFacilitationTimetable();
        if (!active) return;
        setTimetable(tt);
        setStatus("ready");
      } catch (e) {
        if (!active) return;
        setLoadError(
          e instanceof Error ? e.message : "Something went wrong loading the timetable."
        );
        setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [supabase, retryCount]);

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      {/* Nav header */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← B U R P
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 65%)",
        }}
      >
        <span
          className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Serving Together
        </span>
        <h1
          className="text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Facilitating Timetable
        </h1>
      </section>

      <section className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {status === "loading" && (
          <p className="text-center text-sm text-stone-mid py-16">Loading the timetable…</p>
        )}

        {status === "error" && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Couldn&rsquo;t load the timetable
            </h2>
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 max-w-md mx-auto">
              {loadError}
            </p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "unauth" && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Members only
            </h2>
            <p className="text-sm text-stone-mid mb-6">
              Sign in to view the facilitating timetable.
            </p>
            <Link
              href="/signin?redirect=/timetable"
              className="inline-block px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {status === "ready" && (
          <>
            <p className="text-center text-sm text-stone-mid mb-8 leading-relaxed">
              Kindly take note of who is facilitating each day. 🙏
            </p>

            <div className="rounded-3xl border border-stone-edge bg-white overflow-hidden divide-y divide-stone-edge/60">
              {TIMETABLE_DAYS.map((day) => {
                const facilitator = timetable?.[day]?.trim();
                const isToday = today === day;
                return (
                  <div
                    key={day}
                    className={`flex items-center gap-4 px-5 sm:px-6 py-4 ${
                      isToday ? "bg-gold-wash/40" : ""
                    }`}
                  >
                    <div className="w-28 flex-shrink-0 flex items-center gap-2">
                      <span
                        className="text-xs font-bold tracking-widest uppercase text-stone-mid capitalize"
                        style={{ fontFamily: "var(--font-accent)" }}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-gold text-white">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {facilitator ? (
                        <span className="text-base font-semibold text-ink truncate block">
                          {facilitator}
                        </span>
                      ) : (
                        <span className="text-sm text-stone-light italic">Not assigned</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {timetable?.note?.trim() && (
              <p className="text-center text-sm text-stone-mid italic leading-relaxed mt-8 whitespace-pre-wrap">
                {timetable.note}
              </p>
            )}

            {timetable?.updated_at && (
              <p className="text-center text-[10px] text-stone-light uppercase tracking-widest mt-6" style={{ fontFamily: "var(--font-accent)" }}>
                Updated{" "}
                {new Date(timetable.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </>
        )}
      </section>

      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p
          className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          BURP · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
