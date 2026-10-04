import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/advisory" }));

import Advisory, { metadata } from "@/app/advisory/page";
import { profileFacts } from "@/data/profile-facts";
import { ADVISORY_MAILTO } from "@/lib/constants";

describe("Advisory page", () => {
  it("uses the contour map hero instead of the photo backdrop", () => {
    const { container } = render(<Advisory />);
    const hero = container.querySelector("section.contour-hero");
    expect(hero?.querySelector("canvas.contour-field")).toHaveAttribute("aria-hidden", "true");
    expect(hero?.querySelector("img")).toBeNull();
  });

  it("says which roles Joachim is open to", () => {
    render(<Advisory />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("aria-label", "Built it. Now I advise.");
    expect(screen.getByText(/open to advisory, board and select operator roles/i)).toBeInTheDocument();
    expect(String(metadata.description)).toMatch(/advisory, board and select operator roles/);
  });

  it("lists the three ways to work", () => {
    render(<Advisory />);
    for (const title of ["Advisor", "Board", "Operator roles"]) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }
  });

  it("derives the subscriber figure and links to email", () => {
    render(<Advisory />);
    expect(screen.getByText(new RegExp(profileFacts.subscribers.long.replace("+", "\\+")))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", ADVISORY_MAILTO);
    expect(screen.getByRole("link", { name: "Email joachim@noobwork.no" })).toHaveAttribute("href", ADVISORY_MAILTO);
  });

  it("marks Advisory as the current page in the nav", () => {
    render(<Advisory />);
    const current = screen.getAllByRole("link", { name: "Advisory" }).filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.length).toBeGreaterThan(0);
  });
});
