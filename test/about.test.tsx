import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "@/components/sections/About";

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

describe("About", () => {
  it("renders the section heading", () => {
    render(<About />);
    expect(screen.getByText("Joachim")).toBeInTheDocument();
  });

  it("renders key biographical details", () => {
    render(<About />);
    expect(screen.getByText(/Joachim Haraldsen/)).toBeInTheDocument();
    expect(screen.getByText(/Heroic Group/)).toBeInTheDocument();
    expect(screen.getByText(/200,000 subscribers/)).toBeInTheDocument();
    expect(screen.getByText(/\$25 million/)).toBeInTheDocument();
  });

  it("has the about section id", () => {
    const { container } = render(<About />);
    expect(container.querySelector("#about")).toBeInTheDocument();
  });
});
