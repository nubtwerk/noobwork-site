export interface VideoItem {
  /** YouTube video ID */
  id: string;
  title: string;
  /** Display date, already formatted */
  date: string;
}

/**
 * Real uploads from youtube.com/@Noobworkify. Refresh occasionally:
 * https://www.youtube.com/feeds/videos.xml?channel_id=UCv1Jgx1bL0SCB8ofJW5-nqQ
 *
 * Ordering contract: recentVideos is newest-first (the section is headed
 * "Latest Uploads."). When refreshing, prefer ids whose maxresdefault.jpg
 * exists — the featured facade falls back to hqdefault on error, but maxres
 * looks far better.
 */
export const featuredVideo: VideoItem = {
  id: "j3fcJnIYBEw",
  title: "Min første dag i Kyoto | Shinkansen, Airbnb og meal prep",
  date: "Jun 2026",
};

export const recentVideos: VideoItem[] = [
  {
    id: "6Dt2jvU7Z-w",
    title: "Første push day tilbake i Norge | Trening",
    date: "Jun 2026",
  },
  {
    id: "SpHxsZIVuJ4",
    title: "Jeg testet alle matkjedene i Norge (Kiwi vant)",
    date: "Jun 2026",
  },
  {
    id: "23zAbLMuN8I",
    title: "Jeg hentet Rolexen jeg har ventet på | Norge vlog",
    date: "Jun 2026",
  },
  {
    id: "AacH4JBZK_g",
    title: "Jeg testet Emirates First Class hjem til Norge",
    date: "May 2026",
  },
];
