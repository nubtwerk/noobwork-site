import { socialLinks } from "@/data/social-links";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Joachim Haraldsen",
    alternateName: "Noobwork",
    url: "https://www.noobwork.no",
    image: "https://www.noobwork.no/joachim.jpg",
    description: "Premium fitness and lifestyle creator brand by Joachim Haraldsen. Training, nutrition, personal development, and gaming heritage, documented from Seoul. Built on Norway's largest gaming YouTube channel.",
    jobTitle: "Creator & Entrepreneur",
    sameAs: socialLinks
      .filter((link) => link.url.startsWith("http"))
      .map((link) => link.url),
    knowsAbout: [
      "Fitness & Training",
      "Nutrition",
      "Personal Development",
      "Content Creation",
      "Entrepreneurship",
      "Gaming",
      "Esports",
      "Executive Leadership",
      "Media & Publishing",
    ],
    nationality: {
      "@type": "Country",
      name: "Norway",
    },
    workLocation: {
      "@type": "City",
      name: "Seoul",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
