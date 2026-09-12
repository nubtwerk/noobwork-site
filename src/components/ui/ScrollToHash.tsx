"use client";

import { useEffect } from "react";

/**
 * Next.js soft navigation and Lenis often skip the URL hash. Re-apply a known
 * in-page target after mount / query changes. `trigger` should change when the
 * surrounding route state changes even if the hash stays the same (e.g. offer=).
 * `force` covers native POST redirects that may drop `#inquiry` while keeping
 * `?inquiry=` in the query string.
 */
export default function ScrollToHash({
  id,
  trigger,
  force = false,
}: {
  id: string;
  trigger: string;
  force?: boolean;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!force && window.location.hash !== `#${id}`) return;
    const el = document.getElementById(id);
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [id, trigger, force]);

  return null;
}
