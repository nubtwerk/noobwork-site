interface TypeMarqueeProps {
  items: string[];
  /** "solid" fills the glyphs, "outline" strokes them */
  variant?: "solid" | "outline";
  className?: string;
  /** Seconds for one full loop */
  duration?: number;
}

/**
 * Poster-scale NEWAKE marquee band. Pure CSS animation, paused for
 * reduced-motion users (handled in globals.css).
 */
export default function TypeMarquee({
  items,
  variant = "solid",
  className,
  duration = 36,
}: TypeMarqueeProps) {
  const row = items.map((item) => (
    <span key={item} className="type-marquee__item">
      {item}
      <span className="type-marquee__dot" aria-hidden="true" />
    </span>
  ));

  return (
    <div
      className={`type-marquee type-marquee--${variant} ${className ?? ""}`.trim()}
      role="img"
      aria-label={items.join(", ")}
    >
      <div className="type-marquee__track" style={{ animationDuration: `${duration}s` }}>
        <span className="type-marquee__group">{row}</span>
        <span className="type-marquee__group" aria-hidden="true">{row}</span>
      </div>
    </div>
  );
}
