import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section site-section--dark" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <div className="shell-inner" style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-family-display)", fontSize: "clamp(5rem, 15vw, 10rem)", lineHeight: 0.9, color: "var(--color-sand)", letterSpacing: "-0.04em", textTransform: "uppercase" }}>
              404
            </p>
            <p style={{ marginTop: "1rem", color: "rgba(236, 219, 191, 0.7)", fontSize: "1.1rem", lineHeight: 1.6 }}>
              This page doesn&apos;t exist. Maybe it never did.
            </p>
            <Link
              href="/"
              className="btn btn--primary"
              style={{ marginTop: "2rem", display: "inline-flex" }}
            >
              Back to Noobwork
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
