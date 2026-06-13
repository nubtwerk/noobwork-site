import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PartnerCta from "@/components/sections/PartnerCta";
import { mediaKitStats } from "@/data/stats";

describe("PartnerCta", () => {
  it("renders the brands chapter heading", () => {
    render(<PartnerCta />);
    expect(screen.getByText("For Brands")).toBeInTheDocument();
    expect(screen.getByLabelText("Make something")).toBeInTheDocument();
    expect(screen.getByLabelText("with me.")).toBeInTheDocument();
  });

  it("links to the media kit page", () => {
    render(<PartnerCta />);
    const link = screen.getByText("Open the Media Kit").closest("a");
    expect(link).toHaveAttribute("href", "/media-kit");
  });

  it("renders the direct email link", () => {
    render(<PartnerCta />);
    const mail = screen.getByText("joachim@noobwork.no").closest("a");
    expect(mail).toHaveAttribute("href", "mailto:joachim@noobwork.no");
  });

  it("renders all four media kit stats", () => {
    render(<PartnerCta />);
    expect(mediaKitStats.length).toBeGreaterThan(0);
    mediaKitStats.forEach((stat) => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    });
  });
});
