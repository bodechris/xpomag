import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth, ensureAuthInfrastructure } from "../../../lib/auth-server";
import { MagazineReader } from "../../../components/magazine-reader";
import { getDemoMagazineBySlug } from "../../../lib/demo-magazine";
import { getAlphaCoverAssets } from "../../../lib/cover-assets";
import { getComposerDocument } from "../../../lib/composer-persistence";
import { createMagazineReaderPayload } from "../../../lib/magazine-reader-data";
import { articleJsonLd, buildPageMetadata } from "../../../lib/seo";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ issue: string }>;
};

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { issue: issueSlug } = await params;
  const issue = getDemoMagazineBySlug(issueSlug);
  const page = issue.pages[0];
  return page ? buildPageMetadata(issue, page) : {};
}

export default async function MagazineIssueRoute({ params }: RouteProps) {
  const { issue: issueSlug } = await params;
  const pageSlug = "cover";
  await ensureAuthInfrastructure();
  const viewerSession = await auth.api.getSession({ headers: await headers() });
  const viewerAuthenticated = Boolean(viewerSession?.user);
  const alphaCoverAssets = pageSlug === "cover" ? await getAlphaCoverAssets() : [];
  const coverDocument = await getComposerDocument(issueSlug, "cover", "published");
  const issue = getDemoMagazineBySlug(issueSlug, { alphaCoverAssets, coverDocument });
  const page = issue.pages.find((item) => item.slug === pageSlug) ?? issue.pages[0];
  const readerPayload = createMagazineReaderPayload(issue, pageSlug);
  const jsonLd = page ? articleJsonLd(issue, page) : null;

  return (
    <main className="xp-reader-page">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <div className="xp-container xp-home-shell">
        <MagazineReader issue={readerPayload.issue} initialPages={readerPayload.initialPages} initialPageSlug={pageSlug} viewerAuthenticated={viewerAuthenticated} />
      </div>
    </main>
  );
}
