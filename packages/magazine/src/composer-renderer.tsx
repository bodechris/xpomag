import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";
import type { ComposerBackgroundLayer, ComposerDocument, ComposerNode } from "./editor.js";

function backgroundLayerStyle(layer: ComposerBackgroundLayer): CSSProperties {
  if (layer.kind === "solid") return { position: "absolute", inset: 0, background: layer.value, opacity: layer.opacity };
  if (layer.kind === "gradient") return { position: "absolute", inset: 0, backgroundImage: layer.value, opacity: layer.opacity, mixBlendMode: layer.blendMode as CSSProperties["mixBlendMode"] };
  return { position: "absolute", inset: 0, backgroundImage: `url(${layer.value})`, backgroundSize: "cover", backgroundPosition: "center", opacity: layer.opacity, mixBlendMode: layer.blendMode as CSSProperties["mixBlendMode"] };
}

function placementStyle(node: ComposerNode): CSSProperties {
  const p = node.placement;
  return {
    position: "absolute",
    left: `${p.x}%`, top: `${p.y}%`, width: `${p.width}%`, height: `${p.height}%`,
    zIndex: p.zIndex,
    transform: p.rotate ? `rotate(${p.rotate}deg)` : undefined,
    transformOrigin: "center",
    overflow: "visible",
  };
}

function textNode(node: ComposerNode, fitContent = false): ReactNode {
  const t = node.textStyle ?? {};
  const style: CSSProperties = {
    width: "100%",
    height: fitContent ? "auto" : "100%",
    margin: 0,
    whiteSpace: "pre-line",
    overflow: fitContent ? "visible" : "hidden",
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    color: t.color,
    textAlign: t.textAlign,
    textTransform: t.textTransform === "uppercase" ? "uppercase" : undefined,
  };
  if (node.kind === "brand") {
    return <div style={{ ...style, lineHeight: t.lineHeight ?? .8, letterSpacing: t.letterSpacing ?? -8, fontWeight: t.fontWeight ?? 900 }} aria-label={node.content || "XpoMag"}>{node.content || "XpoMag"}</div>;
  }
  return <div style={style}>{node.content}</div>;
}

export type ComposerCanvasProps = {
  document: ComposerDocument;
  className?: string;
  style?: CSSProperties;
  selectedId?: string | null;
  renderNodeOverlay?: (node: ComposerNode) => ReactNode;
  onNodePointerDown?: (event: ReactPointerEvent<HTMLDivElement>, node: ComposerNode) => void;
  onNodeActivate?: (node: ComposerNode) => void;
  onCanvasPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onCanvasPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  canvasRef?: Ref<HTMLDivElement>;
};

export function ComposerCanvas({ document, className, style, selectedId, renderNodeOverlay, onNodePointerDown, onNodeActivate, onCanvasPointerMove, onCanvasPointerUp, canvasRef }: ComposerCanvasProps) {
  return (
    <div
      ref={canvasRef}
      className={className}
      data-composer-canvas="true"
      style={{ position: "relative", width: "100%", aspectRatio: `${document.canvas.width} / ${document.canvas.height}`, overflow: "hidden", background: "#fff", ...style }}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerCancel={onCanvasPointerUp}
    >
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {document.background.map((layer) => <div key={layer.id} style={backgroundLayerStyle(layer)} />)}
      </div>
      {document.nodes.map((node) => {
        if (node.hidden) return null;
        const overlay = renderNodeOverlay?.(node);
        const isTextual = node.kind === "text" || node.kind === "brand";
        return (
          <div
            key={node.id}
            data-composer-node={node.id}
            data-selected={selectedId === node.id ? "true" : undefined}
            onPointerDown={onNodePointerDown ? (event) => onNodePointerDown(event, node) : undefined}
            onClick={node.story && onNodeActivate ? (event) => { event.stopPropagation(); onNodeActivate(node); } : undefined}
            role={node.story && onNodeActivate ? "link" : undefined}
            tabIndex={node.story && onNodeActivate ? 0 : undefined}
            onKeyDown={node.story && onNodeActivate ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onNodeActivate(node); } } : undefined}
            aria-label={node.story && onNodeActivate ? `Open ${node.name}` : undefined}
            data-story-id={node.story?.id}
            style={{ ...placementStyle(node), cursor: node.story && onNodeActivate ? "pointer" : undefined }}
          >
            {isTextual && overlay ? (
              <div className="xp-composer-node__content-with-overlay" style={{ position: "relative", width: "100%", height: "fit-content" }}>
                {textNode(node, true)}
                {overlay}
              </div>
            ) : (
              <>
                {node.kind === "image" ? (
                  <img src={node.src} alt="" draggable={false} style={{ width: "100%", height: "100%", display: "block", objectFit: node.imageStyle?.objectFit ?? "contain", objectPosition: node.imageStyle?.objectPosition ?? "50% 50%", opacity: node.imageStyle?.opacity ?? 1, mixBlendMode: node.imageStyle?.mixBlendMode as CSSProperties["mixBlendMode"], filter: node.imageStyle?.filter, pointerEvents: "none", userSelect: "none" }} />
                ) : node.kind === "shape" ? (
                  <div style={{ width: "100%", height: "100%", ...node.style }} />
                ) : textNode(node)}
                {overlay}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
