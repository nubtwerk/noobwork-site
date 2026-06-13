import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CopyContextButton from "@/app/context/CopyContextButton";

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("CopyContextButton", () => {
  it("happy path: fetches llm.txt and writes it to clipboard", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("# md"),
    }));

    render(<CopyContextButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Copy all as markdown");

    fireEvent.click(button);
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent("Copied to clipboard")
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("# md");
  });

  it("HTTP error: falls back to window.open and does not write to clipboard", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    render(<CopyContextButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith("/context/llm.txt", "_blank")
    );
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("reset: button returns to default label after 2000ms", async () => {
    vi.useFakeTimers();

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("# md"),
    }));

    render(<CopyContextButton />);

    // Click and flush microtasks only (fetch + clipboard + setState).
    // Deliberately NOT runAllTimersAsync: that could consume the 2000ms
    // reset timer before the "Copied" assertion below.
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByRole("button")).toHaveTextContent("Copied to clipboard");

    // Advance past the 2000ms reset timeout
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(screen.getByRole("button")).toHaveTextContent("Copy all as markdown");
  });
});
