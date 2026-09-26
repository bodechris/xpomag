import type { Metadata } from "next";
import type { DesignElementNode, MagazineGlobalDefinition, MagazinePageDefinition } from "@xpomag/magazine";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://xpomag-frontend.vercel.app").replace(/\/$/, "");

function textFromNode(node: DesignElementNode): string[] {
  const own = node.type === "text" && typeof node.props?.text === "string" ? [node.props.text] : [];
  return [...own, ...(node.children ?? []).flatMap(textFromNode)];
}

function imageFromNode(node: DesignElementNode): string | undefined {
  if (node.type === "image" && typeof node.props?.src === "string") return node.props.src;
  for (const child of node.children ?? []) {
    const image = imageFromNode(child);
    if (image) return image;
  }
}

export function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function pageDescription(issue: MagazineGlobalDefinition, page: MagazinePageDefinition): string {
  const copy = page.sections.flatMap((section) => section.elements.flatMap(textFromNode))
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter((value) => value && value.toLowerCase() !== page.title.toLowerCase())
    .join(" ");
  const fallback = `${page.title} — from ${issue.title}, ${issue.monthLabel}. Discover the people, places, businesses and ideas shaping ${issue.city}.`;
  const value = copy || fallback;
  return value.length > 158 ? `${value.slice(0, 155).trimEnd()}…` : value;
}

export function pageHeroImage(page: MagazinePageDefinition): string | undefined {
  for (const section of page.sections) {
    for (const element of section.elements) {
      const image = imageFromNode(element);
      if (image) return absoluteUrl(image);
    }
  }
  const resource = page.resources?.images?.find((image) => image.src)?.src;
  return resource ? absoluteUrl(resource) : undefined;
}

export function buildPageMetadata(issue: MagazineGlobalDefinition, page: MagazinePageDefinition): Metadata {
  const canonical = `${SITE_URL}/magazine/${encodeURIComponent(issue.slug)}/${encodeURIComponent(page.slug)}`;
  const description = pageDescription(issue, page);
  const title = page.kind === "cover" ? `${issue.title} · ${issue.monthLabel}` : page.title;
  const ogImage = `${canonical}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: page.access === "public", follow: true },
    openGraph: {
      type: page.kind === "cover" ? "website" : "article",
      title,
      description,
      url: canonical,
      siteName: "XpoMag",
      locale: "en_ZA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${title} — XpoMag` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "article:section": page.kind,
      "xpomag:issue": issue.issueLabel,
      "xpomag:edition": issue.city,
    },
  };
}

export function articleJsonLd(issue: MagazineGlobalDefinition, page: MagazinePageDefinition) {
  const url = `${SITE_URL}/magazine/${issue.slug}/${page.slug}`;
  const image = pageHeroImage(page);
  return {
    "@context": "https://schema.org",
    "@type": page.kind === "cover" ? "CreativeWork" : "Article",
    headline: page.title,
    description: pageDescription(issue, page),
    ...(image ? { image: [image] } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@type": "PublicationIssue", name: issue.title, issueNumber: issue.issueLabel, datePublished: issue.monthLabel },
    publisher: { "@type": "Organization", name: "XpoMag", url: SITE_URL },
    about: { "@type": "Place", name: issue.city },
  };
}
