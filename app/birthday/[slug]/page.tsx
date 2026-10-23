import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBirthdayCard } from "@/lib/birthday-actions";
import BirthdayCardView from "@/components/birthday/BirthdayCardView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayCard(slug);
  if (!data) return { title: "Card not found — BURP" };
  const { card } = data;
  const title = `Happy Birthday, ${card.honoree_name}! 🎂`;
  const description = `A birthday card from ${card.organiser_name} and friends. Open it with sound on.`;
  const image = card.photo_urls[0];
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function BirthdayCardPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayCard(slug);
  if (!data) notFound();
  return <BirthdayCardView card={data.card} messages={data.messages} />;
}
