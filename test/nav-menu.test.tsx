import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Nav from "@/components/layout/Nav";
vi.mock("next/navigation", () => ({ usePathname: () => "/media-kit" }));

describe("mobile navigation keyboard dismissal", () => {
  it("closes with Escape and returns focus to its toggle", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const menuLink = document.querySelector<HTMLAnchorElement>(".nav-mobile-dropdown a")!;
    menuLink.focus();
    fireEvent.keyDown(document, { key: "Escape" });
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
    expect(document.querySelector(".nav-mobile-dropdown")).not.toBeInTheDocument();
  });
});
