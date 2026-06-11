import RevealText from "@/components/ui/RevealText";

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
      {/* No data-shimmer here: background-clip text cannot paint through the
          composited word spans RevealText creates, leaving the text invisible. */}
      <h2 className="section-heading__title">
        <RevealText text={title} />{" "}
        <span className={highlightClassName}>
          <RevealText text={highlight} delay={0.12} />
        </span>
      </h2>
      <p className="section-heading__subtitle">{subtitle}</p>
    </div>
  );
}
