import Link from "next/link";
import type { Metadata } from "next";
import WorshipAttendForm from "@/components/WorshipAttendForm";

export const metadata: Metadata = {
  title: "Venue Check-In — From the Heart | BURP",
  description: "Register your attendance at From the Heart — A Night of Worship.",
  robots: { index: false, follow: false },
};

export default function WorshipAttendPage() {
  return (
    <div className="min-h-screen flex flex-col bg-vellum text-ink">
      <div className="px-6 py-5 border-b border-stone-edge bg-parchment-soft">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <Link
            href="/worship"
            className="text-[10px] font-bold tracking-[0.3em] uppercase text-stone-mid hover:text-gold-deep transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← From the Heart
          </Link>
          <span
            className="text-[10px] tracking-[0.35em] uppercase text-stone-light"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Venue Check-In
          </span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <p
              className="text-[10px] tracking-[0.45em] uppercase text-stone-light mb-4"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              From the Heart · In Person
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold text-ink mb-3 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome — register your attendance
            </h1>
            <p
              className="text-base text-stone-mid leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A quick check-in at the door so we know who&rsquo;s in the room with us tonight.
            </p>
          </div>

          <div className="bg-white border border-stone-edge rounded-3xl p-6 sm:p-10 shadow-sm">
            <WorshipAttendForm />
          </div>

          <p
            className="mt-8 text-center text-[10px] tracking-widest uppercase text-stone-light"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Watching online?{" "}
            <Link href="/worship#rsvp" className="text-stone-mid hover:text-gold-deep transition-colors">
              RSVP for the livestream →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
