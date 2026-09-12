import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MediaKit from "@/app/media-kit/page";
import { mediaKitStats } from "@/data/stats";
import { workViewsObservedAt } from "@/data/partnerships";

describe("MediaKit page", async () => {
  it("renders the cinematic hero heading", async () => {
    render(await MediaKit());
    expect(
      screen.getByRole("heading", { level: 1, name: "Work with Noobwork" })
    ).toBeInTheDocument();
    expect(screen.getByText("Partnerships")).toBeInTheDocument();
  });

  it("renders media kit stats", async () => {
    render(await MediaKit());
    mediaKitStats.forEach((stat) => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    });
  });

  it("renders the partnership contact form", async () => {
    render(await MediaKit());
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText(/Company \/ Brand/)).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send partnership inquiry" })).toBeInTheDocument();
    expect(document.getElementById("inquiry")).toBeInTheDocument();
  });

  it("derives the evidence date from workViewsObservedAt", async () => {
    render(await MediaKit());
    const stamp = document.querySelector(`time[datetime="${workViewsObservedAt}"]`);
    expect(stamp).toBeTruthy();
    expect(stamp).toHaveTextContent("10 September 2026");
  });

  it("links back to the homepage", async () => {
    render(await MediaKit());
    const back = screen.getByText("← Back to home").closest("a");
    expect(back).toHaveAttribute("href", "/");
  });
});
