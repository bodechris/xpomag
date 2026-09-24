export type ComposerViewport = "desktop" | "tablet" | "mobile";

export type ComposerPlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  zIndex: number;
};

export type ComposerTextStyle = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right";
  color?: string;
  textTransform?: "none" | "uppercase";
};

export type ComposerImageStyle = {
  objectFit?: "cover" | "contain";
  objectPosition?: string;
  opacity?: number;
  mixBlendMode?: string;
  filter?: string;
};

export type ComposerStoryLink = {
  id: string;
  targetPageSlug: string;
  targetSectionSlug: string;
  engagementAnchor?: boolean;
  engagementAppearance?: "auto" | "light" | "dark";
};

export type ComposerNode = {
  id: string;
  name: string;
  kind: "text" | "image" | "brand" | "shape" | "group";
  locked?: boolean;
  hidden?: boolean;
  content?: string;
  src?: string;
  placement: ComposerPlacement;
  textStyle?: ComposerTextStyle;
  imageStyle?: ComposerImageStyle;
  style?: Record<string, string | number>;
  story?: ComposerStoryLink;
};

export type ComposerBackgroundLayer = {
  id: string;
  name: string;
  kind: "solid" | "gradient" | "image" | "gobo";
  value: string;
  opacity: number;
  blendMode?: string;
};

export type ComposerDocument = {
  id: string;
  issueId: string;
  pageId: string;
  pageSlug: string;
  title: string;
  canvas: { width: number; height: number };
  background: ComposerBackgroundLayer[];
  nodes: ComposerNode[];
  updatedAt: string;
};

export type ComposerVersion = {
  id: string;
  label: string;
  createdAt: string;
  document: ComposerDocument;
};
