import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { discoverSlugsFromDisk } from "@/lib/manual/get-doc";
import { manualHrefFromSlug } from "@/lib/manual/paths";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const slugs = await discoverSlugsFromDisk();
  const manualEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}${manualHrefFromSlug(slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...manualEntries,
  ];
}
