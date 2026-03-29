interface SectionHeaderProps {
  title: string;
  highlight: string;
  subtitle: string;
  center?: boolean;
}

export default function SectionHeader({ title, highlight, subtitle, center }: SectionHeaderProps) {
  return (
    <div className={`section-heading ${center ? "section-heading--center" : ""}`.trim()}>
      <h2 className="section-heading__title">
        {title} <span className="section-heading__highlight">{highlight}</span>
      </h2>
      <p className="section-heading__subtitle">{subtitle}</p>
    </div>
  );
}
