import { useDelegatedHover } from "./useDelegatedHover";

function handleMove(this: HTMLElement, e: MouseEvent) {
  const rect = this.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  this.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
}

/** Follows matching elements across client-side navigation. */
export function useTilt(enabled = true) {
  useDelegatedHover("[data-tilt]", handleMove, enabled);
}
