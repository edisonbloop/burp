import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Your Stone — BURP",
  description: "Share what God did in you during 100 days of reading His Word.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
