import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { getBirthdayCard } from "@/lib/birthday-actions";
import SignCardClient from "@/components/birthday/SignCardClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayCard(slug);
  if (!data) return { title: "Card not found — BURP" };
  const title = `Sign ${data.card.honoree_name}'s birthday card ✍️`;
  const description = `${data.card.organiser_name} is gathering birthday wishes for ${data.card.honoree_name}. Add yours!`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: data.card.photo_urls[0] ? [{ url: data.card.photo_urls[0] }] : undefined },
  };
}

export default async function SignBirthdayCardPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayCard(slug);
  if (!data) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-vellum">
      <SiteNav />
      <SignCardClient card={data.card} signers={[data.card.organiser_name, ...data.messages.map((m) => m.author_name)]} />
    </div>
  );
}
