"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { seasonStatusLabel, type SeasonSpot } from "@/data/season";

interface SeasonBoardProps {
  spots: readonly SeasonSpot[];
}

/**
 * The YouTube banner drawn to scale (2560 x 1440) with the safe area every
 * device shows (1235 x 338). Sponsor slots sit inside it; picking one shows
 * what it includes and how to claim it.
 */
export default function SeasonBoard({ spots }: SeasonBoardProps) {
  const [selectedId, setSelectedId] = useState(spots[0]?.id);
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
            <li key={spot.id} className={`season-slot season-slot--${spot.board} season-slot--${spot.status}`}>
              <button
                type="button"
                className="season-slot__button"
                aria-pressed={spot.id === selected.id}
                onClick={() => setSelectedId(spot.id)}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setSelectedId(spot.id);
                }}
              >
                <span className="season-slot__name">{spot.status === "sold" && spot.sponsor ? spot.sponsor.name : spot.title}</span>
                <span className="sr-only">, {seasonStatusLabel[spot.status]}</span>
              </button>
            </li>
          ))}
        </ul>
        <span className="season-banner__name" aria-hidden="true">NOOBWORK.</span>
      </div>
      <article className="season-slot-card" aria-live="polite">
        <span className={`season-slot-card__status season-slot-card__status--${selected.status}`}>{seasonStatusLabel[selected.status]}</span>
        <p className="season-slot-card__title">{selected.title}</p>
        <p className="season-slot-card__term">{selected.term}</p>
        <ul className="season-slot-card__list">
          {selected.includes.map((line) => <li key={line}>{line}</li>)}
        </ul>
        {selected.status === "open" ? (
          <Link
            className="btn btn--sand season-slot-card__claim"
            href={`/season?spot=${selected.id}#inquiry`}
            data-partnership-source="season"
            data-partnership-offer="season"
          >
            Claim {selected.title}
          </Link>
        ) : (
          <p className="season-slot-card__taken">This spot is taken.</p>
        )}
      </article>
    </div>
  );
}
