import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secret Santa — BURP",
  description: "Pick your Secret Santa for the year.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
