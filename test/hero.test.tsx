import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "@/components/sections/Hero";
import { MEDIA_KIT_INQUIRY_HREF } from "@/lib/constants";
import { profileFacts } from "@/data/profile-facts";

describe("Hero", () => {
  it("renders the poster headline with an accessible label", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("aria-label", "Noobwork is back");
    expect(screen.getByText("NOOBWORK.")).toBeInTheDocument();
    expect(screen.getByText("IS BACK.")).toBeInTheDocument();
  });

  it("renders the primary CTAs", () => {
    render(<Hero />);
    const partner = screen.getByText("Partner With Me").closest("a");
    expect(partner).toHaveAttribute("href", MEDIA_KIT_INQUIRY_HREF);
    const watch = screen.getByText("Watch the Latest").closest("a");
    expect(watch).toHaveAttribute("href", "/#reel");
  });

  it("renders the stat strip and topic marquee", () => {
    render(<Hero />);
    // Derive the volatile figures from profile-facts so the test is a real
    // single-sourcing assertion, not a second place the numbers can drift.
    expect(
      screen.getByText(profileFacts.subscribers.short)
    ).toBeInTheDocument();
    expect(screen.getByText(profileFacts.totalViews.short)).toBeInTheDocument();
    expect(screen.getByText("Forbes")).toBeInTheDocument();
    expect(screen.getByText("13 yrs")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Fitness, Personal Development, Gaming Heritage, Seoul",
      })
    ).toBeInTheDocument();
  });
});
