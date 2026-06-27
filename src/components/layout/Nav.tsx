"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Logo from "@/components/ui/Logo";
import { useActiveSection } from "@/hooks/useActiveSection";
import { NAV_SCROLL_THRESHOLD, NAV_SECTIONS } from "@/lib/constants";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const sectionIds = useMemo(
    () => (isHome ? NAV_SECTIONS.map((link) => link.id) : []),
    [isHome]
  );
  const activeSection = useActiveSection(sectionIds);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass = (sectionId: string) =>
    `nav-link${activeSection === sectionId ? " nav-link--active" : ""}`;

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
          <Logo variant="wordmark" className="nav-logo" />
        </Link>
        <div className="nav-links nav-links--desktop">
          {NAV_SECTIONS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(link.id)}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/media-kit"
            className="btn btn--tertiary"
          >
            Partner With Me
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
            {NAV_SECTIONS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-mobile-dropdown__link${activeSection === link.id ? " nav-mobile-dropdown__link--active" : ""}`}
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
              Partner With Me
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
