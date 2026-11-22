import type { Metadata } from "next";
import Link from "next/link";
import BirthdayCardView from "@/components/birthday/BirthdayCardView";
import { THEMES } from "@/components/birthday/themes";
import { BIRTHDAY_THEME_IDS, type BirthdayMessage, type BirthdayTheme } from "@/types/birthday";

/**
 * A sample card in any theme, so organisers can try a look before picking
 * it. Nothing here touches the database.
 */

interface PageProps {
  searchParams: Promise<{ theme?: string; name?: string }>;
}

export const metadata: Metadata = {
  title: "Birthday card preview — BURP",
  robots: { index: false },
};

const SAMPLE: [string, string][] = [
  ["Tolu", "Happy birthday! 🎉 My favourite memory with you is the night we stayed up talking through Romans 8 and lost track of time."],
  ["Kofi", "Wishing you joy, laughter and a year full of answered prayers. 🙏"],
  ["Ama", "You make every room warmer.\n\n\"She is clothed with strength and dignity; she can laugh at the days to come.\" — Proverbs 31:25"],
  ["Daniel", "HBD!! Cake is on me this year 🎂😂"],
  ["Esi", "Another trip around the sun and still this fabulous? Unfair, honestly. Love you loads ✨"],
];

export default async function BirthdayPreviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const themeId: BirthdayTheme = BIRTHDAY_THEME_IDS.includes(params.theme as BirthdayTheme) ? (params.theme as BirthdayTheme) : "gold";
  const name = (params.name ?? "").trim().slice(0, 40) || "Grace";
  const theme = THEMES[themeId];

  const messages: BirthdayMessage[] = SAMPLE.map(([author_name, message], i) => ({
    id: `sample-${i}`,
    card_id: "preview",
    author_name,
    message: message.replace("Happy birthday!", `Happy birthday, ${name}!`),
    photo_url: null,
    approved: true,
    created_at: "",
  }));

  return (
    <>
      <BirthdayCardView
        card={{
          id: "preview",
          slug: "preview",
          honoree_name: name,
          birthday: null,
          turning_age: 30,
          headline: null,
          organiser_name: "Edison",
          organiser_note: `${name}, this is a sample of the ${theme.label} look — your real card will have everyone's messages and photos.`,
          photo_urls: [],
          theme: themeId,
          accepting_messages: false,
          created_at: "",
        }}
        messages={messages}
      />
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-black/75 backdrop-blur-md text-white pl-4 pr-1.5 py-1.5 shadow-xl max-w-[calc(100vw-2rem)]">
        <span className="text-xs truncate">
          Preview · <strong>{theme.label}</strong>
        </span>
        <Link href="/birthday" className="shrink-0 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
          Make a card
        </Link>
      </div>
    </>
  );
}
