"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 220);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/#about", label: "About" },
    { href: "/#work", label: "Work" },
    { href: "/#connect", label: "Connect" },
    { href: "/context", label: "Context" },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 border-b backdrop-blur-sm transition-colors duration-300 ${
        isScrolled
          ? "bg-background/95 border-sand shadow-sm"
          : "bg-transparent border-background/20"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" onClick={(e) => { if (window.location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className="cursor-pointer text-xl">
          <Logo variant="wordmark" className={isScrolled ? "text-primary" : "text-background"} />
        </Link>
        <div className={`hidden sm:flex items-center gap-6 text-sm font-medium transition-colors ${isScrolled ? "text-foreground/70" : "text-background/90"}`}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={isScrolled ? "hover:text-primary transition-colors" : "hover:text-background transition-colors"}>{link.label}</Link>
          ))}
          <Link
            href="/media-kit"
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              isScrolled
                ? "bg-primary text-background hover:bg-primary-hover"
                : "border border-background/50 text-background hover:bg-background/10"
            }`}
          >
            Media Kit
          </Link>
        </div>
        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          className={`sm:hidden p-2 transition-colors ${isScrolled ? "text-foreground" : "text-background"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className={`sm:hidden border-t px-6 py-4 space-y-3 ${isScrolled ? "bg-background/95 border-sand" : "bg-primary/95 border-background/20"}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm font-medium py-2 ${isScrolled ? "text-foreground/70 hover:text-primary" : "text-background/90 hover:text-background"}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/media-kit"
            className={`block text-sm font-medium py-2 ${isScrolled ? "text-primary" : "text-background"}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Media Kit
          </Link>
        </div>
      )}
    </nav>
  );
}
