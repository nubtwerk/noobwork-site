import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import ScrollToHash from "@/components/ui/ScrollToHash";

describe("ScrollToHash", () => {
  const originalHash = window.location.hash;

  beforeEach(() => {
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
      return 0;
    });
  });

  afterEach(() => {
    window.history.replaceState(null, "", originalHash ? `#${originalHash.replace(/^#/, "")}` : " ");
    // Reset hash cleanly for jsdom
    window.location.hash = "";
    vi.unstubAllGlobals();
  });

  it("scrolls to the target when the URL hash matches", () => {
    const el = document.createElement("div");
    el.id = "inquiry";
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    window.location.hash = "#inquiry";

    render(<ScrollToHash id="inquiry" trigger="video|" />);

    expect(el.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    el.remove();
  });

  it("does not scroll when the hash is absent and force is false", () => {
    const el = document.createElement("div");
    el.id = "inquiry";
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    window.location.hash = "";

    render(<ScrollToHash id="inquiry" trigger="|" />);

    expect(el.scrollIntoView).not.toHaveBeenCalled();
    el.remove();
  });

  it("scrolls when force is true even without a hash", () => {
    const el = document.createElement("div");
    el.id = "inquiry";
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    window.location.hash = "";

    render(<ScrollToHash id="inquiry" trigger="|sent" force />);

    expect(el.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    el.remove();
  });
});
