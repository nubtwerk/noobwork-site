import { useEffect } from "react";

const MAGNETIC_SELECTOR = "[data-magnetic], .btn, .connect-chip";

function handleMove(this: HTMLElement, e: MouseEvent) {
  const rect = this.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) * 0.25;
  const dy = (e.clientY - cy) * 0.25;
  this.style.transform = `translate(${dx}px, ${dy}px)`;
}

function handleLeave(this: HTMLElement) {
  this.style.transform = "translate(0, 0)";
}

/** Attaches magnetic hover effect to buttons and data-magnetic elements. */
export function useMagnetic(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const elements = document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR);
    elements.forEach((el) => {
      el.addEventListener("mousemove", handleMove);
      el.addEventListener("mouseleave", handleLeave);
    });
    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mousemove", handleMove);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, [enabled]);
}
