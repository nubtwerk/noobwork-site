"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Nav() {
  return (
    <nav aria-label="Main navigation" className="nav-shell">
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
        <div className="nav-links">
          <Link href="/#about" className="nav-link">About</Link>
          <Link href="/#work" className="nav-link">Work</Link>
          <Link href="/#connect" className="nav-link">Connect</Link>
          <Link
            href="/media-kit"
            className="btn btn--tertiary"
          >
            Media Kit
          </Link>
        </div>
      </div>
    </nav>
  );
}
