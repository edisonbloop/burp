import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Cinzel } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import PasswordRecoveryHandler from "@/components/PasswordRecoveryHandler";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BURP — The Berean Upper Room Platform",
  description:
    "A room to feast on Scripture — and to honestly say what you found.",
  applicationName: "BURP",
  appleWebApp: {
    capable: true,
    title: "BURP",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF8F1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBF8F1] text-[#1A1714] font-sans">
        {children}
        <PasswordRecoveryHandler />
        <InstallPrompt />
      </body>
      {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
    </html>
  );
}

