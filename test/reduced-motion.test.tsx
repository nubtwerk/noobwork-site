import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SmoothScroll from "@/components/ui/SmoothScroll";

// vi.mock is hoisted — factory must not reference outer variables.
vi.mock("lenis", () => ({
  default: vi.fn(() => ({ raf: vi.fn(), destroy: vi.fn() })),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

// ── AnimatedSection ──────────────────────────────────────────────────────────

describe("AnimatedSection (reduced-motion)", () => {
  it("renders a plain div with no motion inline styles when reduced-motion is on", () => {
    stubReducedMotion(true);
    const { container } = render(
      <AnimatedSection className="my-class">
        <span>Hello</span>
      </AnimatedSection>
    );
    // Should be a plain div, not a motion.div (motion adds inline opacity style on init)
    const div = container.firstChild as HTMLElement;
    expect(div.tagName).toBe("DIV");
    expect(div.style.opacity).toBe("");
    expect(div.textContent).toBe("Hello");
  });
});

// ── ScrollProgress ───────────────────────────────────────────────────────────

describe("ScrollProgress (reduced-motion)", () => {
  it("renders nothing when reduced-motion is on", () => {
    stubReducedMotion(true);
    const { container } = render(<ScrollProgress />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an element with class scroll-progress when reduced-motion is off", () => {
    stubReducedMotion(false);
    const { container } = render(<ScrollProgress />);
    expect(container.querySelector(".scroll-progress")).not.toBeNull();
  });
});

// ── SmoothScroll ─────────────────────────────────────────────────────────────

describe("SmoothScroll (reduced-motion)", () => {
  it("never constructs Lenis when reduced-motion is on", async () => {
    const { default: MockLenis } = await import("lenis");
    vi.mocked(MockLenis).mockClear();

    stubReducedMotion(true);
    render(<SmoothScroll />);
    expect(vi.mocked(MockLenis)).not.toHaveBeenCalled();
  });

  it("constructs Lenis and destroys it on unmount when reduced-motion is off", async () => {
    const { default: MockLenis } = await import("lenis");
    const destroyFn = vi.fn();
    const rafFn = vi.fn();
    vi.mocked(MockLenis).mockImplementation(
      function (this: Record<string, unknown>) {
        this.raf = rafFn;
        this.destroy = destroyFn;
      } as never
    );
    vi.mocked(MockLenis).mockClear();

    stubReducedMotion(false);
    const { unmount } = render(<SmoothScroll />);
    expect(vi.mocked(MockLenis)).toHaveBeenCalledTimes(1);
    unmount();
    expect(destroyFn).toHaveBeenCalledTimes(1);
  });
});
