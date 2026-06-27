/** Scroll distance (px) before nav switches to "scrolled" style. */
export const NAV_SCROLL_THRESHOLD = 200;

/** Offset for in-page anchors under the fixed nav. */
export const NAV_ANCHOR_OFFSET = "5.75rem";

/** Viewport margin for scroll-triggered animations. */
export const ANIMATION_VIEWPORT_MARGIN = "200px 0px 200px 0px";

/** Partnerships page and deep link to the inquiry form. */
export const MEDIA_KIT_HREF = "/media-kit";
export const MEDIA_KIT_INQUIRY_HREF = "/media-kit#inquiry";

/** Homepage sections surfaced in the top nav (order matches scroll rhythm). */
export const NAV_SECTIONS = [
  { href: "/#about", label: "About", id: "about" },
  { href: "/#reel", label: "Watch", id: "reel" },
  { href: "/#work", label: "Work", id: "work" },
  { href: "/#connect", label: "Connect", id: "connect" },
] as const;
