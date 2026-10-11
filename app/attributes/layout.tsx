import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attributes of God — BURP",
  description: "Explore the attributes of God through Scripture, contributed by the Berean community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
