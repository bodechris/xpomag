import { normalizeMagazineForReader } from "@xpomag/magazine";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth, ensureAuthInfrastructure } from "../../../../lib/auth-server";
import { ArticlePost } from "../../../../components/article-post";
import { SiteHeader } from "../../../../components/site-header";
import { getDemoMagazineBySlug } from "../../../../lib/demo-magazine";
import { articleJsonLd, buildPageMetadata } from "../../../../lib/seo";
import { isStandaloneArticleKind } from "../../../../lib/magazine-reader-data";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ issue: string; page: string }>;
};

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { issue: issueSlug, page: pageSlug } = await params;
  const issue = normalizeMagazineForReader(getDemoMagazineBySlug(issueSlug));
  const page = issue.pages.find((item) => item.slug === pageSlug);
  if (!page) return {};
  return buildPageMetadata(issue, page);
}

export default async function ArticlePage({ params }: RouteProps) {
  const { issue: issueSlug, page: pageSlug } = await params;
  const issue = normalizeMagazineForReader(getDemoMagazineBySlug(issueSlug));
  const page = issue.pages.find((item) => item.slug === pageSlug);
  if (!page || !isStandaloneArticleKind(page.kind)) notFound();

  await ensureAuthInfrastructure();
  const viewerSession = await auth.api.getSession({ headers: await headers() });
  const jsonLd = articleJsonLd(issue, page);

  return (
    <main className="xp-article-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader city={issue.city} />
      <ArticlePost issue={issue} page={page} viewerAuthenticated={Boolean(viewerSession?.user)} />
    </main>
  );
}
