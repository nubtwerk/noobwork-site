import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import ScrollToHash from "@/components/ui/ScrollToHash";

describe("ScrollToHash", () => {
  const originalHash = window.location.hash;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    );
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    window.history.replaceState(null, "", originalHash ? `#${originalHash.replace(/^#/, "")}` : " ");
    window.location.hash = "";
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("scrolls to the target when the URL hash matches", () => {
    const el = document.createElement("div");
    el.id = "inquiry";
    document.body.appendChild(el);
    window.location.hash = "#inquiry";

    render(<ScrollToHash id="inquiry" trigger="video|" />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "auto",
    });
    el.remove();
  });

  it("does not scroll when the hash is absent and force is false", () => {
    const el = document.createElement("div");
    el.id = "inquiry";
    document.body.appendChild(el);
    window.location.hash = "";

    render(<ScrollToHash id="inquiry" trigger="|" />);

    expect(window.scrollTo).not.toHaveBeenCalled();
    el.remove();
  });

  it("scrolls when force is true even without a hash", () => {
    const el = document.createElement("div");
    el.id = "inquiry";
    document.body.appendChild(el);
    window.location.hash = "";

    render(<ScrollToHash id="inquiry" trigger="|sent" force />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "auto",
    });
    el.remove();
  });

  it("retries scroll after layout settles", () => {
    const el = document.createElement("div");
    el.id = "inquiry";
    document.body.appendChild(el);
    window.location.hash = "#inquiry";

    render(<ScrollToHash id="inquiry" trigger="|" />);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(120);
    expect(window.scrollTo).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(280);
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
    el.remove();
  });
});
