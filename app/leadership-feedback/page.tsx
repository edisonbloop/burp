import Link from "next/link";
import AdminAssessmentForm from "@/components/AdminAssessmentForm";

export default function LeadershipFeedbackPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← B U R P
          </Link>
        </div>
      </div>

      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)",
        }}
      >
        <span
          className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Anonymous · Confidential
        </span>
        <h1
          className="text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Leadership Feedback
        </h1>
        <p className="text-stone-mid text-sm max-w-lg mx-auto leading-relaxed">
          Help us grow as a leadership team. Your honest feedback about our admins is
          completely anonymous and is used only to help them serve the community better.
        </p>
      </section>

      <section className="flex-1 w-full px-4 sm:px-6 py-12">
        <AdminAssessmentForm />
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
