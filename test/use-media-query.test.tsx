import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Listener = (e: { matches: boolean }) => void;

function stubMatchMedia(initialMatches: boolean) {
  const listeners: Listener[] = [];
  const mq = {
    matches: initialMatches,
    addEventListener: (_: string, cb: Listener) => listeners.push(cb),
    removeEventListener: (_: string, cb: Listener) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
  };
  vi.stubGlobal("matchMedia", () => mq);
  return {
    listeners,
    setMatches(value: boolean) {
      mq.matches = value;
      listeners.forEach((cb) => cb({ matches: value }));
    },
  };
}

describe("useMediaQuery", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the current match state", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(prefers-reduced-motion: reduce)"));
    expect(result.current).toBe(true);
  });

  it("updates when the media query changes", () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(pointer: coarse)"));
    expect(result.current).toBe(false);

    act(() => {
      media.setMatches(true);
    });
    expect(result.current).toBe(true);
  });

  it("unsubscribes on unmount", () => {
    const media = stubMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery("(pointer: coarse)"));
    expect(media.listeners.length).toBe(1);
    unmount();
    expect(media.listeners.length).toBe(0);
  });
});
