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

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

    // Prefer window.scrollTo over scrollIntoView: #inquiry can sit inside a
    // Motion/AnimatedSection transform, where scrollIntoView is a no-op.
    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      const top = window.scrollY + el.getBoundingClientRect().top;
      window.scrollTo({ top, behavior });
      return true;
    };

    let frame = requestAnimationFrame(() => {
      scrollToTarget();
    });
    // Retry after layout/hydration — Next can reset scroll, and motion
    // wrappers may not be settled on the first frame.
    const retryTimers = [120, 400].map((ms) =>
      window.setTimeout(() => {
        frame = requestAnimationFrame(() => {
          scrollToTarget();
        });
      }, ms)
    );

    return () => {
      cancelAnimationFrame(frame);
      for (const timer of retryTimers) window.clearTimeout(timer);
    };
  }, [id, trigger, force]);

  return null;
}
