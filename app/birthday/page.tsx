import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import CreateCardClient from "@/components/birthday/CreateCardClient";

export const metadata: Metadata = {
  title: "Birthday Cards — BURP",
  description: "Make a group birthday card: everyone adds a message and photos, then the birthday person opens a card with music, candles and confetti.",
};

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

// Kept to the edges so they never sit on the headline
const FLOATERS = [
  { e: "🎈", left: "4%", top: "18%" },
  { e: "✨", left: "10%", top: "72%" },
  { e: "🎉", left: "88%", top: "14%" },
  { e: "🎈", left: "92%", top: "62%" },
];

const STEPS = [
  { n: "01", icon: "🎂", title: "Start a card", body: "Their name, a few favourite photos, and a look." },
  { n: "02", icon: "✍️", title: "Gather the love", body: "Share one link. Friends add messages and photos — no sign-up." },
  { n: "03", icon: "💌", title: "Send the surprise", body: "They open an envelope to music, candles to blow out, and every wish." },
];

export default function BirthdayPage() {
  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />

      <section className="relative overflow-hidden bg-ink text-vellum">
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(55% 90% at 85% 0%, rgba(184,146,74,0.32), transparent 70%), radial-gradient(40% 70% at 0% 100%, rgba(210,102,122,0.18), transparent 70%)" }} />
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {FLOATERS.map((f, i) => (
            <span
              key={i}
              className="absolute text-2xl sm:text-4xl opacity-50 animate-[bday-float_9s_ease-in-out_infinite]"
              style={{ left: f.left, top: f.top, animationDelay: `${i * -1.7}s` }}
            >
              {f.e}
            </span>
          ))}
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-soft mb-4" style={accent}>BURP · Celebrate someone</p>
          <h1 className="text-5xl sm:text-7xl font-bold leading-[1.02] mb-5" style={display}>
            A birthday card <span className="italic text-gold-soft">from everyone</span>
          </h1>
          <p className="text-sm sm:text-base text-[#d4c4ae] max-w-lg mx-auto leading-relaxed">
            Collect messages and photos from the whole community, then send one beautiful card — with an envelope to open, a song, and candles to blow out.
          </p>
        </div>
      </section>

      <section className="border-b border-stone-edge bg-parchment-soft">
        <div className="max-w-4xl mx-auto px-6 py-8 grid sm:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-gold-deep" style={accent}>{s.n}</p>
                <p className="font-bold text-ink text-lg leading-tight" style={display}>{s.title}</p>
                <p className="text-xs text-stone-mid leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CreateCardClient />
    </div>
  );
}
