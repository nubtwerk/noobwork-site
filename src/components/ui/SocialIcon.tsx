import { Youtube, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  mail: Mail,
};

interface SocialIconProps {
  iconName: string;
  className?: string;
}

export default function SocialIcon({ iconName, className = "w-5 h-5" }: SocialIconProps) {
  const Icon = iconMap[iconName];
  if (!Icon) return null;
  return <Icon className={className} />;
}
