import React from "react";

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

/** Minimal markdown-to-JSX renderer, handles headings, bold, lists, tables, blockquotes, and paragraphs. */
export function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip top-level headings (rendered separately)
    if (line.startsWith("# ")) {
      i++;
      continue;
    }

    // Blockquotes
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

    // Subheadings
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={key++} className="context-subheading">
          {line.slice(3)}
        </h3>,
      );
      i++;
      continue;
    }

    // Tables
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

    // Unordered lists
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

    // Blank lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraphs
    elements.push(
      <p key={key++} className="context-paragraph">
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return elements;
}
