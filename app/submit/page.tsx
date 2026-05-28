import StoneForm from "@/components/StoneForm";
import PageHeader from "@/components/PageHeader";

export default function SubmitPage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Submit Your Stone"
        subtitle="What do you want to remember God did in you during these 100 days?"
        backHref="/100stones"
      />

      <div className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-[#fdf8f0] border border-[#e8d4b0] rounded-2xl">
          <p className="text-sm text-[#7a5a3a] italic leading-relaxed text-center">
            In Joshua 4, Israel set up stones so future generations would ask,
            &ldquo;What do these stones mean?&rdquo; Your story may become someone
            else&apos;s courage.
          </p>
        </div>

        <StoneForm />
      </div>
    </div>
  );
}
