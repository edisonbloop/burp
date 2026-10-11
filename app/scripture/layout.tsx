import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search the Scriptures — BURP",
  description: "Look up any Bible passage and compare translations side by side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
