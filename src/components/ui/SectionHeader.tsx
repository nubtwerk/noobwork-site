interface SectionHeaderProps {
  title: string;
  highlight: string;
  subtitle: string;
  center?: boolean;
  highlightClassName?: string;
}

export default function SectionHeader({
  title,
  highlight,
  subtitle,
  center,
  highlightClassName = "section-heading__highlight",
}: SectionHeaderProps) {
  return (
    <div className={`section-heading ${center ? "section-heading--center" : ""}`.trim()}>
      <h2 className="section-heading__title" data-shimmer>
        {title} <span className={highlightClassName}>{highlight}</span>
      </h2>
      <p className="section-heading__subtitle">{subtitle}</p>
    </div>
  );
}
