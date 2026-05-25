import Link from "next/link";
import Image from "next/image";

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-vellum flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link href="/" className="mb-10 block">
        <Image
          src="/logomain.png"
          alt="BURP"
          width={140}
          height={35}
          priority
          className="h-9 w-auto object-contain"
        />
      </Link>

      <div className="w-full max-w-md bg-parchment-soft border border-stone-edge rounded-3xl shadow-sm p-10 text-center">
        {/* Envelope icon */}
        <div className="w-16 h-16 bg-gold-wash rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-soft">
          <svg
            className="w-8 h-8 text-gold"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
        </div>

        <h1
          className="text-3xl font-bold text-ink mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Check your email
        </h1>
        <p className="text-sm text-stone-mid leading-relaxed mb-3">
          We&rsquo;ve sent a confirmation link to your email address. Click the
          link to activate your account and you&rsquo;re in.
        </p>
        <p className="text-xs text-stone-light mb-8">
          Don&rsquo;t see it? Check your spam or junk folder.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/signin"
            className="w-full py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm tracking-wide transition-colors text-center"
          >
            Back to Sign In
          </Link>
          <Link
            href="/"
            className="text-xs text-stone-light hover:text-stone-mid transition-colors"
          >
            Return to home
          </Link>
        </div>
      </div>
    </main>
  );
}
