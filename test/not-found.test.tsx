import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("NotFound (404 page)", () => {
  it("renders the 404 heading and back link", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Back to Noobwork")).toBeInTheDocument();
    expect(screen.getByText("Back to Noobwork").closest("a")).toHaveAttribute("href", "/");
  });
});
