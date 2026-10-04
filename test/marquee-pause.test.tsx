import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import TypeMarquee from "@/components/ui/TypeMarquee";

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

interface ControllableIO {
  callback: IOCallback;
  observed: Element[];
  disconnected: boolean;
}

function makeIOStub(): { instances: ControllableIO[] } {
  const instances: ControllableIO[] = [];

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private _cb: IOCallback;
      observed: Element[] = [];
      disconnected = false;

      constructor(cb: IOCallback) {
        this._cb = cb;
        const entry: ControllableIO = {
          callback: cb,
          observed: this.observed,
          disconnected: false,
        };
        instances.push(entry);
        // Keep reference so disconnect flips the flag on the same object
        Object.defineProperty(this, "_entry", { value: entry });
      }

      observe(el: Element) {
        this.observed.push(el);
        (this as unknown as { _entry: ControllableIO })._entry.observed.push(el);
      }
      disconnect() {
        this.disconnected = true;
        (this as unknown as { _entry: ControllableIO })._entry.disconnected = true;
      }
      unobserve() {}
      takeRecords() { return []; }
      get root() { return null; }
      get rootMargin() { return ""; }
      get thresholds() { return []; }
    }
  );

  return { instances };
}

describe("useMarqueePause via TypeMarquee", () => {
  let instances: ControllableIO[];

  beforeEach(() => {
    const stub = makeIOStub();
    instances = stub.instances;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pauses the track when the observer fires isIntersecting:false", () => {
    const { container } = render(<TypeMarquee items={["Fitness", "Seoul"]} />);
    const track = container.querySelector(".type-marquee__track") as HTMLElement;

    expect(instances.length).toBe(1);
    const io = instances[0];

    io.callback([{ isIntersecting: false } as IntersectionObserverEntry]);
    expect(track.classList.contains("is-offscreen")).toBe(true);
  });

  it("resumes the track when the observer fires isIntersecting:true", () => {
    const { container } = render(<TypeMarquee items={["Fitness", "Seoul"]} />);
    const track = container.querySelector(".type-marquee__track") as HTMLElement;

    const io = instances[0];

    // First pause it
    io.callback([{ isIntersecting: false } as IntersectionObserverEntry]);
    expect(track.classList.contains("is-offscreen")).toBe(true);

    // Then resume
    io.callback([{ isIntersecting: true } as IntersectionObserverEntry]);
    expect(track.classList.contains("is-offscreen")).toBe(false);
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(<TypeMarquee items={["Fitness"]} />);
    const io = instances[0];
    expect(io.disconnected).toBe(false);
    unmount();
    expect(io.disconnected).toBe(true);
  });
});
