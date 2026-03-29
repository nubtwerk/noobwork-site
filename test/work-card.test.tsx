import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkCard from "@/components/ui/WorkCard";

describe("WorkCard", () => {
  it("renders as a link when url is provided", () => {
    const item = {
      name: "Heroic Group",
      status: "Founder | Sold",
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
      name: "Stealth Startup",
      status: "Founder | Current",
      desc: "Coming soon.",
    };
    const { container } = render(<WorkCard item={item} />);
    expect(container.querySelector("a")).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("shows arrow icon only for linked cards", () => {
    const linked = { name: "Test", status: "Active", desc: "Desc", url: "https://example.com" };
    const unlinked = { name: "Test", status: "Active", desc: "Desc" };

    const { container: linkedContainer } = render(<WorkCard item={linked} />);
    const { container: unlinkedContainer } = render(<WorkCard item={unlinked} />);

    expect(linkedContainer.querySelector("svg")).toBeInTheDocument();
    expect(unlinkedContainer.querySelector("svg")).not.toBeInTheDocument();
  });

  it("displays the work item name and description", () => {
    const item = { name: "Blast.tv", status: "Advisor", desc: "Esports tournaments." };
    render(<WorkCard item={item} />);
    expect(screen.getByText("Blast.tv")).toBeInTheDocument();
    expect(screen.getByText("Esports tournaments.")).toBeInTheDocument();
    expect(screen.getByText("Advisor")).toBeInTheDocument();
  });
});
