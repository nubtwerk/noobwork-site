import { useEffect, useRef } from "react";

/** Pauses a CSS animation on the referenced element while it is offscreen. */
export function useMarqueePause<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") return;
    const io = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
