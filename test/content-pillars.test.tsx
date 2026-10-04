import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContentPillars from "@/components/sections/ContentPillars";

describe("ContentPillars", () => {
  it("renders all four pillar titles", () => {
    render(<ContentPillars />);
    expect(screen.getByText("Training")).toBeInTheDocument();
    expect(screen.getByText("Personal Development")).toBeInTheDocument();
    expect(screen.getByText("Life in Korea")).toBeInTheDocument();
    expect(screen.getByText("Gaming Heritage")).toBeInTheDocument();
  });

  it("renders section heading", () => {
    render(<ContentPillars />);
    expect(screen.getByText("02 / Content Pillars")).toBeInTheDocument();
    expect(screen.getByText("What I Make.")).toBeInTheDocument();
  });

  it("renders numbered indicators", () => {
    render(<ContentPillars />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
  });
});
