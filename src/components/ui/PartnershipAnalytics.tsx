"use client";

import { useEffect } from "react";
import { trackPartnership } from "@/lib/partnership-analytics";

export default function PartnershipAnalytics() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[data-partnership-source]")
        : null;
      if (!link) return;
      trackPartnership("partnership_cta_clicked", { source: link.dataset.partnershipSource, offer: link.dataset.partnershipOffer });
    }
    // Delegation follows links introduced by client navigation without rebinding.
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
