import SiteNav from "@/components/SiteNav";
import ThanksgivingClient from "@/components/thanksgiving/ThanksgivingClient";
import { getThanksgivingStatus } from "@/lib/thanksgiving-actions";

export const dynamic = "force-dynamic";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

export default async function ThanksgivingPage() {
  const status = await getThanksgivingStatus();

  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />

      <section className="relative overflow-hidden text-vellum" style={{ background: "#3B1219" }}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 90% at 85% 0%, rgba(226,102,43,0.35), transparent 70%), radial-gradient(45% 80% at 0% 100%, rgba(196,138,53,0.3), transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 py-14 sm:py-20 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-soft mb-4" style={accent}>
            BURP · Thanksgiving Potluck
          </p>
          <h1 className="text-5xl sm:text-7xl leading-[1.05] mb-5" style={{ fontFamily: "var(--font-tg-script), cursive" }}>
            You are appreciated
          </h1>
          <p className="text-sm sm:text-base text-[#e7d3bd] max-w-lg mx-auto leading-relaxed" style={display}>
            RSVP, and we’ll give you the name of someone else who’s coming. Write one thing you appreciate about them — we’ll
            print it, anonymously, on the back of their place card.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-10">
        <ThanksgivingClient initialOpen={status.open} initialCount={status.count} />
      </main>
    </div>
  );
}
