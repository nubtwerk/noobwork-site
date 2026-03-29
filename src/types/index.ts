export interface SocialLink {
  name: string;
  url: string;
  iconName: string;
}

export interface WorkCompany {
  name: string;
  url?: string;
}

export interface WorkItem {
  name: string;
  status: string;
  desc: string;
  url?: string;
  companies?: WorkCompany[];
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
