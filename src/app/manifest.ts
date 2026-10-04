import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Noobwork | Joachim Haraldsen",
    short_name: "Noobwork",
    description: "Creator brand of Joachim Haraldsen. Training, life in Korea and gaming heritage, from Seoul.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F8F8",
    theme_color: "#2C3930",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
