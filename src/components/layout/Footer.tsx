import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="footer-shell">
      <div className="footer-shell__inner">
        <div className="footer-brand">
          <Logo variant="monogram" className="site-logo--nav" />
          <span className="footer-brand__name">Noobwork</span>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Noobwork. All rights reserved.</p>
        <p className="footer-copy footer-copy--subtle">Built in Tokyo</p>
      </div>
    </footer>
  );
}
