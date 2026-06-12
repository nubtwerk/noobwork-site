import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ParallaxImage from "@/components/ui/ParallaxImage";

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

describe("ParallaxImage", () => {
  it("renders the image with its alt text and caption", () => {
    render(
      <ParallaxImage
        src="/atmosphere/atmosphere-seoul-street.jpg"
        alt="Quiet hanok backstreet in Seoul at first light"
        width={900}
        height={1200}
        caption="Seoul. The new home base."
      />
    );
    expect(
      screen.getByAltText("Quiet hanok backstreet in Seoul at first light")
    ).toBeInTheDocument();
    expect(screen.getByText("Seoul. The new home base.")).toBeInTheDocument();
  });

  it("omits the figcaption when no caption is provided", () => {
    const { container } = render(
      <ParallaxImage
        src="/atmosphere/atmosphere-gym-dawn.jpg"
        alt="Empty gym at dawn"
        width={929}
        height={1161}
      />
    );
    expect(container.querySelector("figcaption")).not.toBeInTheDocument();
  });
});
