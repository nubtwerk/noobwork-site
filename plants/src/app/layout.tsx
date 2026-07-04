import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import { House, Leaf, Plus } from "@phosphor-icons/react/dist/ssr";
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
  description: "Apartment plant dashboard — watering timers, care info, and photo check-ins.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Plants",
  },
};

export const viewport: Viewport = {
  themeColor: "#2C3930",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newake.variable}`}>
      <body className={inter.className}>
        <div className="mx-auto min-h-dvh max-w-[var(--site-max-width)] px-[var(--site-gutter)] pb-24 pt-6">
          <header className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" className="group flex items-center gap-2 no-underline">
              <Leaf className="text-primary" size={28} weight="duotone" aria-hidden />
              <div>
                <p className="font-display m-0 text-lg uppercase tracking-tight text-primary">
                  Plants
                </p>
                <p className="m-0 text-xs text-foreground/60">noobwork · home</p>
              </div>
            </Link>
            <Link href="/plants/new" className="btn-primary no-underline">
              <Plus size={18} weight="bold" aria-hidden />
              Add
            </Link>
          </header>
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
