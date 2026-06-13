import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RevealText from "@/components/ui/RevealText";

describe("RevealText", () => {
  it("exposes the full text as an accessible label", () => {
    render(<RevealText text="Creator roots." />);
    expect(screen.getByLabelText("Creator roots.")).toBeInTheDocument();
  });

  it("preserves the space between words in the rendered text", () => {
    // Regression: the separating space used to live inside the inline-block
    // mask span, where trailing whitespace is trimmed, rendering "Creatorroots."
    render(<RevealText text="Creator roots." />);
    const wrapper = screen.getByLabelText("Creator roots.");
    expect(wrapper.textContent).toBe("Creator roots.");
  });

  it("renders a whitespace text node between adjacent word masks", () => {
    render(<RevealText text="Creator roots." />);
    const wrapper = screen.getByLabelText("Creator roots.");
    const masks = wrapper.querySelectorAll(".reveal-word__mask");
    expect(masks.length).toBe(2);
    const between = masks[0].nextSibling;
    expect(between?.nodeType).toBe(Node.TEXT_NODE);
    expect(between?.textContent).toBe(" ");
  });

  it("renders plain unmasked text for reduced-motion users", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { container } = render(<RevealText text="Founder scars." />);
    expect(screen.getByText("Founder scars.")).toBeInTheDocument();
    expect(container.querySelector(".reveal-word__mask")).not.toBeInTheDocument();
  });
});
