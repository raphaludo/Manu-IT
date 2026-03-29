import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { discoverSlugsFromDisk } from "@/lib/manual/get-doc";
import { manualHrefFromSlug } from "@/lib/manual/paths";
import { listVisualPageSlugs } from "@/lib/visual-pages/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const slugs = await discoverSlugsFromDisk();
  const manualEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}${manualHrefFromSlug(slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const visualSlugs = await listVisualPageSlugs();
  const visualEntries: MetadataRoute.Sitemap = visualSlugs.map((slug) => ({
    url: `${base}/paginas/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/paginas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...manualEntries,
    ...visualEntries,
  ];
}
