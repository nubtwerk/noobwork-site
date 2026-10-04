"use client";

import { useEffect, useRef, useState } from "react";

interface Checkpoint {
  id: string;
  label: string;
  month: string;
  text: string;
}

interface SeasonProfileProps {
  checkpoints: readonly Checkpoint[];
  measures: readonly string[];
}

const W = 1000;
const PAD = 40;
const TOP = 70;
const BOTTOM = 280;
// Illustrative heights until real retest numbers exist; one per checkpoint.
const HEIGHTS = [250, 205, 182, 130, 92];

/** A climbing elevation profile built from fixed sample points, ridges between checkpoints. */
function profilePath(heights: readonly number[]) {
  const segments = heights.length - 1;
  const points: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const seg = Math.min(segments - 1, Math.floor(t * segments));
    const local = t * segments - seg;
    const eased = local * local * (3 - 2 * local);
    const base = heights[seg] + (heights[seg + 1] - heights[seg]) * eased;
    const ridge = (Math.sin(t * 38) * 6 + Math.sin(t * 91) * 2.5) * Math.sin(local * Math.PI);
    points.push(`${(PAD + t * (W - PAD * 2)).toFixed(1)},${(base + ridge).toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
}

/**
 * Season checkpoints as an elevation profile: the line draws itself as the
 * section scrolls in, and each checkpoint opens what gets measured there.
 */
export default function SeasonProfile({ checkpoints, measures }: SeasonProfileProps) {
  const [active, setActive] = useState(0);
  // Announce changes only once the visitor picks a checkpoint, not while scrolling auto-advances it.
  const [interacted, setInteracted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const touched = useRef(false);
  const heights = checkpoints.map((_, i) => HEIGHTS[Math.min(i, HEIGHTS.length - 1)]);
  const d = profilePath(heights);
  const xs = checkpoints.map((_, i) => PAD + (i * (W - PAD * 2)) / (checkpoints.length - 1));

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // pathLength="1" normalises the dash maths, so no layout read is needed.
    path.style.strokeDasharray = "1";
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = svg.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight * 0.75)));
      path.style.strokeDashoffset = `${1 - progress}`;
      if (!touched.current && progress > 0.05) {
        setActive(Math.min(checkpoints.length - 1, Math.floor(progress * (checkpoints.length - 0.001))));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [checkpoints.length]);

  const choose = (index: number) => {
    touched.current = true;
    setInteracted(true);
    setActive(index);
  };
  const current = checkpoints[active];

  return (
    <div className="season-profile">
      <svg ref={svgRef} viewBox={`0 0 ${W} 340`} className="season-profile__chart" role="group" aria-label="Season checkpoints">
        <defs>
          <linearGradient id="season-profile-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ECDBBF" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ECDBBF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="season-profile__grid" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => {
            const y = TOP + (i * (BOTTOM - TOP)) / 3;
            return <line key={i} x1={PAD} x2={W - PAD} y1={y} y2={y} />;
          })}
          <text x={PAD} y={TOP - 30}>Fitness score · illustrative</text>
        </g>
        <path d={`${d} L${W - PAD},${BOTTOM} L${PAD},${BOTTOM} Z`} fill="url(#season-profile-fill)" aria-hidden="true" />
        <path d={d} className="season-profile__ghost" aria-hidden="true" />
        <path ref={pathRef} d={d} pathLength={1} className="season-profile__line" aria-hidden="true" />
        {checkpoints.map((checkpoint, i) => {
          const x = xs[i];
          const y = heights[i];
          const anchor = i === 0 ? "start" : i === checkpoints.length - 1 ? "end" : "middle";
          return (
            <g
              key={checkpoint.id}
              className={`season-profile__point${i === active ? " is-active" : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={i === active}
              aria-label={`${checkpoint.label}, ${checkpoint.month}`}
              onClick={() => choose(i)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  choose(i);
                }
              }}
            >
              <line x1={x} x2={x} y1={y} y2={BOTTOM} className="season-profile__stem" />
              <circle cx={x} cy={y} r={22} className="season-profile__halo" />
              <circle cx={x} cy={y} r={8} className="season-profile__dot" />
              <text x={x} y={y - 40} textAnchor={anchor} className="season-profile__label">{checkpoint.label}</text>
              <text x={x} y={y - 24} textAnchor={anchor} className="season-profile__month">{checkpoint.month}</text>
            </g>
          );
        })}
      </svg>
      <div className="season-profile__panel" aria-live={interacted ? "polite" : "off"}>
        <div>
          <p className="season-profile__month-label">{current.month}</p>
          <h3 className="season-profile__title">{current.label}</h3>
        </div>
        <div>
          <p>{current.text}</p>
          <ul className="season-profile__measures" aria-label="What gets measured">
            {measures.map((measure) => <li key={measure}>{measure}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
