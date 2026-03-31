import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderMarkdown } from "@/lib/render-markdown";

function RenderMarkdown({ md }: { md: string }) {
  return <div>{renderMarkdown(md)}</div>;
}

describe("renderMarkdown", () => {
  it("renders paragraphs", () => {
    render(<RenderMarkdown md="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders bold text", () => {
    render(<RenderMarkdown md="This is **bold** text" />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });

  it("skips top-level headings", () => {
    const md = ["# Top Level", "Content here"].join("\n");
    const { container } = render(<RenderMarkdown md={md} />);
    expect(container.querySelector("h1")).not.toBeInTheDocument();
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("renders h2 as h3 subheadings", () => {
    render(<RenderMarkdown md="## Subheading" />);
    const heading = screen.getByText("Subheading");
    expect(heading.tagName).toBe("H3");
    expect(heading.className).toBe("context-subheading");
  });

  it("renders unordered lists", () => {
    const md = ["- Item one", "- Item two"].join("\n");
    const { container } = render(<RenderMarkdown md={md} />);
    const items = container.querySelectorAll(".context-list__item");
    expect(items.length).toBe(2);
  });

  it("renders blockquotes", () => {
    const { container } = render(<RenderMarkdown md="> Quote line" />);
    expect(container.querySelector("blockquote")).toBeInTheDocument();
  });

  it("renders tables", () => {
    const md = ["| Name | Role |", "|------|------|", "| Joachim | Founder |"].join("\n");
    const { container } = render(<RenderMarkdown md={md} />);
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(screen.getByText("Joachim")).toBeInTheDocument();
    expect(screen.getByText("Founder")).toBeInTheDocument();
  });

  it("skips blank lines without extra output", () => {
    const md = ["Line 1", "", "Line 2"].join("\n");
    const { container } = render(<RenderMarkdown md={md} />);
    const paragraphs = container.querySelectorAll(".context-paragraph");
    expect(paragraphs.length).toBe(2);
  });
});
