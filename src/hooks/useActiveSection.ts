"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the in-view section anchor (e.g. "about", "reel").
 * Pass an empty list to disable observation (non-home routes).
 */
export function useActiveSection(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Track the latest ratio for every observed section across callbacks. An
    // IntersectionObserver callback only carries the entries that *changed*, so
    // deciding from a single callback's entries leaves a stale highlight when
    // the active section scrolls out of the band and nothing new scrolls in.
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }

        let topId: string | null = null;
        let topRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > topRatio) {
            topRatio = ratio;
            topId = id;
          }
        }

        // topId is null when nothing is in the band — clear it rather than
        // leaving the previously active link highlighted.
        setActiveId(topId);
      },
      {
        rootMargin: "-18% 0px -52% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return sectionIds.length === 0 ? null : activeId;
}
