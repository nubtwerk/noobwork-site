/** Scroll distance (px) before nav switches to "scrolled" style. */
export const NAV_SCROLL_THRESHOLD = 200;

/** Viewport margin for scroll-triggered animations. */
export const ANIMATION_VIEWPORT_MARGIN = "200px 0px 200px 0px";

/** Deep link to the Media Kit inquiry form. */
export const MEDIA_KIT_INQUIRY_HREF = "/media-kit#inquiry";

/**
 * Homepage sections surfaced in the top nav. This order is curated for the nav
 * and is intentionally NOT the DOM order (Watch/#reel renders before About in
 * page.tsx); the scroll-spy highlights by element position, not this list.
 */
export const NAV_SECTIONS = [
  { href: "/#about", label: "About", id: "about" },
  { href: "/#reel", label: "Watch", id: "reel" },
  { href: "/#work", label: "Work", id: "work" },
  { href: "/#connect", label: "Connect", id: "connect" },
] as const;
