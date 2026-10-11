import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "200 Stones of Remembrance — BURP",
  description: "Testimonies of what God has done over 200 days of feasting on His Word.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
