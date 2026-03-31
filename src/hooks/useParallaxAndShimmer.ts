import { useCallback } from "react";
import { useMousePosition } from "./useMousePosition";

/** Applies parallax translation and shimmer background-position to data-attributed elements. */
export function useParallaxAndShimmer(enabled = true) {
  const onUpdate = useCallback((mouseX: number, mouseY: number) => {
    document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const cx = (mouseX / window.innerWidth - 0.5) * 2;
        const cy = ((mouseY - rect.top) / rect.height - 0.5) * 2;
        el.style.transform = `translate(${-cx * 3}px, ${-cy * 2}px)`;
      }
    });

    document.querySelectorAll<HTMLElement>("[data-shimmer]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = ((mouseX - rect.left) / rect.width) * 100;
        el.style.backgroundPosition = `${100 - progress}% 0`;
      }
    });
  }, []);

  useMousePosition(enabled ? onUpdate : null);
}
