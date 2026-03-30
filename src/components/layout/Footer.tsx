import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="footer-shell">
      <div className="footer-shell__inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo variant="monogram" className="site-logo--nav" />
            <span className="footer-brand__name">Noobwork</span>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link href="/#about" className="footer-nav__link">About</Link>
            <Link href="/#work" className="footer-nav__link">Work</Link>
            <Link href="/#connect" className="footer-nav__link">Connect</Link>
            <Link href="/media-kit" className="footer-nav__link">Media Kit</Link>
            <Link href="/context" className="footer-nav__link">Context</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">&copy; {new Date().getFullYear()} Noobwork. All rights reserved.</p>
          <p className="footer-copy footer-copy--subtle">Built in Tokyo</p>
        </div>
      </div>
    </footer>
  );
}
