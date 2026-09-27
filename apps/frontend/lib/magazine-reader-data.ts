import { legacyPagesToSpreadDefinitions, type MagazineGlobalDefinition, type MagazinePageDefinition } from "@xpomag/magazine";

export type MagazinePageManifestItem = Pick<
  MagazinePageDefinition,
  "id" | "slug" | "title" | "kind" | "access"
>;

export type MagazineReaderIssue = Omit<MagazineGlobalDefinition, "pages"> & {
  pages: MagazinePageManifestItem[];
};

export function createMagazineReaderPayload(
  issue: MagazineGlobalDefinition,
  initialPageSlug?: string,
): { issue: MagazineReaderIssue; initialPages: MagazinePageDefinition[] } {
  const pageIndex = Math.max(
    0,
    initialPageSlug
      ? issue.pages.findIndex((page) => page.slug === initialPageSlug)
      : 0,
  );
  const initialPage = issue.pages[pageIndex] ?? issue.pages[0];

  return {
    issue: {
      ...issue,
      spreads: issue.spreads?.length ? issue.spreads : legacyPagesToSpreadDefinitions(issue.id, issue.pages),
      pages: issue.pages.map(({ id, slug, title, kind, access }) => ({
        id,
        slug,
        title,
        kind,
        access,
      })),
    },
    initialPages: initialPage ? [initialPage] : [],
  };
}


const STANDALONE_ARTICLE_KINDS = new Set(["editorial", "feature", "guide", "directory"]);

export function isStandaloneArticleKind(kind: string): boolean {
  return STANDALONE_ARTICLE_KINDS.has(kind);
}
