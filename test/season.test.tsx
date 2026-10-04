import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Season, { metadata } from "@/app/season/page";
import sitemap from "@/app/sitemap";
import { season, seasonSpots } from "@/data/season";
import { parseContactPayload } from "@/lib/contact";
import { __setBidStore, createMemoryStore } from "@/lib/season-bids/store";

// Every test gets an empty auction; jsdom lacks <dialog>.showModal.
beforeEach(() => {
  __setBidStore(createMemoryStore());
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
});
afterEach(() => __setBidStore(undefined));

const page = (query: Record<string, string> = {}) => Season({ searchParams: Promise.resolve(query) });

describe("Season page", () => {
  it("renders the hero and a bid button on every auctioned spot", async () => {
    render(await page());
    expect(screen.getByRole("heading", { level: 1, name: "One year. Tested." })).toBeInTheDocument();
    for (const spot of seasonSpots) {
      expect(screen.getByRole("heading", { level: 3, name: spot.title })).toBeInTheDocument();
      if (spot.openingBid) expect(screen.getAllByRole("button", { name: `Place a bid on ${spot.title}` }).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole("button", { name: "Place a bid on Season partner" })).not.toBeInTheDocument();
  });

  it("falls back to claim links when bidding is unavailable", async () => {
    __setBidStore(undefined);
    vi.stubEnv("NODE_ENV", "production");
    try {
      render(await page());
    } finally {
      vi.unstubAllEnvs();
    }
    for (const spot of seasonSpots.filter((s) => s.status === "open")) {
      expect(screen.getByRole("link", { name: `Claim this spot : ${spot.title}` })).toHaveAttribute("href", `/season?spot=${spot.id}#inquiry`);
    }
  });

  it("shows approved bids by category unless the brand opted in, never pending ones", async () => {
    const store = createMemoryStore();
    const base = { website: "x.com", contactName: "X", email: "x@x.com", tokenHash: null, createdAt: "2026-10-10T00:00:00Z", confirmedAt: "2026-10-10T00:00:00Z", decidedAt: null };
    store.bids.push(
      { ...base, id: "1", spotId: "retest-q1", amount: 2250, brand: "Hidden Co", category: "Gyms and training", showName: false, status: "approved" },
      { ...base, id: "2", spotId: "retest-q1", amount: 2500, brand: "Proud Co", category: "Other", showName: true, status: "approved" },
      { ...base, id: "3", spotId: "retest-q1", amount: 9000, brand: "Pending Co", category: "Other", showName: true, status: "pending" },
    );
    __setBidStore(store);
    render(await page());
    const list = screen.getByRole("list", { name: "Bids on First retest presenter" });
    expect(within(list).getByText("Proud Co")).toBeInTheDocument();
    expect(within(list).getByText("Gyms and training")).toBeInTheDocument();
    expect(screen.queryByText("Hidden Co")).not.toBeInTheDocument();
    expect(screen.queryByText("Pending Co")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Raise the bid on First retest presenter" })).toBeInTheDocument();
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

describe("Season page interactions", () => {
  it("opens a checkpoint on the elevation profile", async () => {
    render(await page());
    fireEvent.click(screen.getByRole("button", { name: "Finale, January 2028" }));
    expect(screen.getByRole("heading", { level: 3, name: "Finale" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "What gets measured" }).querySelectorAll("li")).toHaveLength(season.measures.length);
  });

  it("opens the bid form for the picked banner spot, with the minimum prefilled", async () => {
    render(await page());
    fireEvent.click(screen.getByRole("button", { name: "Banner spot 3, Open" }));
    const card = screen.getByText("Banner spot 3", { selector: ".season-slot-card__title" }).closest("article") as HTMLElement;
    fireEvent.click(within(card).getByRole("button", { name: "Place a bid on Banner spot 3" }));
    await waitFor(() => expect(screen.getByRole("heading", { level: 2, name: "Bid on Banner spot 3" })).toBeInTheDocument());
    expect(screen.getByLabelText(/Your bid in US dollars/)).toHaveValue("3000");
    expect(screen.getByText(/non-binding offers/, { selector: ".contact-form__privacy" })).toBeInTheDocument();
  });

  it("shows the season partner as in talks, with no bidding", async () => {
    render(await page());
    fireEvent.click(screen.getByRole("button", { name: "Season partner, In talks" }));
    expect(screen.getByText("Reserved for the season partner I'm in talks with.")).toBeInTheDocument();
  });
});
