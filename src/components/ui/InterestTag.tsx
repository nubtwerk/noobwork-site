interface InterestTagProps {
  label: string;
}

export default function InterestTag({ label }: InterestTagProps) {
  return <span className="tag">{label}</span>;
}
