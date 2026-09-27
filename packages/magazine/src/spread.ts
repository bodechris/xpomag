import type { MagazinePageDefinition, MagazineSection, DesignElementNode, DesignStyle } from "./schema.js";
import type { MagazineResourceBundle } from "./resources.js";

export type MagazineLeafSide = "left" | "right";
export type MagazineGutterBehaviour = "cross" | "avoid" | "clip" | "duplicate" | "reflow";
export type MagazineSpreadRegion = "spread" | MagazineLeafSide;

export type MagazineSpreadPiece = Omit<MagazineSection, "slot"> & {
  region?: MagazineSpreadRegion;
  slot?: string;
  gutterBehaviour?: MagazineGutterBehaviour;
};

export type MagazineSpreadDefinition = {
  id: string;
  issueId: string;
  slug: string;
  title: string;
  kind?: string;
  resources?: MagazineResourceBundle;
  styles?: Record<string, string>;
  style?: DesignStyle;
  background?: DesignElementNode;
  pieces: MagazineSpreadPiece[];
  /**
   * Transitional page refs keep old page-authored magazines compatible while
   * the spread becomes the canonical visual unit.
   */
  pageIds?: string[];
};

export type MagazineLeafDefinition = {
  side: MagazineLeafSide;
  pageIndex?: number;
  pageId?: string;
  pageSlug?: string;
};

export type MagazineMasterSpread = {
  id: string;
  spreadId: string;
  pageIndexes: number[];
  leftLeaf?: MagazineLeafDefinition;
  rightLeaf?: MagazineLeafDefinition;
};

/**
 * Canonical runtime grouping for the reader.
 * Desktop pairs facing pages; compact mode exposes one leaf at a time.
 * Existing page-authored magazines therefore run through the same master
 * spread navigation model as native spread-authored magazines.
 */
export function buildMasterSpreadsFromPages(
  pages: Array<Pick<MagazinePageDefinition, "id" | "slug">>,
  singleLeaf: boolean,
): MagazineMasterSpread[] {
  if (singleLeaf) {
    return pages.map((page, pageIndex) => ({
      id: `master-spread-${page.id}`,
      spreadId: `spread-${page.id}`,
      pageIndexes: [pageIndex],
      leftLeaf: {
        side: "left",
        pageIndex,
        pageId: page.id,
        pageSlug: page.slug,
      },
    }));
  }

  if (!pages.length) return [];

  const cover: MagazineMasterSpread = {
    id: `master-spread-${pages[0]!.id}`,
    spreadId: `spread-${pages[0]!.id}`,
    pageIndexes: [0],
    rightLeaf: {
      side: "right",
      pageIndex: 0,
      pageId: pages[0]!.id,
      pageSlug: pages[0]!.slug,
    },
  };

  const rest: MagazineMasterSpread[] = [];
  for (let pageIndex = 1; pageIndex < pages.length; pageIndex += 2) {
    const left = pages[pageIndex];
    const right = pages[pageIndex + 1];
    const pageIndexes = [pageIndex, pageIndex + 1].filter((index) => index < pages.length);
    rest.push({
      id: `master-spread-${left?.id ?? pageIndex}-${right?.id ?? "end"}`,
      spreadId: `spread-${left?.id ?? pageIndex}-${right?.id ?? "end"}`,
      pageIndexes,
      leftLeaf: left ? { side: "left", pageIndex, pageId: left.id, pageSlug: left.slug } : undefined,
      rightLeaf: right ? { side: "right", pageIndex: pageIndex + 1, pageId: right.id, pageSlug: right.slug } : undefined,
    });
  }

  return [cover, ...rest];
}
