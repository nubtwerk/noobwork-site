import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import { House, Leaf } from "@phosphor-icons/react/dist/ssr";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newake = localFont({
  src: "../fonts/NewakeFont-Demo.otf",
  variable: "--font-newake",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plants.noobwork.no"),
  title: {
    default: "Plants | Noobwork",
    template: "%s | Plants",
  },
  description:
    "Apartment plant collection — watering schedule, care guides, and health check-ins.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Plants",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newake.variable}`}>
      <body className={inter.className}>
        <div className="mx-auto min-h-dvh max-w-[var(--site-max-width)] px-[var(--site-gutter)] pb-24 pt-6">
          <AppHeader />
          <main>{children}</main>
        </div>
        <nav
          className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-background/95 backdrop-blur-md"
          aria-label="Primary"
        >
          <div className="mx-auto flex max-w-[var(--site-max-width)] justify-around px-4 py-3">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 text-xs font-medium text-foreground/70 no-underline hover:text-primary"
            >
              <House size={22} weight="duotone" aria-hidden />
              Today
            </Link>
            <Link
              href="/plants"
              className="flex flex-col items-center gap-1 text-xs font-medium text-foreground/70 no-underline hover:text-primary"
            >
              <Leaf size={22} weight="duotone" aria-hidden />
              All plants
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
