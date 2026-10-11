import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — BURP",
  description: "Sign in to BURP.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
