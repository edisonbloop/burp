import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post to the Bulletin — BURP",
  description: "Share an event, promotion, product or service with the BURP community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
