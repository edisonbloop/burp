import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Outreach — BURP",
  description: "Vote on and discuss BURP's community outreach initiatives.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
