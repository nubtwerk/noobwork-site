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
});

describe("CopyContextButton", () => {
  it("happy path: fetches llm.txt and writes it to clipboard", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("# md"),
    }) as unknown as typeof fetch;

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
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as unknown as typeof fetch;

    render(<CopyContextButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith("/context/llm.txt", "_blank")
    );
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("reset: button returns to default label after 2000ms", async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("# md"),
    }) as unknown as typeof fetch;

    render(<CopyContextButton />);

    // Click and flush all async work (fetch + clipboard + setState)
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
      await vi.runAllTimersAsync();
    });

    expect(screen.getByRole("button")).toHaveTextContent("Copied to clipboard");

    // Advance past the 2000ms reset timeout
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("button")).toHaveTextContent("Copy all as markdown");

    vi.useRealTimers();
  });
});
