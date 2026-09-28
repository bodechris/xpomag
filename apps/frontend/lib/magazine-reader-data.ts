import { magazinePageManifest, normalizeMagazineForReader, type MagazineGlobalDefinition, type MagazinePageDefinition } from "@xpomag/magazine";

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
  const normalized = normalizeMagazineForReader(issue);
  const pageIndex = Math.max(
    0,
    initialPageSlug
      ? normalized.pages.findIndex((page) => page.slug === initialPageSlug)
      : 0,
  );
  const initialPage = normalized.pages[pageIndex] ?? normalized.pages[0];

  return {
    issue: {
      ...normalized,
      pages: magazinePageManifest(normalized.pages),
    },
    initialPages: initialPage ? [initialPage] : [],
  };
}


const STANDALONE_ARTICLE_KINDS = new Set(["editorial", "feature", "guide", "directory"]);

export function isStandaloneArticleKind(kind: string): boolean {
  return STANDALONE_ARTICLE_KINDS.has(kind);
}
