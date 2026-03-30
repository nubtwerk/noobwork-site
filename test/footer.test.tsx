import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders brand name and nav links", () => {
    render(<Footer />);
    expect(screen.getByText("Noobwork")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Media Kit")).toBeInTheDocument();
    expect(screen.getByText("Context")).toBeInTheDocument();
  });

  it("renders copyright with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Noobwork. All rights reserved.`)).toBeInTheDocument();
  });
});
