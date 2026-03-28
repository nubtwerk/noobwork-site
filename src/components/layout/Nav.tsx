"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 220);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 border-b backdrop-blur-sm transition-colors duration-300 ${
        isScrolled
          ? "bg-background/95 border-sand shadow-sm"
          : "bg-transparent border-white/20"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" onClick={(e) => { if (window.location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className="cursor-pointer text-xl">
          <Logo variant="wordmark" className={isScrolled ? "text-primary" : "text-white"} />
        </Link>
        <div className={`hidden sm:flex items-center gap-6 text-sm font-medium transition-colors ${isScrolled ? "text-foreground/70" : "text-white/90"}`}>
          <Link href="/#about" className={isScrolled ? "hover:text-primary transition-colors" : "hover:text-white transition-colors"}>About</Link>
          <Link href="/#work" className={isScrolled ? "hover:text-primary transition-colors" : "hover:text-white transition-colors"}>Work</Link>
          <Link href="/#connect" className={isScrolled ? "hover:text-primary transition-colors" : "hover:text-white transition-colors"}>Connect</Link>
          <Link href="/context" className={isScrolled ? "hover:text-primary transition-colors" : "hover:text-white transition-colors"}>Context</Link>
          <Link
            href="/media-kit"
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              isScrolled
                ? "bg-primary text-white hover:bg-primary-hover"
                : "border border-white/50 text-white hover:bg-white/10"
            }`}
          >
            Media Kit
          </Link>
        </div>
        <Link
          href="/media-kit"
          className={`sm:hidden px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isScrolled
              ? "bg-primary text-white hover:bg-primary-hover"
              : "border border-white/50 text-white hover:bg-white/10"
          }`}
        >
          Media Kit
        </Link>
      </div>
    </nav>
  );
}
