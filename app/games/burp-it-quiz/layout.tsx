import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Burp It Quiz — BURP",
  description: "Test yourself on the verses from your Burp It daily readings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
