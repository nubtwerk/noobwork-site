import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionHeader from "@/components/ui/SectionHeader";

describe("SectionHeader", () => {
  it("renders title with highlight text", () => {
    render(<SectionHeader title="About" highlight="Joachim" subtitle="Why Noobwork is back" />);
    expect(screen.getByText("Joachim")).toBeInTheDocument();
    expect(screen.getByText(/About/)).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<SectionHeader title="About" highlight="Joachim" subtitle="Why Noobwork is back" />);
    expect(screen.getByText("Why Noobwork is back")).toBeInTheDocument();
  });

  it("applies center class when center prop is true", () => {
    const { container } = render(
      <SectionHeader title="About" highlight="Joachim" subtitle="Sub" center />,
    );
    expect(container.querySelector(".section-heading--center")).toBeInTheDocument();
  });

  it("does not apply center class by default", () => {
    const { container } = render(
      <SectionHeader title="About" highlight="Joachim" subtitle="Sub" />,
    );
    expect(container.querySelector(".section-heading--center")).not.toBeInTheDocument();
  });

  it("applies data-shimmer to the heading", () => {
    const { container } = render(
      <SectionHeader title="About" highlight="Joachim" subtitle="Sub" />,
    );
    expect(container.querySelector("[data-shimmer]")).toBeInTheDocument();
  });
});
