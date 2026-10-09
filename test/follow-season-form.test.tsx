import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FollowSeasonForm from "@/components/ui/FollowSeasonForm";
import SeasonVisitBeacon from "@/components/ui/SeasonVisitBeacon";
import Season from "@/app/season/page";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })));
});
afterEach(() => vi.unstubAllGlobals());

describe("FollowSeasonForm", () => {
  it("submits the email and shows the check-your-inbox state", async () => {
    render(<FollowSeasonForm from="season" />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "fan@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Follow the season" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Almost there.");
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/season/follow");
    expect(JSON.parse(String(init?.body))).toMatchObject({ email: "fan@example.com" });
  });

  it("shows the server's error and keeps the form", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: "That email doesn't look right." }), { status: 400 }));
    render(<FollowSeasonForm from="season" />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "fan@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Follow the season" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That email doesn't look right.");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("works without JavaScript as a plain form post", () => {
    const { container } = render(<FollowSeasonForm from="season" />);
    const form = container.querySelector("form")!;
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/api/season/follow");
  });
});

describe("Season page signup and brand links", () => {
  it("renders the follow section and a confirmed result", async () => {
    render(await Season({ searchParams: Promise.resolve({ follow: "confirmed" }) }));
    expect(screen.getByRole("heading", { level: 2, name: "Get every retest." })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("You're in.");
  });

  it("ignores an unknown follow code", async () => {
    render(await Season({ searchParams: Promise.resolve({ follow: "<b>hi</b>" }) }));
    expect(screen.getByRole("button", { name: "Follow the season" })).toBeInTheDocument();
  });

  it("reports a brand link visit once per tab session", async () => {
    const { unmount } = render(<SeasonVisitBeacon visitRef="aker" />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toMatchObject({ ref: "aker" });
    unmount();
    render(<SeasonVisitBeacon visitRef="aker" />);
    render(<SeasonVisitBeacon />);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
