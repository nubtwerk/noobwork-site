import {
  YoutubeLogo,
  TwitterLogo,
  InstagramLogo,
  LinkedinLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const iconMap: Record<string, Icon> = {
  youtube: YoutubeLogo,
  twitter: TwitterLogo,
  instagram: InstagramLogo,
  linkedin: LinkedinLogo,
  mail: EnvelopeSimple,
};

interface SocialIconProps {
  iconName: string;
  className?: string;
}

export default function SocialIcon({ iconName, className = "w-5 h-5" }: SocialIconProps) {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) return null;
  return (
    <IconComponent
      className={className}
      size={20}
      weight="regular"
      aria-hidden
    />
  );
}
