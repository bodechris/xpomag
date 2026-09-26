import type { MetadataRoute } from "next";
import { getDemoMagazineBySlug } from "../lib/demo-magazine";
import { SITE_URL } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const issue = getDemoMagazineBySlug("demo-johannesburg-001");
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...issue.pages.filter((page) => page.access === "public").map((page) => ({
      url: `${SITE_URL}/magazine/${issue.slug}/${page.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.kind === "cover" ? 0.9 : 0.7,
    })),
  ];
}
