import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SocialIcon from "@/components/ui/SocialIcon";

describe("SocialIcon", () => {
  it("renders a known icon", () => {
    const { container } = render(<SocialIcon iconName="youtube" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("returns null for an unknown icon", () => {
    const { container } = render(<SocialIcon iconName="nonexistent" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<SocialIcon iconName="mail" className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.contains("custom-class")).toBe(true);
  });
});
