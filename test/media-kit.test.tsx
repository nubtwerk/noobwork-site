import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MediaKit from "@/app/media-kit/page";
import { mediaKitStats } from "@/data/stats";

describe("MediaKit page", () => {
  it("renders the cinematic hero heading", () => {
    render(<MediaKit />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Work with Noobwork" })
    ).toBeInTheDocument();
    expect(screen.getByText("Media Kit / Partnerships")).toBeInTheDocument();
  });

  it("renders media kit stats", () => {
    render(<MediaKit />);
    mediaKitStats.forEach((stat) => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    });
  });

  it("renders primary email CTA", () => {
    render(<MediaKit />);
    const email = screen.getByText("Get in Touch").closest("a");
    expect(email).toHaveAttribute("href", "mailto:joachim@noobwork.no");
  });

  it("links back to the homepage", () => {
    render(<MediaKit />);
    const back = screen.getByText("← Back to home").closest("a");
    expect(back).toHaveAttribute("href", "/");
  });
});
