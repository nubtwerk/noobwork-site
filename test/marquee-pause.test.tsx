import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import TypeMarquee from "@/components/ui/TypeMarquee";
import SocialProof from "@/components/sections/SocialProof";

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

describe("useMarqueePause via SocialProof", () => {
  let instances: ControllableIO[];

  beforeEach(() => {
    const stub = makeIOStub();
    instances = stub.instances;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** Fire all IntersectionObserver callbacks (motion/react + useMarqueePause). */
  function fireAll(isIntersecting: boolean) {
    for (const io of instances) {
      io.callback([{ isIntersecting } as IntersectionObserverEntry]);
    }
  }

  it("pauses the social-marquee track when offscreen", () => {
    const { container } = render(<SocialProof />);
    const track = container.querySelector(".social-marquee__track") as HTMLElement;

    // At least one IO is created by useMarqueePause; motion may create more.
    expect(instances.length).toBeGreaterThanOrEqual(1);
    fireAll(false);
    expect(track.classList.contains("is-offscreen")).toBe(true);
  });

  it("resumes the social-marquee track when back onscreen", () => {
    const { container } = render(<SocialProof />);
    const track = container.querySelector(".social-marquee__track") as HTMLElement;

    fireAll(false);
    expect(track.classList.contains("is-offscreen")).toBe(true);

    fireAll(true);
    expect(track.classList.contains("is-offscreen")).toBe(false);
  });

  it("calls disconnect on all observers on unmount", () => {
    const { unmount } = render(<SocialProof />);
    expect(instances.length).toBeGreaterThanOrEqual(1);
    unmount();
    // Every IO created during this render should be disconnected
    for (const io of instances) {
      expect(io.disconnected).toBe(true);
    }
  });
});
