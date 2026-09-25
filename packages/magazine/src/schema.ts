import { z } from "zod";
import type { MagazineResourceBundle } from "./resources.js";

const designStyleValueSchema = z.union([z.string(), z.number(), z.undefined()]);

/**
 * Magazine styles are authored as React-compatible inline CSS objects.
 * Keep the schema intentionally open so page templates can use the full CSS
 * surface (for example top/left/right/bottom, whiteSpace, borderTop,
 * paddingTop, fontStyle, backdropFilter and future CSS properties) without
 * having to update this package every time a new visual treatment is added.
 *
 * Runtime rendering still casts the object to React.CSSProperties, while
 * Zod guarantees values remain serializable primitive CSS values.
 */
export const designStyleSchema = z.record(z.string(), designStyleValueSchema);

export type DesignStyle = z.infer<typeof designStyleSchema>;
export type DesignElementType = "frame" | "stack" | "grid" | "text" | "brandMark" | "image" | "background" | "divider" | "spacer" | "reference" | "composerCanvas";

export type DesignElementNode = { id: string; type: DesignElementType; props?: Record<string, unknown>; style?: DesignStyle; children?: DesignElementNode[]; };

export const designElementSchema: z.ZodType<DesignElementNode> = z.lazy(() => z.object({
  id: z.string().min(1), type: z.enum(["frame", "stack", "grid", "text", "brandMark", "image", "background", "divider", "spacer", "reference", "composerCanvas"]),
  props: z.record(z.string(), z.unknown()).optional(), style: designStyleSchema.optional(), children: z.array(designElementSchema).optional()
}));

export type MagazineEngagementConfig = { reactions?: boolean; comments?: boolean; share?: boolean; save?: boolean; };

export type MagazineSection = {
  id: string;
  slug: string;
  title?: string;
  kind?: string;
  slot: string;
  resources?: MagazineResourceBundle;
  style?: DesignStyle;
  engagement?: MagazineEngagementConfig;
  elements: DesignElementNode[];
};

export type MagazinePageDefinition = {
  id: string;
  issueId: string;
  slug: string;
  title: string;
  kind: string;
  access: "public" | "member";
  layoutId: string;
  resources?: MagazineResourceBundle;
  styles?: Record<string, string>;
  background: DesignElementNode;
  sections: MagazineSection[];
};

export type MagazineGlobalDefinition = {
  id: string;
  slug: string;
  city: string;
  title: string;
  issueLabel: string;
  monthLabel: string;
  metadata: Record<string, string | number | boolean | null>;
  resources: MagazineResourceBundle;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  styles: Record<string, string>;
  designElements: Record<string, DesignElementNode>;
  pages: MagazinePageDefinition[];
};
