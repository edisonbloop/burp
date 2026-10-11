import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BURP Bulletin — Events, Promotions, Products & Services",
  description: "A members' board for events, promotions, products and services from the BURP community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
