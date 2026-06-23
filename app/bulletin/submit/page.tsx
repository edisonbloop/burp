import PageHeader from "@/components/PageHeader";
import BulletinForm from "@/components/BulletinForm";

export default function BulletinSubmitPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-vellum text-ink">
      <PageHeader
        title="Post to the Bulletin"
        subtitle="Share an event, promotion, product or service with the community."
        backHref="/bulletin"
      />

      <div className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto mb-8 p-5 bg-parchment-soft border border-stone-edge rounded-2xl text-center">
          <h3
            className="text-sm font-bold text-ink uppercase tracking-wider mb-1.5"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            A Quick Note
          </h3>
          <p className="text-xs text-stone-mid leading-relaxed">
            Posts are reviewed by an administrator before they appear on the
            board. Keep it honest, edifying, and useful to the body.
          </p>
        </div>

        <BulletinForm />
      </div>
    </div>
  );
}
