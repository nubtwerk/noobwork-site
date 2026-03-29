interface LogoProps {
  variant?: "wordmark" | "monogram";
  className?: string;
}

export default function Logo({ variant = "wordmark", className }: LogoProps) {
  if (variant === "wordmark") {
    return (
      <span className={`site-logo site-logo--wordmark ${className ?? ""}`.trim()}>
        NOOBWORK.
      </span>
    );
  }

  return (
    <span className={`site-logo site-logo--monogram ${className ?? ""}`.trim()}>
      NW
    </span>
  );
}
