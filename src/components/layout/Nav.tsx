"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Logo from "@/components/ui/Logo";

export default function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
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
    <nav aria-label="Main navigation" className={`nav-shell${scrolled ? " nav-shell--scrolled" : ""}`}>
      <div className="nav-shell__inner">
        <Link
          href="/"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="nav-brand"
          aria-label="Noobwork home"
        >
          <Logo variant="wordmark" className="site-logo--nav-wordmark" />
        </Link>
        <div className="nav-links nav-links--desktop">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
          <Link
            href="/media-kit"
            className="btn btn--tertiary"
          >
            Media Kit
          </Link>
        </div>
        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          className={`nav-hamburger ${scrolled ? "nav-hamburger--scrolled" : ""}`}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
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
        <div className="nav-mobile-dropdown">
          <div className="nav-mobile-dropdown__panel">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-mobile-dropdown__link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/media-kit"
              className="nav-mobile-dropdown__link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Media Kit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
