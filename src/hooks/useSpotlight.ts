import { useCallback, RefObject } from "react";
import { useMousePosition } from "./useMousePosition";

/** Renders a radial gradient spotlight that follows the cursor. */
export function useSpotlight(ref: RefObject<HTMLDivElement | null>) {
  const onUpdate = useCallback(
    (mouseX: number, mouseY: number) => {
      const el = ref.current;
      if (!el) return;
      el.style.background = `radial-gradient(600px circle at ${mouseX}px ${mouseY + window.scrollY}px, rgba(236, 219, 191, 0.045), transparent 60%)`;
      el.style.height = `${document.documentElement.scrollHeight}px`;
    },
    [ref],
  );

  useMousePosition(onUpdate);
}
