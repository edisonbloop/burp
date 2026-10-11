import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check your email — BURP",
  description: "Confirm your email to continue.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
