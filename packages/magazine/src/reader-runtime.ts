import type { MagazineGlobalDefinition, MagazinePageDefinition } from "./schema.js";
import { legacyPagesToSpreadDefinitions } from "./spread.js";

export const MAGAZINE_COMPACT_MAX_WIDTH = 1100;
export const MAGAZINE_SMALL_MAX_WIDTH = 620;
export const MAGAZINE_MAX_PAGE_CACHE_ENTRIES = 10;

export type MagazineReadingMode = "spread" | "page";

export function magazineReadingModeForWidth(width: number): MagazineReadingMode {
  return width <= MAGAZINE_COMPACT_MAX_WIDTH ? "page" : "spread";
}

export function magazineTransitionKindForMode(mode: MagazineReadingMode): "slide" | "flip" {
  return mode === "page" ? "slide" : "flip";
}

/**
 * Canonical reader normalisation for every publication.
 * Native-spread magazines keep their authored spreads. Legacy/page-authored
 * magazines are adapted into the same spread runtime automatically.
 */
export function normalizeMagazineForReader(issue: MagazineGlobalDefinition): MagazineGlobalDefinition {
  return {
    ...issue,
    spreads: issue.spreads?.length
      ? issue.spreads
      : legacyPagesToSpreadDefinitions(issue.id, issue.pages),
  };
}

export function magazinePageManifest(
  pages: MagazinePageDefinition[],
): Array<Pick<MagazinePageDefinition, "id" | "slug" | "title" | "kind" | "access">> {
  return pages.map(({ id, slug, title, kind, access }) => ({
    id,
    slug,
    title,
    kind,
    access,
  }));
}
