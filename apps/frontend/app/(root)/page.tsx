import { headers } from "next/headers";
import { auth, ensureAuthInfrastructure } from "../../lib/auth-server";
import { MagazineReader } from "../../components/magazine-reader";
import { SiteHeader } from "../../components/site-header";
import { selectDemoMagazine } from "../../lib/demo-magazine";
import { getRequestCity } from "../../lib/location";
import { getAlphaCoverAssets } from "../../lib/cover-assets";
import { getComposerDocument } from "../../lib/composer-persistence";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureAuthInfrastructure();
  const viewerSession = await auth.api.getSession({ headers: await headers() });
  const viewerAuthenticated = Boolean(viewerSession?.user);
  const location = await getRequestCity();
  const detectedCity = location.city ?? "Johannesburg";
  const alphaCoverAssets = await getAlphaCoverAssets();
  const issueSlug = `demo-${detectedCity.toLowerCase().replace(/\s+/g, "-")}-001`;
  const coverDocument = await getComposerDocument(issueSlug, "cover", "published");

  // This is the temporary curator boundary. Today it selects deterministic demo
  // content; later it will resolve the best published issue for the member/location.
  const curatedIssue = selectDemoMagazine(detectedCity, { alphaCoverAssets, coverDocument });

  return (
    <main>
      <SiteHeader city={curatedIssue.city} />
      <div className="xp-container xp-home-shell">
        <MagazineReader issue={curatedIssue} viewerAuthenticated={viewerAuthenticated} />
      </div>
    </main>
  );
}
