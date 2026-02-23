interface LogoProps {
  variant?: "wordmark" | "monogram";
  className?: string;
}

export default function Logo({ variant = "wordmark", className }: LogoProps) {
  if (variant === "wordmark") {
    return (
      <span className={`font-[family-name:var(--font-newake)] text-primary font-bold tracking-tight uppercase ${className ?? ""}`}>
        NOOBWORK.
      </span>
    );
  }

  return (
    <span className={`font-[family-name:var(--font-newake)] text-primary font-bold tracking-tight uppercase text-sm ${className ?? ""}`}>
      NW
    </span>
  );
}
