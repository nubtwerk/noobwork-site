import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ContentPillars from "@/components/sections/ContentPillars";

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

describe("ContentPillars", () => {
  it("renders all three pillar titles", () => {
    render(<ContentPillars />);
    expect(screen.getByText("Lifestyle")).toBeInTheDocument();
    expect(screen.getByText("Personal Development")).toBeInTheDocument();
    expect(screen.getByText("Gaming Heritage")).toBeInTheDocument();
  });

  it("renders section heading", () => {
    render(<ContentPillars />);
    expect(screen.getByText("Content Pillars")).toBeInTheDocument();
  });

  it("renders numbered indicators", () => {
    render(<ContentPillars />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });
});
