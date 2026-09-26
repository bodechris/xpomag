import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth, ensureAuthInfrastructure } from "../../../../lib/auth-server";
import { MagazineReader } from "../../../../components/magazine-reader";
import { SiteHeader } from "../../../../components/site-header";
import { getDemoMagazineBySlug } from "../../../../lib/demo-magazine";
import { getAlphaCoverAssets } from "../../../../lib/cover-assets";
import { getComposerDocument } from "../../../../lib/composer-persistence";
import { createMagazineReaderPayload } from "../../../../lib/magazine-reader-data";
import { articleJsonLd, buildPageMetadata } from "../../../../lib/seo";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ issue: string; page: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Pick<RouteProps, "params">): Promise<Metadata> {
  const { issue: issueSlug, page: pageSlug } = await params;
  const issue = getDemoMagazineBySlug(issueSlug);
  const page = issue.pages.find((item) => item.slug === pageSlug) ?? issue.pages[0];
  return page ? buildPageMetadata(issue, page) : {};
}

export default async function MagazinePageRoute({ params, searchParams }: RouteProps) {
  const { issue: issueSlug, page: pageSlug } = await params;
  await ensureAuthInfrastructure();
  const viewerSession = await auth.api.getSession({ headers: await headers() });
  const viewerAuthenticated = Boolean(viewerSession?.user);
  const { preview } = await searchParams;
  const alphaCoverAssets = pageSlug === "cover" ? await getAlphaCoverAssets() : [];
  const coverDocument = pageSlug === "cover" ? await getComposerDocument(issueSlug, "cover", preview === "draft" ? "draft" : "published") : null;
  const issue = getDemoMagazineBySlug(issueSlug, { alphaCoverAssets, coverDocument });
  const page = issue.pages.find((item) => item.slug === pageSlug) ?? issue.pages[0];
  const readerPayload = createMagazineReaderPayload(issue, pageSlug);
  const jsonLd = page ? articleJsonLd(issue, page) : null;

  return (
    <main>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <SiteHeader city={issue.city} />
      <div className="xp-container xp-home-shell">
        <MagazineReader issue={readerPayload.issue} initialPages={readerPayload.initialPages} initialPageSlug={pageSlug} viewerAuthenticated={viewerAuthenticated} />
      </div>
    </main>
  );
}
