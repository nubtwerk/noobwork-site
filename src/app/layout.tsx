import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import SkipToContent from "@/components/layout/SkipToContent";
import MouseEffects from "@/components/ui/MouseEffects";
import SmoothScroll from "@/components/ui/SmoothScroll";
import ScrollProgress from "@/components/ui/ScrollProgress";
import JsonLd from "@/components/JsonLd";
import PartnershipAnalytics from "@/components/ui/PartnershipAnalytics";
import { SITE_DESCRIPTION, socialMetadata } from "@/lib/site-metadata";
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
  description: SITE_DESCRIPTION,
  keywords: ["Noobwork", "Joachim Haraldsen", "fitness", "training", "nutrition", "Seoul", "personal development", "gaming", "content creator", "YouTube", "Team Haraldsen", "DailyBase"],
  authors: [{ name: "Joachim Haraldsen", url: "https://www.noobwork.no" }],
  creator: "Joachim Haraldsen",
  alternates: {
    canonical: "/",
    // Advertise the AI-readable context layer to agents that look for it.
    types: {
      "text/markdown": [
        { url: "/llms.txt", title: "LLM-readable context (index)" },
      ],
    },
  },
  ...socialMetadata("Noobwork | Joachim Haraldsen", SITE_DESCRIPTION),
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
    <html lang="en" className={`${inter.variable} ${newake.variable}`}>
      <body className={inter.className}>
        <noscript>
          {/* Motion components SSR with hidden initial styles; without JS
              nothing would ever reveal. Force everything visible. */}
          <style>{`[style*="opacity:0"],[style*="opacity: 0"],.poster-hero__line{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <JsonLd includeVideos={false} />
        <SkipToContent />
        <SmoothScroll />
        <ScrollProgress />
        <MouseEffects />
        {children}
        <Analytics />
        <PartnershipAnalytics />
      </body>
    </html>
  );
}
