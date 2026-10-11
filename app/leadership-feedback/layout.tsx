import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leadership Feedback — BURP",
  description: "An anonymous feedback form for BURP's admin team.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
