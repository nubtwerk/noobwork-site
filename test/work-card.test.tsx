import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkCard from "@/components/ui/WorkCard";

describe("WorkCard", () => {
  it("renders as a link when url is provided", () => {
    const item = {
      name: "Heroic Group",
      role: "Founder",
      phase: "Sold",
      desc: "An esports org.",
      url: "https://heroic.gg",
    };
    const { container } = render(<WorkCard item={item} />);
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://heroic.gg");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders as a div when no url is provided", () => {
    const item = {
      name: "Advisory & Angel",
      role: "Advisor & Angel",
      phase: "Current",
      desc: "Selective advisory work.",
    };
    const { container } = render(<WorkCard item={item} />);
    expect(container.querySelector("a")).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("adds linked-card styling only for linked cards", () => {
    const linked = { name: "Test", role: "Active", desc: "Desc", url: "https://example.com" };
    const unlinked = { name: "Test", role: "Active", desc: "Desc" };

    const { container: linkedContainer } = render(<WorkCard item={linked} />);
    const { container: unlinkedContainer } = render(<WorkCard item={unlinked} />);

    expect(linkedContainer.querySelector("a.work-card--linked")).toBeInTheDocument();
    expect(unlinkedContainer.querySelector(".work-card--linked")).not.toBeInTheDocument();
  });

  it("displays the work item name and description", () => {
    const item = { name: "Blast.tv", role: "Advisor", desc: "Esports tournaments." };
    render(<WorkCard item={item} />);
    expect(screen.getByText("Blast.tv")).toBeInTheDocument();
    expect(screen.getByText("Esports tournaments.")).toBeInTheDocument();
    expect(screen.getByText("Advisor")).toBeInTheDocument();
  });
});
