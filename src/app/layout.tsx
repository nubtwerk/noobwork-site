import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import SkipToContent from "@/components/layout/SkipToContent";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newake = localFont({
  src: "../fonts/NewakeFont-Demo.otf",
  variable: "--font-newake",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noobwork — Joachim Haraldsen | Tokyo Lifestyle, Personal Development, Gaming Heritage",
  description: "Premium lifestyle creator brand by Joachim Haraldsen. Tokyo lifestyle, personal development, and gaming heritage. Founded from Norway's largest gaming YouTube channel.",
  openGraph: {
    title: "Noobwork — Joachim Haraldsen",
    description: "Premium lifestyle creator brand. Tokyo lifestyle, personal development, and gaming heritage.",
    url: "https://www.noobwork.no",
    siteName: "Noobwork",
    images: [
      {
        url: "https://www.noobwork.no/joachim.jpg",
        width: 500,
        height: 600,
        alt: "Joachim Haraldsen - Noobwork",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noobwork — Joachim Haraldsen",
    description: "Premium lifestyle creator brand. Tokyo lifestyle, personal development, and gaming heritage.",
    images: ["https://www.noobwork.no/joachim.jpg"],
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
        {children}
      </body>
    </html>
  );
}
