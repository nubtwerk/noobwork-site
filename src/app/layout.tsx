import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SkipToContent from "@/components/layout/SkipToContent";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Joachim Haraldsen - Creator, Entrepreneur, Esports Pioneer",
  description: "Norwegian creator based in Tokyo. Building at the intersection of gaming, technology, and entertainment. Forbes featured entrepreneur.",
  openGraph: {
    title: "Joachim Haraldsen - Creator, Entrepreneur, Esports Pioneer",
    description: "Norwegian creator based in Tokyo. Building at the intersection of gaming, technology, and entertainment.",
    url: "https://www.noobwork.no",
    siteName: "Noobwork",
    images: [
      {
        url: "https://www.noobwork.no/joachim.jpg",
        width: 500,
        height: 600,
        alt: "Joachim Haraldsen - Creator and Entrepreneur",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joachim Haraldsen - Creator, Entrepreneur, Esports Pioneer",
    description: "Norwegian creator based in Tokyo. Building at the intersection of gaming, technology, and entertainment.",
    images: ["https://www.noobwork.no/joachim.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <JsonLd />
        <SkipToContent />
        {children}
      </body>
    </html>
  );
}
