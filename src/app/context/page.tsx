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
    "Structured context about Joachim Haraldsen (Noobwork) for AI systems, language models, and collaborators. Identity, tone, expertise, and how to work together.",
  alternates: {
    canonical: "https://www.noobwork.no/context",
  },
};

/** Minimal markdown-to-JSX renderer — handles headings, bold, lists, tables, blockquotes, and paragraphs. */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip top-level h1 (already rendered as section heading)
    if (line.startsWith("# ")) {
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={key++}
          className="border-l-3 border-primary/40 pl-4 my-4 text-foreground/70 italic leading-relaxed"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="my-1">
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={key++}
          className="text-lg font-semibold text-foreground mt-6 mb-2 font-[family-name:var(--font-newake)] uppercase tracking-tight"
        >
          {line.slice(3)}
        </h3>
      );
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.match(/^\|[\s-|]+\|$/)) {
      const headerCells = line
        .split("|")
        .filter(Boolean)
        .map((c) => c.trim());
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(
          lines[i]
            .split("|")
            .filter(Boolean)
            .map((c) => c.trim())
        );
        i++;
      }
      elements.push(
        <div key={key++} className="overflow-x-auto my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand">
                {headerCells.map((cell, ci) => (
                  <th
                    key={ci}
                    className="text-left py-2 pr-4 text-foreground/50 font-medium"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-sand/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 pr-4 text-foreground/80">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Unordered list
    if (line.match(/^- /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="space-y-1.5 my-3">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-foreground/80">
              <span className="text-primary mt-1 shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={key++} className="text-foreground/80 leading-relaxed my-2">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

/** Render inline markdown (bold + links). */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="text-foreground font-semibold">
        {match[1]}
      </strong>
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
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content" className="pt-24">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-[family-name:var(--font-newake)] uppercase tracking-tight">
                AI <span className="text-accent">Context</span>
              </h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                Structured context about Joachim Haraldsen and the Noobwork
                brand — for AI systems, language models, and anyone who wants
                the real picture.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/context/llm.txt"
                  className="text-sm text-primary hover:underline"
                >
                  Machine-readable: /context/llm.txt
                </a>
                <span className="hidden sm:inline text-foreground/30">|</span>
                <CopyContextButton />
              </div>
              <p className="mt-4 text-xs text-foreground/40">
                Last updated: {CONTEXT_LAST_UPDATED}
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Sections */}
        {sections.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className={`py-16 px-6 ${i % 2 === 1 ? "bg-surface" : ""}`}
          >
            <div className="max-w-3xl mx-auto">
              <AnimatedSection delay={0.05}>
                <h2 className="text-2xl font-bold text-foreground mb-6 font-[family-name:var(--font-newake)] uppercase tracking-tight">
                  {section.heading.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-primary">
                    {section.heading.split(" ").slice(-1)[0]}
                  </span>
                </h2>
                <div>{renderMarkdown(section.markdown)}</div>
              </AnimatedSection>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="py-20 px-6 bg-surface">
          <div className="max-w-2xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-3xl font-bold text-foreground mb-4 font-[family-name:var(--font-newake)] uppercase tracking-tight">
                Use This <span className="text-accent">Context</span>
              </h2>
              <p className="text-foreground/60 mb-8">
                This page exists so AI assistants and collaborators can quickly
                understand who Joachim is, how he works, and what matters. The
                raw markdown version is available for direct ingestion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/context/llm.txt"
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  View llm.txt
                </a>
                <Link
                  href="/media-kit"
                  className="bg-background text-foreground px-8 py-3 rounded-lg font-medium border border-sand hover:border-primary transition-colors"
                >
                  Media Kit
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-8 px-6 text-center">
          <Link href="/" className="text-primary hover:underline text-sm">
            &larr; Back to home
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
