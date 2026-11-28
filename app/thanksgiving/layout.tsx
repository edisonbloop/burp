import type { Metadata } from "next";
import { Great_Vibes } from "next/font/google";

const script = Great_Vibes({ variable: "--font-tg-script", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Thanksgiving Potluck — BURP",
  description: "RSVP for the Thanksgiving potluck and write a note of appreciation for someone in the group.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${script.variable} flex-1 flex flex-col`}>{children}</div>;
}
