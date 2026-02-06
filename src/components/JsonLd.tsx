export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Joachim Haraldsen",
    alternateName: "Noobwork",
    url: "https://www.noobwork.no",
    image: "https://www.noobwork.no/joachim.jpg",
    jobTitle: "Creator & Entrepreneur",
    sameAs: [
      "https://youtube.com/user/Noobworkify",
      "https://twitter.com/noobwork",
      "https://instagram.com/noobwork",
      "https://linkedin.com/in/joachim-haraldsen",
    ],
    knowsAbout: ["Gaming", "Esports", "Content Creation", "Entrepreneurship", "Technology"],
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
