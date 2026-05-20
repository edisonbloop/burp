import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function CheckEmailPage() {
  return (
    <main className="flex-1 bg-[#faf6ef] min-h-screen pb-20">
      <PageHeader 
        title="Check Your Email" 
        subtitle="We need to verify it's really you."
      />
      <div className="max-w-2xl mx-auto px-4 mt-12 text-center">
        <div className="bg-white p-10 rounded-2xl border border-[#e8d4b0] shadow-sm">
          <div className="w-20 h-20 bg-[#fdf8f0] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#e3be82]">
            <span className="text-4xl">✉️</span>
          </div>
          <h2 className="text-3xl font-bold text-[#2d1f0e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Confirm your sign up
          </h2>
          <p className="text-lg text-[#7a5a3a] mb-8 leading-relaxed">
            We've sent a verification link to your email address. 
            Please click the link in the email to confirm your account so you can join the discussion.
          </p>
          <p className="text-[#a96e28] text-sm mb-8">
            Don't see it? Check your spam or junk folder.
          </p>
          <Link 
            href="/talk-it-over" 
            className="inline-block px-8 py-4 rounded-xl bg-[#c4893a] hover:bg-[#a96e28] text-white font-semibold transition-colors"
          >
            Return to Discussions
          </Link>
        </div>
      </div>
    </main>
  );
}
