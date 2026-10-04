"use client";

import { useRef, useState } from "react";
import { formatUsd, seasonStatusLabel, type SeasonSpot, type SeasonSpotStatus } from "@/data/season";
import { SeasonBidPanel, useSeasonBids } from "@/components/ui/SeasonBids";

interface SeasonBoardProps {
  spots: readonly SeasonSpot[];
  initialSpotId?: string;
}

/** A spot with a winner picked in the admin reads as Reserved until the data file says Sold. */
function useLiveStatus(spot: SeasonSpot): SeasonSpotStatus {
  const live = useSeasonBids(spot.id);
  return spot.status === "open" && live?.hasWinner ? "reserved" : spot.status;
}

function Slot({ spot, selected, onSelect }: { spot: SeasonSpot; selected: boolean; onSelect: () => void }) {
  const status = useLiveStatus(spot);
  const top = useSeasonBids(spot.id)?.bids[0];
  return (
    <li className={`season-slot season-slot--${spot.board} season-slot--${status}`}>
      <button type="button" className="season-slot__button" aria-pressed={selected} onClick={onSelect}>
        <span className="season-slot__name">{status === "sold" && spot.sponsor ? spot.sponsor.name : spot.title}</span>
        {top && status === "open" ? <span className="season-slot__bid" aria-hidden="true">{formatUsd(top.amount)}</span> : null}
        <span className="sr-only">, {seasonStatusLabel[status]}{top && status === "open" ? `, top bid ${formatUsd(top.amount)}` : ""}</span>
      </button>
    </li>
  );
}

function SlotCard({ spot }: { spot: SeasonSpot }) {
  const status = useLiveStatus(spot);
  return (
    <article className="season-slot-card" aria-live="polite">
      <span className={`season-slot-card__status season-slot-card__status--${status}`}>{seasonStatusLabel[status]}</span>
      <p className="season-slot-card__title">{spot.title}</p>
      <p className="season-slot-card__term">{spot.term}</p>
      <ul className="season-slot-card__list">
        {spot.includes.map((line) => <li key={line}>{line}</li>)}
      </ul>
      {status === "open" ? (
        <div className="season-slot-card__claim"><SeasonBidPanel spot={spot} tone="dark" /></div>
      ) : (
        <p className="season-slot-card__taken">
          {status === "talks" ? "Reserved for the season partner I'm in talks with." : "This spot is taken."}
        </p>
      )}
    </article>
  );
}

/**
 * The YouTube banner drawn to scale (2560 x 1440) with the safe area every
 * device shows (1235 x 338). Sponsor slots sit inside it; picking one shows
 * what it includes and how to claim it.
 */
export default function SeasonBoard({ spots, initialSpotId }: SeasonBoardProps) {
  const [selectedId, setSelectedId] = useState(spots.find((spot) => spot.id === initialSpotId)?.id ?? spots.find((spot) => spot.status === "open")?.id ?? spots[0]?.id);
  const safeRef = useRef<HTMLUListElement>(null);
  const selected = spots.find((spot) => spot.id === selectedId) ?? spots[0];

  const tilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const safe = safeRef.current;
    if (!safe || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    safe.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const untilt = () => {
    if (safeRef.current) safeRef.current.style.transform = "";
  };

  if (!selected) return null;

  return (
    <div className="season-board">
      <div className="season-banner" onPointerMove={tilt} onPointerLeave={untilt}>
        <span className="season-banner__label" aria-hidden="true">YouTube banner · 2560 × 1440</span>
        <ul ref={safeRef} className="season-banner__safe" aria-label="Banner board">
          {spots.map((spot) => (
            <Slot key={spot.id} spot={spot} selected={spot.id === selected.id} onSelect={() => setSelectedId(spot.id)} />
          ))}
        </ul>
        <span className="season-banner__name" aria-hidden="true">NOOBWORK.</span>
      </div>
      <SlotCard spot={selected} />
    </div>
  );
}
