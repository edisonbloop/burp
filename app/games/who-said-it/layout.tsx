import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Who Said It? — BURP",
  description: "Match the Bible quote to the person who said it.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
