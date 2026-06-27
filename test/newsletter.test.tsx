import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Newsletter from "@/components/sections/Newsletter";

describe("Newsletter", () => {
  it("renders the editorial heading and CTA link", () => {
    render(<Newsletter />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Noobwork is back" })
    ).toBeInTheDocument();
    const cta = screen.getByText("Subscribe on YouTube");
    expect(cta.closest("a")).toHaveAttribute("href", "https://www.youtube.com/@Noobworkify");
    expect(cta.closest("a")).toHaveAttribute("target", "_blank");
  });
});
