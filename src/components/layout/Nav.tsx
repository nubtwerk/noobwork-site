"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Nav() {
  return (
    <nav aria-label="Main navigation" className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-sand">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" onClick={(e) => { if (window.location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className="cursor-pointer text-xl">
          <Logo variant="wordmark" />
        </Link>
        <div className="flex items-center gap-6 text-sm text-foreground/70 font-medium">
          <Link href="/#about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/#work" className="hover:text-primary transition-colors">Work</Link>
          <Link href="/#connect" className="hover:text-primary transition-colors">Connect</Link>
          <Link
            href="/media-kit"
            className="px-4 py-1.5 bg-primary text-white rounded-full text-sm hover:bg-primary-hover transition-colors"
          >
            Media Kit
          </Link>
        </div>
      </div>
    </nav>
  );
}

