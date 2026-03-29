import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { loadContextSections, CONTEXT_LAST_UPDATED } from "@/lib/load-context";
import CopyContextButton from "./CopyContextButton";

export const metadata: Metadata = {
  title: "AI Context - Noobwork | Joachim Haraldsen",
  description:
    "The source-of-truth context page for Joachim Haraldsen and Noobwork, built for AI systems, researchers, recruiters, and collaborators who need the accurate version.",
  alternates: {
    canonical: "https://www.noobwork.no/context",
  },
};

/** Minimal markdown-to-JSX renderer, handles headings, bold, lists, tables, blockquotes, and paragraphs. */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} className="context-quote">
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="my-1">
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={key++} className="context-subheading">
          {line.slice(3)}
        </h3>,
      );
      i++;
      continue;
    }

    if (line.includes("|") && lines[i + 1]?.match(/^\|[\s-|]+\|$/)) {
      const headerCells = line
        .split("|")
        .filter(Boolean)
        .map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(
          lines[i]
            .split("|")
            .filter(Boolean)
            .map((c) => c.trim()),
        );
        i++;
      }
      elements.push(
        <div key={key++} className="overflow-x-auto my-4">
          <table className="context-table">
            <thead>
              <tr className="context-table__row context-table__row--head">
                {headerCells.map((cell, ci) => (
                  <th key={ci} className="context-table__head">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="context-table__row">
                  {row.map((cell, ci) => (
                    <td key={ci} className="context-table__cell">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.match(/^- /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="context-list">
          {items.map((item, ii) => (
            <li key={ii} className="context-list__item">
              <span className="context-list__marker" aria-hidden="true">
                *
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    elements.push(
      <p key={key++} className="context-paragraph">
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return elements;
}

/** Render inline markdown (bold only). */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="text-foreground font-semibold">
        {match[1]}
      </strong>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}

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
