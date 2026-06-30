import { useEffect, useRef } from "react";

/**
 * Pauses a CSS marquee animation while the element is offscreen by toggling an
 * `is-offscreen` class — NOT an inline style. An inline `animation-play-state`
 * would override the stylesheet `.social-marquee:hover` pause rule by
 * specificity and permanently defeat hover-to-pause.
 */
export function useMarqueePause<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") return;
    const io = new IntersectionObserver(([entry]) => {
      el.classList.toggle("is-offscreen", !entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
