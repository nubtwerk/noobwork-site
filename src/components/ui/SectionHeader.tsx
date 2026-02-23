interface SectionHeaderProps {
  title: string;
  highlight: string;
  subtitle: string;
  center?: boolean;
}

export default function SectionHeader({ title, highlight, subtitle, center }: SectionHeaderProps) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="font-[family-name:var(--font-newake)] text-3xl md:text-4xl text-foreground mb-2 uppercase tracking-tight">
        {title} <span className="text-primary">{highlight}</span>
      </h2>
      <p className="text-foreground/60 mb-12">{subtitle}</p>
    </div>
  );
}
