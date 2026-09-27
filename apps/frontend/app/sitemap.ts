import type { MetadataRoute } from "next";
import { getDemoMagazineBySlug } from "../lib/demo-magazine";
import { SITE_URL } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const issues = [
    getDemoMagazineBySlug("demo-johannesburg-001"),
    getDemoMagazineBySlug("steyn-city-2026"),
  ];
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...issues.flatMap((issue) =>
      issue.pages
        .filter((page) => page.access === "public")
        .map((page) => ({
          url: page.kind === "cover"
            ? `${SITE_URL}/magazine/${issue.slug}/${page.slug}`
            : `${SITE_URL}/article/${issue.slug}/${page.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: page.kind === "cover" ? 0.9 : 0.75,
        })),
    ),
  ];
}
