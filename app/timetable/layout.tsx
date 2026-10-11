import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facilitating Timetable — BURP",
  description: "Who is facilitating each day of the week in the BURP community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
