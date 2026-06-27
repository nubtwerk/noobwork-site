import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActiveSection } from "@/hooks/useActiveSection";

type ObserverCallback = IntersectionObserverCallback;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  private callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();

  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(
      entries.map(
        (entry) =>
          ({
            isIntersecting: false,
            intersectionRatio: 0,
            target: { id: "" },
            ...entry,
          }) as IntersectionObserverEntry
      ),
      this as unknown as IntersectionObserver
    );
  }
}

describe("useActiveSection", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("returns null when no sections are tracked", () => {
    const { result } = renderHook(() => useActiveSection([]));
    expect(result.current).toBeNull();
  });

  it("observes section elements and updates the active id", () => {
    const about = document.createElement("section");
    about.id = "about";
    document.body.appendChild(about);

    const { result } = renderHook(() => useActiveSection(["about"]));
    expect(result.current).toBeNull();

    const observer = MockIntersectionObserver.instances[0];
    expect(observer.observe).toHaveBeenCalledWith(about);

    act(() => {
      observer.trigger([
        { isIntersecting: true, intersectionRatio: 0.6, target: about },
      ]);
    });

    expect(result.current).toBe("about");
  });
});
