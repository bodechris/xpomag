import type { ComposerDocument } from "./editor.js";

export type DemoCoverDocumentOptions = {
  city?: string;
  portraitSrc?: string;
};

export function createDemoCoverDocument(options: DemoCoverDocumentOptions = {}): ComposerDocument {
  const city = (options.city || "Johannesburg").trim() || "Johannesburg";
  const portraitSrc = options.portraitSrc || "/resources/cover-subject-placeholder.svg";
  const cityUpper = city.toUpperCase();

  return {
    id: `cover-${city.toLowerCase().replace(/\s+/g, "-")}-001`,
    issueId: `demo-${city.toLowerCase().replace(/\s+/g, "-")}-001`,
    pageId: "cover",
    pageSlug: "cover",
    title: `${city} · October 2026 · Cover`,
    canvas: { width: 1200, height: 1600 },
    background: [
      { id: "bg-solid", name: "Paper", kind: "solid", value: "#d9ddd8", opacity: 1 },
      { id: "bg-radial", name: "Soft light", kind: "gradient", value: "radial-gradient(circle at 70% 24%, rgba(255,255,255,.96), rgba(255,255,255,0) 42%)", opacity: 1, blendMode: "screen" },
      { id: "bg-depth", name: "Cool depth", kind: "gradient", value: "linear-gradient(135deg, rgba(94,107,155,.18), rgba(210,216,197,.06) 48%, rgba(128,151,128,.16))", opacity: 1, blendMode: "multiply" },
    ],
    nodes: [
      {
        id: "masthead", name: "XpoMag masthead", kind: "brand", content: "XpoMag",
        placement: { x: 4, y: 2.2, width: 76, height: 14, zIndex: 12 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 132, fontWeight: 900, lineHeight: 0.8, letterSpacing: -8, color: "#090909" },
      },
      {
        id: "issue-meta", name: "Issue metadata", kind: "text", content: `${cityUpper} · OCTOBER 2026 · ISSUE 001`,
        placement: { x: 63, y: 8.6, width: 31, height: 3, zIndex: 30 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 13, fontWeight: 800, lineHeight: 1.2, letterSpacing: 2.6, color: "#171717", textAlign: "right" },
      },
      {
        id: "portrait", name: "Featured subject", kind: "image", src: portraitSrc,
        placement: { x: 23, y: 11, width: 62, height: 82, zIndex: 20 },
        imageStyle: { objectFit: "contain", objectPosition: "50% 100%", opacity: 1 },
        story: { id: "cover-sandton-olympus", targetPageSlug: "feature", targetSectionSlug: "sandton-olympus", engagementAppearance: "dark" },
      },
      {
        id: "left-kicker", name: "Left kicker", kind: "text", content: "THE CITY ISSUE",
        placement: { x: 4, y: 34, width: 16, height: 3, zIndex: 35 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 14, fontWeight: 800, lineHeight: 1.1, letterSpacing: 2.2, color: "#101010", textTransform: "uppercase" },
      },
      {
        id: "left-headline", name: "Left coverline", kind: "text", content: "Rosebank's\ngreen town square\ncomes alive.",
        placement: { x: 4, y: 38, width: 22, height: 19, zIndex: 35 },
        textStyle: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 49, fontWeight: 400, lineHeight: 0.92, letterSpacing: -2.6, color: "#101010" },
        story: { id: "cover-rosebank-nine-yards", targetPageSlug: "editorial", targetSectionSlug: "rosebank-nine-yards", engagementAnchor: true, engagementAppearance: "dark" },
      },
      {
        id: "left-copy", name: "Left supporting copy", kind: "text", content: "Retail is tightening up: Rosebank Mall vacancy is down to 1.3%.",
        placement: { x: 4, y: 61, width: 18, height: 11, zIndex: 35 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 18, fontWeight: 650, lineHeight: 1.25, letterSpacing: -0.2, color: "#101010" },
        story: { id: "cover-rosebank-retail", targetPageSlug: "editorial", targetSectionSlug: "rosebank-retail", engagementAnchor: true, engagementAppearance: "dark" },
      },
      {
        id: "right-kicker", name: "Right kicker", kind: "text", content: "ALSO INSIDE",
        placement: { x: 81, y: 39, width: 14, height: 3, zIndex: 35 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 14, fontWeight: 850, lineHeight: 1.1, letterSpacing: 2.1, color: "#2f55ff", textTransform: "uppercase" },
      },
      {
        id: "right-story-1", name: "Right story one", kind: "text", content: "Sandton's skyline goes residential",
        placement: { x: 80.8, y: 44, width: 15, height: 10, zIndex: 35 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 26, fontWeight: 820, lineHeight: 0.94, letterSpacing: -1.3, color: "#0b0b0b" },
        story: { id: "cover-sandton-olympus", targetPageSlug: "feature", targetSectionSlug: "sandton-olympus", engagementAnchor: true, engagementAppearance: "dark" },
      },
      {
        id: "right-story-2", name: "Right story two", kind: "text", content: "Gautrain enters its post-2026 era",
        placement: { x: 80.8, y: 57.5, width: 15, height: 12, zIndex: 35 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 25, fontWeight: 820, lineHeight: 0.94, letterSpacing: -1.3, color: "#0b0b0b" },
        story: { id: "cover-gautrain-next", targetPageSlug: "weekend", targetSectionSlug: "gautrain-next", engagementAnchor: true, engagementAppearance: "dark" },
      },
      {
        id: "lead-band", name: "Lead story band", kind: "shape",
        placement: { x: 4, y: 82, width: 92, height: 14, zIndex: 28 },
        style: { background: "rgba(7,7,7,.94)", borderRadius: 0 },
        story: { id: "cover-hospitality-shift", targetPageSlug: "guide", targetSectionSlug: "hospitality-shift", engagementAppearance: "light" },
      },
      {
        id: "lead-kicker", name: "Lead kicker", kind: "text", content: "ROSEBANK + SANDTON / THE CITY ISSUE",
        placement: { x: 6, y: 84, width: 32, height: 3, zIndex: 40 },
        textStyle: { fontFamily: "var(--font-geist-sans, Arial, sans-serif)", fontSize: 14, fontWeight: 850, lineHeight: 1, letterSpacing: 2.3, color: "#d8ff3e", textTransform: "uppercase" },
        story: { id: "cover-hospitality-shift", targetPageSlug: "guide", targetSectionSlug: "hospitality-shift", engagementAppearance: "light" },
      },
      {
        id: "lead-headline", name: "Lead headline", kind: "text", content: "The new hospitality\nplaybook.",
        placement: { x: 6, y: 87.5, width: 60, height: 8, zIndex: 40 },
        textStyle: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 48, fontWeight: 400, lineHeight: 0.92, letterSpacing: -2.2, color: "#ffffff" },
        story: { id: "cover-hospitality-shift", targetPageSlug: "guide", targetSectionSlug: "hospitality-shift", engagementAnchor: true, engagementAppearance: "light" },
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}
