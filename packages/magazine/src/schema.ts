import { z } from "zod";
import type { MagazineResourceBundle } from "./resources";

export const designStyleSchema = z.object({
  width: z.string().optional(), maxWidth: z.string().optional(), minHeight: z.string().optional(), height: z.string().optional(),
  padding: z.string().optional(), margin: z.string().optional(), gap: z.string().optional(),
  display: z.enum(["block", "flex", "grid", "none"]).optional(), flexDirection: z.enum(["row", "column"]).optional(),
  flexWrap: z.string().optional(), flex: z.string().optional(), alignItems: z.string().optional(), justifyContent: z.string().optional(),
  gridTemplateColumns: z.string().optional(), gridTemplateRows: z.string().optional(), gridArea: z.string().optional(),
  position: z.enum(["relative", "absolute", "sticky"]).optional(), inset: z.string().optional(),
  color: z.string().optional(), background: z.string().optional(), backgroundImage: z.string().optional(), backgroundSize: z.string().optional(), backgroundPosition: z.string().optional(), backgroundRepeat: z.string().optional(), border: z.string().optional(), borderRadius: z.string().optional(), boxShadow: z.string().optional(),
  overflow: z.enum(["visible", "hidden", "auto", "clip"]).optional(), opacity: z.number().min(0).max(1).optional(), transform: z.string().optional(), zIndex: z.number().int().optional(),
  objectFit: z.enum(["contain", "cover", "fill", "none", "scale-down"]).optional(), objectPosition: z.string().optional(), filter: z.string().optional(), mixBlendMode: z.string().optional(), pointerEvents: z.string().optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(), fontFamily: z.string().optional(), fontSize: z.string().optional(),
  fontWeight: z.union([z.number(), z.string()]).optional(), lineHeight: z.union([z.number(), z.string()]).optional(), letterSpacing: z.string().optional()
}).strict();

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
