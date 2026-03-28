interface InterestTagProps {
  label: string;
}

export default function InterestTag({ label }: InterestTagProps) {
  return (
    <span className="px-3 py-1 bg-accent rounded-full text-sm text-white capitalize">
      {label.toLowerCase()}
    </span>
  );
}
