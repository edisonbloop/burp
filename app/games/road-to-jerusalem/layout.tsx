import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Road to Jerusalem Quiz — BURP",
  description:
    "15 questions on the anointing at Bethany, the Triumphal Entry, Jesus weeping over Jerusalem and the grain of wheat.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
