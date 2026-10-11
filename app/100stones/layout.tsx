import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "100 Stones of Remembrance — BURP",
  description: "Testimonies of what God has done over 100 days of feasting on His Word. Set your testimony in stone so others find courage.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
