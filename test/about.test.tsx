import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "@/components/sections/About";
import { profileFacts } from "@/data/profile-facts";

describe("About", () => {
  it("renders the chapter heading", () => {
    render(<About />);
    expect(screen.getByText("01 / The Story")).toBeInTheDocument();
    expect(screen.getByLabelText("Creator roots.")).toBeInTheDocument();
  });

  it("renders key biographical details", () => {
    render(<About />);
    expect(screen.getByText(/Joachim Haraldsen/)).toBeInTheDocument();
    expect(screen.getByText(/Heroic Group/)).toBeInTheDocument();
    expect(
      screen.getByText(`${profileFacts.subscribers.long} subscribers`)
    ).toBeInTheDocument();
    expect(screen.getByText(/\$25 million/)).toBeInTheDocument();
  });

  it("has the about section id", () => {
    const { container } = render(<About />);
    expect(container.querySelector("#about")).toBeInTheDocument();
  });
});
