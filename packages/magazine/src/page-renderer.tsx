import type { CSSProperties, ReactNode } from "react";
import { DesignElement } from "./renderer";
import { getMagazineLayout } from "./layouts";
import type { MagazinePageDefinition, MagazineSection } from "./schema";
import type { ComposerNode } from "./editor";

export type SectionEngagementRenderer = (section: MagazineSection) => ReactNode;

export function MagazinePageRenderer({ page, globalElements, renderEngagement, renderComposerNodeOverlay, onComposerNodeActivate }: { page: MagazinePageDefinition; globalElements?: Record<string, import("./schema").DesignElementNode>; renderEngagement?: SectionEngagementRenderer; renderComposerNodeOverlay?: (node: ComposerNode) => ReactNode; onComposerNodeActivate?: (node: ComposerNode) => void }) {
  const layout = getMagazineLayout(page.layoutId);
  return (
    <div
      data-magazine-page={page.slug}
      data-layout={layout.id}
      style={{ ...layout.style, position: "relative", isolation: "isolate", overflow: "hidden" }}
    >
      <DesignElement node={page.background} registry={globalElements} renderComposerNodeOverlay={renderComposerNodeOverlay} onComposerNodeActivate={onComposerNodeActivate} />
      {page.sections.map((section) => {
        const slot = layout.slots.find((item) => item.name === section.slot);
        const style: CSSProperties = layout.mode === "grid"
          ? { gridArea: slot?.area ?? section.slot, minWidth: 0, minHeight: 0, position: "relative", zIndex: 1, ...(section.style as CSSProperties) }
          : { flex: slot?.grow ? String(slot.grow) : undefined, flexBasis: slot?.basis, minWidth: 0, minHeight: 0, position: "relative", zIndex: 1, ...(section.style as CSSProperties) };
        return (
          <section id={section.slug} data-magazine-section={section.slug} data-section-id={section.id} key={section.id} style={style}>
            {section.elements.map((element) => <DesignElement key={element.id} node={element} registry={globalElements} renderComposerNodeOverlay={renderComposerNodeOverlay} onComposerNodeActivate={onComposerNodeActivate} />)}
            {renderEngagement?.(section)}
          </section>
        );
      })}
    </div>
  );
}
