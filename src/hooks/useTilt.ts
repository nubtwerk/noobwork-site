import { useEffect } from "react";

function handleMove(this: HTMLElement, e: MouseEvent) {
  const rect = this.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  this.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
}

function handleLeave(this: HTMLElement) {
  this.style.transform = "perspective(600px) rotateY(0) rotateX(0)";
}

/** Attaches 3D tilt effect to data-tilt elements. */
export function useTilt(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const elements = document.querySelectorAll<HTMLElement>("[data-tilt]");
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
