import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Work from "@/components/sections/Work";

describe("Work section", () => {
  it("splits current and past work into separate groups", () => {
    render(<Work />);
    const now = screen.getByRole("heading", { name: "Now" }).parentElement!;
    const before = screen.getByRole("heading", { name: "Before" }).parentElement!;
    expect(within(now).getByText("Noobwork")).toBeInTheDocument();
    expect(within(now).getByText("Advisory")).toBeInTheDocument();
    expect(within(now).queryByText("Heroic Group")).not.toBeInTheDocument();
    expect(within(before).getByText("Heroic Group")).toBeInTheDocument();
  });
});
