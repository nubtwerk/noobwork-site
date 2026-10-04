import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Connect from "@/components/sections/Connect";
import { ADVISORY_HREF, MEDIA_KIT_HREF, MEDIA_KIT_INQUIRY_HREF } from "@/lib/constants";

describe("Connect", () => {
  it("renders all social links", () => {
    render(<Connect />);
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("X / Twitter")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders social links as external links", () => {
    const { container } = render(<Connect />);
    const links = container.querySelectorAll("a[target='_blank']");
    expect(links.length).toBe(5);
    links.forEach((link) => {
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });
  });

  it("has the connect section id", () => {
    const { container } = render(<Connect />);
    expect(container.querySelector("#connect")).toBeInTheDocument();
  });

  it("offers founders advisory and adds a short brand partnership line", () => {
    render(<Connect />);
    expect(screen.getByText(/early-stage startups and scale.ups/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "reach me about advisory" })).toHaveAttribute(
      "href",
      ADVISORY_HREF
    );
    expect(screen.getByRole("link", { name: "explore the media kit" })).toHaveAttribute(
      "href",
      MEDIA_KIT_HREF
    );
    expect(screen.getByRole("link", { name: "send a brief" })).toHaveAttribute(
      "href",
      MEDIA_KIT_INQUIRY_HREF
    );
  });
});
