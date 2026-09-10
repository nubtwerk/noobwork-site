import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { animate } from "motion/react";
vi.mock("motion/react", async (original) => ({ ...await original<object>(), useInView: () => true, animate: vi.fn(() => ({ stop: vi.fn() })) }));
import CountUp from "@/components/ui/CountUp";

describe("CountUp server fallback", () => {
  it("renders the real metric without JavaScript", () => {
    const html = renderToStaticMarkup(<CountUp target={1800} suffix="+" />);
    expect(html).toContain("1,800+");
    expect(html).not.toMatch(/>0\+</);
  });
});

describe("CountUp reduced motion", () => {
  it("keeps the actual metric without starting an animation when motion is reduced", () => {
    const media = vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
    vi.mocked(animate).mockClear();
    const { container } = render(<CountUp target={1800} suffix="+" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("1,800+");
    expect(animate).not.toHaveBeenCalled();
    cleanup();
    media.mockRestore();
  });
});
