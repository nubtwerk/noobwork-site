import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Season, { metadata } from "@/app/season/page";
import sitemap from "@/app/sitemap";
import { season, seasonSpots } from "@/data/season";
import { parseContactPayload } from "@/lib/contact";

const page = (query: Record<string, string> = {}) => Season({ searchParams: Promise.resolve(query) });

describe("Season page", () => {
  it("renders the hero and every spot with a claim link", async () => {
    render(await page());
    expect(screen.getByRole("heading", { level: 1, name: "One year. Tested." })).toBeInTheDocument();
    for (const spot of seasonSpots) {
      expect(screen.getByRole("heading", { level: 3, name: spot.title })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: `Claim this spot : ${spot.title}` })).toHaveAttribute("href", `/season?spot=${spot.id}#inquiry`);
    }
  });

  it("puts only banner-board spots on the board", async () => {
    render(await page());
    const board = screen.getByRole("list", { name: "Banner board" });
    expect(board.querySelectorAll("li")).toHaveLength(seasonSpots.filter((spot) => spot.board).length);
  });

  it("never names a sponsor that has not been recorded as sold", () => {
    for (const spot of seasonSpots) {
      if (spot.sponsor) expect(spot.status).toBe("sold");
    }
  });

  it("preselects the season format and prefills the chosen spot", async () => {
    render(await page({ spot: "banner-2" }));
    expect(screen.getByLabelText("Partnership format")).toHaveValue("season");
    expect(screen.getByLabelText("Message")).toHaveValue("I'd like to discuss Banner spot 2 (Q1 2027, renewable each quarter) for Season 1.");
  });

  it("ignores an unknown spot", async () => {
    render(await page({ spot: "nope" }));
    expect(screen.getByLabelText("Message")).toHaveValue("");
  });

  it("stays out of search and the sitemap until announced", () => {
    expect(season.isPublic).toBe(false);
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(sitemap().some((entry) => entry.url.endsWith("/season"))).toBe(false);
  });

  it("accepts season inquiries through the contact API", () => {
    const result = parseContactPayload({ name: "Ada", email: "ada@example.com", message: "We would like a banner spot for Q1.", offer: "season" });
    expect(result).toMatchObject({ data: { offer: "season" } });
  });
});
