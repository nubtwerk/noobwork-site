export type PillarIconKind = "lifestyle" | "development" | "heritage";

interface PillarIconProps {
  kind: PillarIconKind;
  className?: string;
}

export default function PillarIcon({ kind, className }: PillarIconProps) {
  if (kind === "lifestyle") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="15.5" cy="7.75" r="2.5" fill="currentColor" stroke="none" />
        <path d="M4.75 15.25C6.45 13.95 8.88 13.3 12 13.3C15.12 13.3 17.55 13.95 19.25 15.25" />
        <path d="M6.5 18H17.5" />
      </svg>
    );
  }

  if (kind === "development") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5.25" y="13.5" width="3" height="4.5" rx="0.85" fill="currentColor" stroke="none" />
        <rect x="10.5" y="10.75" width="3" height="7.25" rx="0.85" fill="currentColor" stroke="none" opacity="0.88" />
        <path d="M7.75 10.75L11.5 7.5L14 10L18.25 5.75" />
        <path d="M15.1 5.75H18.25V8.9" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10.75" y="4.75" width="2.5" height="2.5" rx="0.65" fill="currentColor" stroke="none" />
      <rect x="6.5" y="8.75" width="2.5" height="2.5" rx="0.65" fill="currentColor" stroke="none" />
      <rect x="15" y="8.75" width="2.5" height="2.5" rx="0.65" fill="currentColor" stroke="none" />
      <rect x="10.75" y="12.75" width="2.5" height="2.5" rx="0.65" fill="currentColor" stroke="none" />
      <path d="M8.25 17.75H15.75" />
      <path d="M12 7.25V10.25" opacity="0.68" />
    </svg>
  );
}
