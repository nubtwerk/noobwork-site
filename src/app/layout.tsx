import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import SkipToContent from "@/components/layout/SkipToContent";
import MouseEffects from "@/components/ui/MouseEffects";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newake = localFont({
  src: "../fonts/NewakeFont-Demo.otf",
  variable: "--font-newake",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.noobwork.no"),
  title: {
    default: "Noobwork | Joachim Haraldsen: Fitness, Personal Development, Gaming Heritage",
    template: "%s | Noobwork",
  },
  description: "Premium fitness and lifestyle creator brand by Joachim Haraldsen. Training, nutrition, personal development, and gaming heritage, documented from Seoul. Built on Norway's largest gaming YouTube channel.",
  keywords: ["Noobwork", "Joachim Haraldsen", "fitness", "training", "nutrition", "Seoul", "personal development", "gaming", "content creator", "YouTube", "Team Haraldsen", "DailyBase"],
  authors: [{ name: "Joachim Haraldsen", url: "https://www.noobwork.no" }],
  creator: "Joachim Haraldsen",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Noobwork | Joachim Haraldsen",
    description: "Premium fitness and lifestyle creator brand. Training, personal development, and gaming heritage, documented from Seoul.",
    url: "https://www.noobwork.no",
    siteName: "Noobwork",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noobwork | Joachim Haraldsen",
    description: "Premium fitness and lifestyle creator brand. Training, personal development, and gaming heritage, documented from Seoul.",
    creator: "@noobwork",
  },
  other: {
    "theme-color": "#2C3930",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newake.variable} scroll-smooth`}>
      <body className={inter.className}>
        <JsonLd />
        <SkipToContent />
        <MouseEffects />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
