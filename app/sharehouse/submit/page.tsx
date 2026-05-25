import PageHeader from "@/components/PageHeader";
import SharehouseForm from "@/components/SharehouseForm";

export default function SharehouseSubmitPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-vellum text-ink">
      <PageHeader
        title="Share a Need"
        subtitle="What can the community come alongside you for? You don't have to carry it alone."
        backHref="/sharehouse"
      />

      <div className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto mb-8 p-5 bg-parchment-soft border border-stone-edge rounded-2xl text-center">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-accent)" }}>
            Trust & Integrity Guidelines
          </h3>
          <p className="text-xs text-stone-mid leading-relaxed">
            All submitted needs are verified privately by community caretakers before going live. This keeps the platform transparent, accountable, and rooted in absolute truth and love.
          </p>
        </div>

        <SharehouseForm />
      </div>
    </div>
  );
}
