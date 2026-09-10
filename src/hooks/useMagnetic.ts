import { useDelegatedHover } from "./useDelegatedHover";

function handleMove(this: HTMLElement, e: MouseEvent) {
  const rect = this.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) * 0.25;
  const dy = (e.clientY - cy) * 0.25;
  this.style.transform = `translate(${dx}px, ${dy}px)`;
}

/** Follows matching elements across client-side navigation. */
export function useMagnetic(enabled = true) {
  useDelegatedHover("[data-magnetic], .btn", handleMove, enabled);
}
