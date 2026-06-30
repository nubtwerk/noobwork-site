/**
 * Regression test for the reduced-motion / coarse-pointer gate in useSpotlight.
 *
 * When disabled, useSpotlight must pass null to useMousePosition so NO document
 * mousemove listener (and its per-move requestAnimationFrame) is attached. The
 * previous code nulled the ref instead of the callback, leaving the listener
 * running for reduced-motion desktop users.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useSpotlight } from "@/hooks/useSpotlight";

afterEach(() => {
  vi.restoreAllMocks();
});

function mousemoveCount(spy: ReturnType<typeof vi.spyOn>): number {
  return spy.mock.calls.filter(
    ([type]: [string, ...unknown[]]) => type === "mousemove"
  ).length;
}

describe("useSpotlight enabled gate", () => {
  it("attaches no document mousemove listener when disabled", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSpotlight(ref, false);
    });
    expect(mousemoveCount(addSpy)).toBe(0);
  });

  it("attaches a document mousemove listener when enabled", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSpotlight(ref, true);
    });
    expect(mousemoveCount(addSpy)).toBeGreaterThan(0);
  });

  it("removes the mousemove listener on unmount when enabled", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useSpotlight(ref, true);
    });
    unmount();
    expect(mousemoveCount(removeSpy)).toBeGreaterThan(0);
  });

  it("tears down the listener when toggled from enabled to disabled at runtime", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => {
        const ref = useRef<HTMLDivElement>(null);
        useSpotlight(ref, enabled);
      },
      { initialProps: { enabled: true } }
    );
    expect(mousemoveCount(addSpy)).toBeGreaterThan(0);

    // Media-query flips to reduced-motion mid-session: the existing listener
    // must be removed, not leaked (the invariant the PR rests on).
    rerender({ enabled: false });
    expect(mousemoveCount(removeSpy)).toBeGreaterThan(0);
  });
});
