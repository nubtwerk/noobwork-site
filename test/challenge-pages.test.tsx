import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Season from "@/app/season/page";
import RunnerPage, { metadata as runnerMeta } from "@/app/season/challenge/me/page";
import { metadata as confirmMeta } from "@/app/season/challenge/confirm/page";
import ChallengeRules from "@/app/season/challenge/rules/page";
import ChallengeAdmin, { metadata as adminMeta } from "@/app/season/admin/challenge/page";
import ChallengeSection from "@/components/sections/ChallengeSection";
import { challenge } from "@/data/challenge";
import { findSeasonSpot } from "@/data/season";
import { __resetChallengeStore, getChallengeStore } from "@/lib/challenge/store";
import { createRunnerToken } from "@/lib/challenge/tokens";
import { adminCookieValue } from "@/lib/challenge/admin";

const cookieJar = vi.hoisted(() => ({ value: undefined as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (cookieJar.value ? { value: cookieJar.value } : undefined) }),
}));

beforeEach(() => {
  __resetChallengeStore();
  cookieJar.value = undefined;
});

const season = (query: Record<string, string> = {}) => Season({ searchParams: Promise.resolve(query) });

describe("challenge on /season", () => {
  it("shows the board with the host pinned, the counter and the join form", async () => {
    render(await season());
    const section = screen.getByRole("region", { name: `${challenge.name}.` });
    const table = within(section).getByRole("table", { name: `${challenge.name} leaderboard` });
    const rows = within(table).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Noobwork");
    expect(rows[1]).toHaveTextContent("Host");
    expect(rows.length).toBe(1 + 1 + challenge.boardSize);
    expect(within(section).getByText("Runners")).toBeInTheDocument();
    expect(within(section).getByText(/Preview: made-up runners/)).toBeInTheDocument();
    expect(within(section).getByRole("button", { name: "Join the challenge" })).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "Read the rules" })).toHaveAttribute("href", "/season/challenge/rules");
  });

  it("hides the board until enough runners have joined", () => {
    render(<ChallengeSection view={{ available: true, data: { standings: [], board: { rows: [], more: 0, hasRetests: false }, stats: { participants: 12, countries: 3, totalKm: 60 } } }} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(/The board opens once 50 runners have joined/)).toBeInTheDocument();
  });

  it("finds a runner by display name", async () => {
    const participants = await getChallengeStore()!.listParticipants();
    const someone = participants.find((p) => !p.isHost)!;
    render(await season({ runner: someone.displayName.toUpperCase() }));
    expect(screen.getByRole("status")).toHaveTextContent(someone.displayName);
  });

  it("shows API feedback after a native form post", async () => {
    render(await season({ challenge: "name_taken" }));
    expect(screen.getByRole("alert")).toHaveTextContent("That display name is taken");
  });

  it("joins without leaving the page when JavaScript runs", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true, previewLink: "https://noobwork.no/season/challenge/confirm?t=x" }), { status: 200 }));
    render(await season());
    const form = within(screen.getByRole("region", { name: `${challenge.name}.` }));
    fireEvent.change(form.getByLabelText("Display name"), { target: { value: "Ada" } });
    fireEvent.change(form.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(form.getByLabelText("Country"), { target: { value: "NO" } });
    fireEvent.click(form.getByLabelText("I'm 18 or over."));
    fireEvent.click(form.getByLabelText(/I accept the/));
    fireEvent.submit(form.getByRole("button", { name: "Join the challenge" }).closest("form")!);
    await waitFor(() => expect(screen.getByText("Almost in.")).toBeInTheDocument());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({ name: "Ada", country: "NO", adult: true, rules: true, newsletter: false });
    expect(screen.getByRole("link", { name: "Open your link" })).toBeInTheDocument();
    fetchMock.mockRestore();
  });

  it("adds a Challenge partner spot that is never named before it sells", () => {
    const spot = findSeasonSpot("challenge-partner")!;
    expect(spot.status).toBe("open");
    expect(spot.sponsor).toBeUndefined();
  });
});

describe("runner page", () => {
  it("keeps personal links off other sites without breaking same-site form posts", () => {
    // "no-referrer" would make browsers send Origin: null, which the APIs reject as cross-site.
    for (const meta of [runnerMeta, confirmMeta, adminMeta]) expect(meta.referrer).toBe("same-origin");
  });

  it("shows the runner's runs and the log form while a window is open", async () => {
    const participants = await getChallengeStore()!.listParticipants();
    const someone = participants.find((p) => !p.isHost)!;
    render(await RunnerPage({ searchParams: Promise.resolve({ t: createRunnerToken(someone.id), welcome: "1" }) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(someone.displayName);
    expect(screen.getByRole("table", { name: "Your runs by window" })).toBeInTheDocument();
    expect(screen.getByLabelText("5 km time")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete me" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Bookmark this page");
  });

  it("explains a broken link", async () => {
    render(await RunnerPage({ searchParams: Promise.resolve({ t: "nope" }) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Link not found.");
  });
});

describe("rules and admin", () => {
  it("marks the rules as a draft until reviewed", () => {
    render(<ChallengeRules />);
    expect(screen.getByRole("note")).toHaveTextContent("waiting for a legal review");
    expect(screen.getByText(/Residents of Brazil and Italy/)).toBeInTheDocument();
  });

  it("asks for the password, then shows the review queue", async () => {
    render(await ChallengeAdmin({ searchParams: Promise.resolve({}) }));
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByText(/To review/)).not.toBeInTheDocument();
  });

  it("shows held runs first and winners once signed in", async () => {
    cookieJar.value = adminCookieValue();
    render(await ChallengeAdmin({ searchParams: Promise.resolve({}) }));
    const queue = screen.getByRole("table", { name: "Runs to review" });
    expect(within(queue).getAllByRole("row")[1]).toHaveTextContent("Held");
    expect(screen.getAllByRole("button", { name: "Verify" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Download CSV with emails" })[0]).toHaveAttribute("href", "/api/season/challenge/admin/export?window=q1");
  });
});
