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

  it("clears the active id when the section leaves the band", () => {
    const about = document.createElement("section");
    about.id = "about";
    document.body.appendChild(about);

    const { result } = renderHook(() => useActiveSection(["about"]));
    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer.trigger([
        { isIntersecting: true, intersectionRatio: 0.6, target: about },
      ]);
    });
    expect(result.current).toBe("about");

    // Section scrolls out and nothing else is in the band — must not stay stuck.
    act(() => {
      observer.trigger([
        { isIntersecting: false, intersectionRatio: 0, target: about },
      ]);
    });
    expect(result.current).toBeNull();
  });

  it("tracks the highest-ratio section across separate observer callbacks", () => {
    const about = document.createElement("section");
    about.id = "about";
    const work = document.createElement("section");
    work.id = "work";
    document.body.append(about, work);

    const { result } = renderHook(() => useActiveSection(["about", "work"]));
    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer.trigger([
        { isIntersecting: true, intersectionRatio: 0.6, target: about },
      ]);
    });
    expect(result.current).toBe("about");

    // Only `work` changes in this callback, but its higher ratio should win
    // even though `about` is absent from this callback's entries.
    act(() => {
      observer.trigger([
        { isIntersecting: true, intersectionRatio: 0.9, target: work },
      ]);
    });
    expect(result.current).toBe("work");
  });
});
