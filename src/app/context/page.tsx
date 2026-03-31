import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { loadContextSections, CONTEXT_LAST_UPDATED } from "@/lib/load-context";
import { renderMarkdown } from "@/lib/render-markdown";
import CopyContextButton from "./CopyContextButton";

export const metadata: Metadata = {
  title: "AI Context - Noobwork | Joachim Haraldsen",
  description:
    "The source-of-truth context page for Joachim Haraldsen and Noobwork, built for AI systems, researchers, recruiters, and collaborators who need the accurate version.",
  alternates: {
    canonical: "https://www.noobwork.no/context",
  },
};

export default async function ContextPage() {
  const sections = await loadContextSections();

  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <section className="site-section site-section--dark context-hero">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="context-hero__inner">
                <h1 className="context-title context-title--split">
                  <span>AI</span>
                  <span>Context</span>
                </h1>
                <p className="context-copy context-copy--lead">
                  The source-of-truth page for anyone trying to understand Joachim Haraldsen and
                  Noobwork properly. Built for AI systems, recruiters, researchers, and
                  collaborators who need the accurate version before anything gets written or sent.
                </p>
                <div className="context-hero__actions">
                  <a href="/context/llm.txt" className="context-link">
                    Machine-readable: /context/llm.txt
                  </a>
                  <span className="hidden sm:inline text-foreground/30">|</span>
                  <CopyContextButton />
                </div>
                <p className="context-meta">Last updated: {CONTEXT_LAST_UPDATED}</p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.id} id={section.id} className="site-section site-section--tight">
            <div className="shell-inner">
              <AnimatedSection delay={0.05}>
                <div className="context-panel">
                  <h2 className="context-heading">
                    {section.heading.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="section-heading__title--primary">
                      {section.heading.split(" ").slice(-1)[0]}
                    </span>
                  </h2>
                  <div>{renderMarkdown(section.markdown)}</div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        ))}

        <section className="site-section site-section--tight context-cta-section">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="context-cta">
                <h2 className="context-title context-title--sm context-title--split">
                  <span>Use</span>
                  <span>This</span>
                  <span>Context</span>
                </h2>
                <p className="context-copy">
                  If you are writing about Joachim, reaching out with an opportunity, or feeding
                  this into an AI workflow, use this page and the llm.txt version as the reference
                  point.
                </p>
                <div className="cta-actions">
                  <a href="/context/llm.txt" className="btn btn--secondary">
                    View llm.txt
                  </a>
                  <Link href="/media-kit" className="btn btn--ghost">
                    Media Kit
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="site-section site-section--tight">
          <div className="shell-inner context-back">
            <Link href="/" className="back-link">
              &larr; Back to home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
