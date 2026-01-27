import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
        url: "/joachim.jpg",
        width: 500,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joachim Haraldsen - Creator, Entrepreneur, Esports Pioneer",
    description: "Norwegian creator based in Tokyo. Building at the intersection of gaming, technology, and entertainment.",
    images: ["/joachim.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
