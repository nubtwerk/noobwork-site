interface LogoProps {
  variant?: "wordmark" | "monogram";
  className?: string;
}

export default function Logo({ variant = "wordmark", className }: LogoProps) {
  if (variant === "wordmark") {
    return (
      <span className={`font-[family-name:var(--font-newake)] tracking-tight uppercase ${className ?? "text-primary"}`}>
        NOOBWORK.
      </span>
    );
  }

  return (
    <span className={`font-[family-name:var(--font-newake)] tracking-tight uppercase text-sm ${className ?? "text-primary"}`}>
      NW
    </span>
  );
}
