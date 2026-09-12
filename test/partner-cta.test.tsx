import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PartnerCta from "@/components/sections/PartnerCta";
import { mediaKitStats } from "@/data/stats";
import { MEDIA_KIT_HREF, MEDIA_KIT_INQUIRY_HREF } from "@/lib/constants";

describe("PartnerCta", () => {
  it("renders the brands chapter heading", () => {
    render(<PartnerCta />);
    expect(screen.getByText("For Brands")).toBeInTheDocument();
    expect(screen.getByLabelText("Make something")).toBeInTheDocument();
    expect(screen.getByLabelText("with me.")).toBeInTheDocument();
  });

  it("links explore and send CTAs to the media kit", () => {
    render(<PartnerCta />);
    expect(screen.getByText("Explore partnerships").closest("a")).toHaveAttribute("href", MEDIA_KIT_HREF);
    expect(screen.getByText("Send a brief").closest("a")).toHaveAttribute("href", MEDIA_KIT_INQUIRY_HREF);
  });

  it("does not render a separate mailto button", () => {
    render(<PartnerCta />);
    expect(screen.queryByText("joachim@noobwork.no")).not.toBeInTheDocument();
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
