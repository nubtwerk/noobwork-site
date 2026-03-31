import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section site-section--dark not-found-section">
          <div className="shell-inner not-found-content">
            <p className="not-found-code">404</p>
            <p className="not-found-message">
              This page doesn&apos;t exist. Maybe it never did.
            </p>
            <Link href="/" className="btn btn--primary not-found-cta">
              Back to Noobwork
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
