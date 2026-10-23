import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { getBirthdayCardForManager } from "@/lib/birthday-actions";
import ManageCardClient from "@/components/birthday/ManageCardClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Manage birthday card — BURP",
  robots: { index: false },
};

export default async function ManageBirthdayCardPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { key = "" } = await searchParams;
  const data = await getBirthdayCardForManager(slug, key);

  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />
      {data ? (
        <ManageCardClient card={data.card} messages={data.messages} manageKey={key} />
      ) : (
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <p className="text-5xl mb-4">🔑</p>
          <h1 className="text-3xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>This manage link isn&rsquo;t valid</h1>
          <p className="text-stone-mid mb-8">Check you copied the whole link — the private key at the end matters.</p>
          <Link href="/birthday" className="text-gold-deep underline">Back to birthday cards</Link>
        </div>
      )}
    </div>
  );
}
