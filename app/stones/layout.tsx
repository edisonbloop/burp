import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Wall of Remembrance — BURP",
  description: "Read the testimonies on the BURP Wall of Remembrance — 100 and 200 Stones from the community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
