import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TypeMarquee from "@/components/ui/TypeMarquee";

describe("TypeMarquee", () => {
  it("renders every item in the visible group", () => {
    render(<TypeMarquee items={["Fitness", "Seoul"]} />);
    expect(screen.getAllByText("Fitness").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Seoul").length).toBeGreaterThanOrEqual(1);
  });

  it("exposes the items as a single accessible label", () => {
    render(<TypeMarquee items={["Fitness", "Personal Development", "Seoul"]} />);
    const marquee = screen.getByRole("img");
    expect(marquee).toHaveAttribute(
      "aria-label",
      "Fitness, Personal Development, Seoul"
    );
  });

  it("hides the duplicate loop group from assistive tech", () => {
    const { container } = render(<TypeMarquee items={["Fitness"]} variant="outline" duration={42} />);
    const groups = container.querySelectorAll(".type-marquee__group");
    expect(groups.length).toBe(2);
    expect(groups[0]).not.toHaveAttribute("aria-hidden");
    expect(groups[1]).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".type-marquee--outline")).toBeInTheDocument();
    expect(container.querySelector(".type-marquee__track")).toHaveStyle({
      animationDuration: "42s",
    });
  });
});
