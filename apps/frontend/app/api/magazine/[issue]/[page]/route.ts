import { getAlphaCoverAssets } from "../../../../../lib/cover-assets";
import { getComposerDocument } from "../../../../../lib/composer-persistence";
import { getDemoMagazineBySlug } from "../../../../../lib/demo-magazine";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ issue: string; page: string }> },
) {
  const { issue: issueSlug, page: pageSlug } = await context.params;

  const isCover = pageSlug === "cover";
  const [alphaCoverAssets, coverDocument] = await Promise.all([
    isCover ? getAlphaCoverAssets() : Promise.resolve([]),
    isCover
      ? getComposerDocument(issueSlug, "cover", "published")
      : Promise.resolve(null),
  ]);

  const issue = getDemoMagazineBySlug(issueSlug, {
    alphaCoverAssets,
    coverDocument,
  });
  const page = issue.pages.find((candidate) => candidate.slug === pageSlug);

  if (!page) {
    return Response.json({ error: "Magazine page not found" }, { status: 404 });
  }

  return Response.json(page, {
    headers: {
      "Cache-Control": isCover
        ? "private, no-store"
        : "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
