import { useEffect } from "react";

/** The root layout survives navigation; delegated listeners follow new content. */
export function useDelegatedHover(selector: string, move: (this: HTMLElement, event: MouseEvent) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let active: HTMLElement | null = null;
    let originalTransform = "";
    function reset() {
      if (active) active.style.transform = originalTransform;
      active = null;
    }
    function onMove(event: MouseEvent) {
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>(selector) : null;
      if (element !== active) {
        reset();
        active = element;
        originalTransform = element?.style.transform ?? "";
      }
      if (element) move.call(element, event);
    }
    function onOut(event: MouseEvent) {
      if (active && (!(event.relatedTarget instanceof Node) || !active.contains(event.relatedTarget))) reset();
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onOut);
      reset();
    };
  }, [enabled, selector, move]);
}
