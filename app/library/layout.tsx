import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spiritual Content Library — BURP",
  description: "Poems, reflections, devotions, and teachings submitted by the Berean community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
