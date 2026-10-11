import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share a Need — BURP Sharehouse",
  description: "Share a need openly or anonymously and let the body of Christ carry it with you.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
