import { useEffect, useRef } from "react";

type MouseCallback = ((x: number, y: number) => void) | null;

/** Shared mouse position tracker that batches updates via requestAnimationFrame. */
export function useMousePosition(onUpdate: MouseCallback) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (!callbackRef.current) return;

    let rafId: number | null = null;
    let mouseX = 0;
    let mouseY = 0;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          callbackRef.current?.(mouseX, mouseY);
        });
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onUpdate === null]);
}
