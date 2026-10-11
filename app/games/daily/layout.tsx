import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Bible Challenge — BURP",
  description: "A daily Bible challenge from BURP.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
