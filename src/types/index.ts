export interface SocialLink {
  name: string;
  url: string;
  iconName: string;
}

export interface WorkItem {
  name: string;
  status: string;
  desc: string;
}

export interface FocusItem {
  label: string;
}

export interface Stat {
  label: string;
  value: string;
  numericValue?: number;
  suffix?: string;
}
