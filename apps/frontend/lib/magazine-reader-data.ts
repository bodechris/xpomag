import type { MagazineGlobalDefinition, MagazinePageDefinition } from "@xpomag/magazine";

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
