import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Newsletter from "@/components/sections/Newsletter";

beforeEach(() => {
  // Mock IntersectionObserver for framer-motion viewport detection
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });

  // Mock matchMedia for reduced-motion detection
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

describe("Newsletter", () => {
  it("renders the editorial heading and CTA link", () => {
    render(<Newsletter />);
    expect(screen.getByText("Noobwork Is Back")).toBeInTheDocument();
    const cta = screen.getByText("Follow the Return");
    expect(cta.closest("a")).toHaveAttribute("href", "https://beacons.ai/noobwork");
    expect(cta.closest("a")).toHaveAttribute("target", "_blank");
  });
});
