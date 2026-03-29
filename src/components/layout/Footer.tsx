import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="footer-shell">
      <div className="footer-shell__inner">
        <div>
          <Logo variant="monogram" className="site-logo--nav" />
        </div>
        <p>&copy; {new Date().getFullYear()} Noobwork. All rights reserved.</p>
        <p>Built in Tokyo</p>
      </div>
    </footer>
  );
}
