import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guess the Bible Character — BURP",
  description: "Guess the Bible character from clues.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
