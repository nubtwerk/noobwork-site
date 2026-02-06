interface InterestTagProps {
  label: string;
}

export default function InterestTag({ label }: InterestTagProps) {
  return (
    <span className="px-3 py-1 bg-surface rounded-full text-sm text-foreground/70 border border-border">
      {label}
    </span>
  );
}
