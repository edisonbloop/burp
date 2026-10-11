import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bible True or False — BURP",
  description: "Test your Bible knowledge with true or false questions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
