import { headers } from "next/headers";
import { auth, ensureAuthInfrastructure } from "../../../../lib/auth-server";
import { MagazineReader } from "../../../../components/magazine-reader";
import { SiteHeader } from "../../../../components/site-header";
import { getDemoMagazineBySlug } from "../../../../lib/demo-magazine";
import { getAlphaCoverAssets } from "../../../../lib/cover-assets";
import { getComposerDocument } from "../../../../lib/composer-persistence";
import { createMagazineReaderPayload } from "../../../../lib/magazine-reader-data";

export const dynamic = "force-dynamic";

export default async function MagazinePageRoute({ params, searchParams }: { params: Promise<{ issue: string; page: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { issue: issueSlug, page: pageSlug } = await params;
  await ensureAuthInfrastructure();
  const viewerSession = await auth.api.getSession({ headers: await headers() });
  const viewerAuthenticated = Boolean(viewerSession?.user);
  const { preview } = await searchParams;
  const alphaCoverAssets = pageSlug === "cover" ? await getAlphaCoverAssets() : [];
  const coverDocument = pageSlug === "cover" ? await getComposerDocument(issueSlug, "cover", preview === "draft" ? "draft" : "published") : null;
  const issue = getDemoMagazineBySlug(issueSlug, { alphaCoverAssets, coverDocument });
  const readerPayload = createMagazineReaderPayload(issue, pageSlug);

  return (
    <main>
      <SiteHeader city={issue.city} />
      <div className="xp-container xp-home-shell">
        <MagazineReader issue={readerPayload.issue} initialPages={readerPayload.initialPages} initialPageSlug={pageSlug} viewerAuthenticated={viewerAuthenticated} />
      </div>
    </main>
  );
}
