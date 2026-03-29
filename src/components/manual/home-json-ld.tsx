import { siteConfig } from "@/config/site";

export function HomeJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        inLanguage: "pt-BR",
      },
      {
        "@type": "Organization",
        name: siteConfig.organization.name,
        url: siteConfig.organization.url,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
