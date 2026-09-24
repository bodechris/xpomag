import type { CSSProperties } from "react";

export type MagazineLayoutSlot = {
  name: string;
  area?: string;
  grow?: number;
  basis?: string;
};

export type MagazineLayoutDefinition = {
  id: string;
  name: string;
  category: "cover" | "feature" | "article" | "contents" | "gallery" | "directory" | "advert" | "utility";
  description: string;
  mode: "grid" | "flex";
  style: CSSProperties;
  slots: MagazineLayoutSlot[];
};

const grid = (
  id: string,
  name: string,
  category: MagazineLayoutDefinition["category"],
  description: string,
  columns: string,
  rows: string,
  areas: string[],
): MagazineLayoutDefinition => ({
  id,
  name,
  category,
  description,
  mode: "grid",
  style: {
    display: "grid",
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gridTemplateAreas: areas.map((row) => `\"${row}\"`).join(" "),
    width: "100%",
    height: "100%",
  },
  slots: Array.from(new Set(areas.join(" ").split(/\s+/))).filter(Boolean).map((area) => ({ name: area, area })),
});

const flex = (
  id: string,
  name: string,
  category: MagazineLayoutDefinition["category"],
  description: string,
  direction: "row" | "column",
  slots: MagazineLayoutSlot[],
): MagazineLayoutDefinition => ({
  id,
  name,
  category,
  description,
  mode: "flex",
  style: { display: "flex", flexDirection: direction, width: "100%", height: "100%" },
  slots,
});

export const MAGAZINE_LAYOUTS: MagazineLayoutDefinition[] = [
  grid("cover-full-bleed", "Full Bleed Cover", "cover", "Single full-page statement area.", "1fr", "1fr", ["hero"]),
  grid("cover-top-bottom", "Masthead + Story", "cover", "Top masthead with lower story block.", "1fr", "34% 66%", ["masthead", "story"]),
  grid("cover-left-rail", "Left Rail Cover", "cover", "Slim editorial rail beside a dominant cover field.", "22% 78%", "1fr", ["rail hero"]),
  grid("cover-right-rail", "Right Rail Cover", "cover", "Dominant cover field with slim utility rail.", "78% 22%", "1fr", ["hero rail"]),
  grid("cover-quadrant", "Quadrant Cover", "cover", "Four editorial cover zones.", "1fr 1fr", "1fr 1fr", ["a b", "c d"]),
  grid("cover-editorial-portrait", "Editorial Portrait Cover", "cover", "Masthead, centered portrait, side coverlines and lead story arranged as a modern business/fashion magazine cover.", "22% 56% 22%", "19% 57% 24%", ["masthead masthead masthead", "left portrait right", "lead lead lead"]),

  grid("feature-50-50", "Balanced Split", "feature", "Classic equal two-column feature.", "1fr 1fr", "1fr", ["left right"]),
  grid("feature-40-60", "Image 40 / Copy 60", "feature", "Narrow visual field with larger text field.", "40% 60%", "1fr", ["media copy"]),
  grid("feature-60-40", "Image 60 / Copy 40", "feature", "Large visual field with compact copy.", "60% 40%", "1fr", ["media copy"]),
  grid("feature-30-70", "Rail 30 / Feature 70", "feature", "Editorial rail paired with dominant story area.", "30% 70%", "1fr", ["rail feature"]),
  grid("feature-70-30", "Feature 70 / Rail 30", "feature", "Dominant story area with utility rail.", "70% 30%", "1fr", ["feature rail"]),
  grid("feature-hero-top", "Hero Top + Two Columns", "feature", "Wide hero above two supporting blocks.", "1fr 1fr", "58% 42%", ["hero hero", "left right"]),
  grid("feature-hero-bottom", "Two Columns + Hero Bottom", "feature", "Two supporting blocks above a wide hero.", "1fr 1fr", "42% 58%", ["left right", "hero hero"]),
  grid("feature-offset-left", "Offset Feature Left", "feature", "Large left block with stacked right modules.", "62% 38%", "1fr 1fr", ["hero top", "hero bottom"]),
  grid("feature-offset-right", "Offset Feature Right", "feature", "Stacked left modules beside large right block.", "38% 62%", "1fr 1fr", ["top hero", "bottom hero"]),
  grid("feature-t-shape", "T Feature", "feature", "Wide introduction above three-column body.", "1fr 1fr 1fr", "35% 65%", ["intro intro intro", "a b c"]),

  grid("article-classic", "Classic Article", "article", "Headline, body and side note.", "72% 28%", "26% 74%", ["headline headline", "body aside"]),
  grid("article-wide-body", "Wide Body", "article", "Large headline followed by wide body.", "1fr", "30% 70%", ["headline", "body"]),
  grid("article-two-column", "Two Column Article", "article", "Headline over two body columns.", "1fr 1fr", "28% 72%", ["headline headline", "left right"]),
  grid("article-three-column", "Three Column Article", "article", "Headline over three text columns.", "1fr 1fr 1fr", "25% 75%", ["headline headline headline", "a b c"]),
  grid("article-pullquote", "Article + Pull Quote", "article", "Main copy beside oversized pull quote.", "58% 42%", "1fr", ["body quote"]),
  grid("article-side-caption", "Article + Caption Rail", "article", "Main reading column with narrow caption rail.", "76% 24%", "1fr", ["body rail"]),
  grid("article-led-image", "Image-led Article", "article", "Dominant image above headline and body.", "45% 55%", "55% 45%", ["media media", "headline body"]),
  grid("article-portrait-led", "Portrait-led Article", "article", "Tall portrait beside stacked headline and copy.", "45% 55%", "35% 65%", ["media headline", "media body"]),
  grid("article-bottom-notes", "Article + Bottom Notes", "article", "Primary body with horizontal notes strip.", "1fr", "76% 24%", ["body", "notes"]),
  grid("article-sidebar-left", "Left Sidebar Article", "article", "Slim metadata rail beside body.", "24% 76%", "1fr", ["aside body"]),

  grid("contents-index", "Contents Index", "contents", "Title block with large index list.", "34% 66%", "1fr", ["title list"]),
  grid("contents-modular", "Modular Contents", "contents", "Four modular contents groups.", "1fr 1fr", "1fr 1fr", ["a b", "c d"]),
  grid("contents-hero-list", "Hero + Contents List", "contents", "Image/feature field beside issue index.", "48% 52%", "1fr", ["hero list"]),
  grid("contents-numbered", "Numbered Contents", "contents", "Large issue number above a broad contents area.", "1fr", "30% 70%", ["number", "list"]),
  flex("contents-stacked", "Stacked Contents", "contents", "Flexible vertical contents sections.", "column", [
    { name: "heading", basis: "24%" }, { name: "list", grow: 1 }, { name: "footer", basis: "16%" },
  ]),

  grid("gallery-2up", "Two-up Gallery", "gallery", "Two equal image fields.", "1fr 1fr", "1fr", ["a b"]),
  grid("gallery-3up", "Three-up Gallery", "gallery", "Three equal vertical image fields.", "1fr 1fr 1fr", "1fr", ["a b c"]),
  grid("gallery-hero-thumbs", "Hero + Thumbnails", "gallery", "Large image with supporting thumbnail strip.", "68% 32%", "1fr 1fr", ["hero a", "hero b"]),
  grid("gallery-mosaic-left", "Left Mosaic", "gallery", "Large left image and four smaller right modules.", "60% 20% 20%", "1fr 1fr", ["hero a b", "hero c d"]),
  grid("gallery-mosaic-right", "Right Mosaic", "gallery", "Four small modules with large right image.", "20% 20% 60%", "1fr 1fr", ["a b hero", "c d hero"]),
  grid("gallery-filmstrip", "Filmstrip", "gallery", "Wide main image over three stills.", "1fr 1fr 1fr", "72% 28%", ["hero hero hero", "a b c"]),
  grid("gallery-editorial", "Editorial Gallery", "gallery", "Image pair with caption and text block.", "55% 45%", "60% 40%", ["hero secondary", "caption copy"]),

  grid("directory-list", "Directory List", "directory", "Heading beside compact listing area.", "35% 65%", "1fr", ["heading list"]),
  grid("directory-two-column", "Two Column Directory", "directory", "Two equal directory lists.", "1fr 1fr", "1fr", ["left right"]),
  grid("directory-category", "Categorised Directory", "directory", "Category rail beside business index.", "28% 72%", "1fr", ["categories list"]),
  grid("directory-cards", "Directory Cards", "directory", "Four business card zones.", "1fr 1fr", "1fr 1fr", ["a b", "c d"]),
  grid("directory-featured", "Featured Directory", "directory", "Featured business above compact directory.", "1fr", "44% 56%", ["featured", "list"]),

  grid("advert-full", "Full Page Advert", "advert", "Single full-page sponsored area.", "1fr", "1fr", ["ad"]),
  grid("advert-split", "Split Advert", "advert", "Visual and offer split.", "58% 42%", "1fr", ["media offer"]),
  grid("advert-banner", "Banner + Editorial", "advert", "Sponsored banner above supporting content.", "1fr", "32% 68%", ["banner", "content"]),
  grid("advert-inset", "Inset Advert", "advert", "Editorial field with inset ad zone.", "65% 35%", "1fr", ["content ad"]),
  grid("advert-tiles", "Sponsored Tiles", "advert", "Four sponsored modules.", "1fr 1fr", "1fr 1fr", ["a b", "c d"]),

  grid("utility-full", "Utility Full", "utility", "Single utility section.", "1fr", "1fr", ["main"]),
  grid("utility-header-body", "Header + Body", "utility", "Compact header over flexible body.", "1fr", "18% 82%", ["header", "body"]),
  grid("utility-header-body-footer", "Header + Body + Footer", "utility", "Three-part utility page.", "1fr", "16% 68% 16%", ["header", "body", "footer"]),
];

export const MAGAZINE_LAYOUT_MAP = Object.fromEntries(MAGAZINE_LAYOUTS.map((layout) => [layout.id, layout]));

export function getMagazineLayout(id: string): MagazineLayoutDefinition {
  return MAGAZINE_LAYOUT_MAP[id] ?? MAGAZINE_LAYOUT_MAP["utility-full"]!;
}
