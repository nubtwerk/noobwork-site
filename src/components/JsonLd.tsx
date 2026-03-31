import { socialLinks } from "@/data/social-links";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Joachim Haraldsen",
    alternateName: "Noobwork",
    url: "https://www.noobwork.no",
    image: "https://www.noobwork.no/joachim.jpg",
    description: "Premium lifestyle creator brand by Joachim Haraldsen. Tokyo lifestyle, personal development, and gaming heritage. Founded from Norway's largest gaming YouTube channel.",
    jobTitle: "Creator & Entrepreneur",
    sameAs: socialLinks
      .filter((link) => link.url.startsWith("http"))
      .map((link) => link.url),
    knowsAbout: [
      "Gaming",
      "Esports",
      "Content Creation",
      "Entrepreneurship",
      "Technology",
      "Executive Leadership",
      "Media & Publishing",
      "Tokyo Lifestyle",
      "Personal Development",
    ],
    nationality: {
      "@type": "Country",
      name: "Norway",
    },
    workLocation: {
      "@type": "City",
      name: "Tokyo",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
