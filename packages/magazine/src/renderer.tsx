import type { CSSProperties, ReactNode } from "react";
import type { DesignElementNode } from "./schema";
import type { ComposerDocument, ComposerNode } from "./editor";
import { ComposerCanvas } from "./composer-renderer";

type DesignElementInteractionProps = {
  renderComposerNodeOverlay?: (node: ComposerNode) => ReactNode;
  onComposerNodeActivate?: (node: ComposerNode) => void;
};

function childrenOf(node: DesignElementNode, registry: Record<string, DesignElementNode> | undefined, interactions: DesignElementInteractionProps): ReactNode {
  return node.children?.map((child) => <DesignElement key={child.id} node={child} registry={registry} {...interactions} />);
}

function styleOf(node: DesignElementNode): CSSProperties | undefined {
  return node.style as CSSProperties | undefined;
}

function backgroundLayerStyle(layer: Record<string, unknown>): CSSProperties {
  const opacity = typeof layer.opacity === "number" ? layer.opacity : 1;
  const mixBlendMode = typeof layer.blendMode === "string" ? layer.blendMode as CSSProperties["mixBlendMode"] : undefined;
  const filter = typeof layer.filter === "string" ? layer.filter : undefined;
  const transform = typeof layer.transform === "string" ? layer.transform : undefined;
  const background = typeof layer.value === "string" ? layer.value : typeof layer.color === "string" ? layer.color : undefined;
  return { position: "absolute", inset: 0, opacity, mixBlendMode, filter, transform, background, pointerEvents: "none" };
}

export function DesignElement({ node, registry, renderComposerNodeOverlay, onComposerNodeActivate }: { node: DesignElementNode; registry?: Record<string, DesignElementNode> } & DesignElementInteractionProps) {
  const style = styleOf(node);
  const props = node.props ?? {};

  switch (node.type) {
    case "frame":
      return <section data-design-element="frame" style={style}>{childrenOf(node, registry, { renderComposerNodeOverlay, onComposerNodeActivate })}</section>;
    case "stack":
      return <div data-design-element="stack" style={{ display: "flex", flexDirection: "column", ...style }}>{childrenOf(node, registry, { renderComposerNodeOverlay, onComposerNodeActivate })}</div>;
    case "grid":
      return <div data-design-element="grid" style={{ display: "grid", ...style }}>{childrenOf(node, registry, { renderComposerNodeOverlay, onComposerNodeActivate })}</div>;
    case "text": {
      const as = typeof props.as === "string" ? props.as : "p";
      const text = typeof props.text === "string" ? props.text : "";
      if (as === "h1") return <h1 style={style}>{text}</h1>;
      if (as === "h2") return <h2 style={style}>{text}</h2>;
      if (as === "h3") return <h3 style={style}>{text}</h3>;
      if (as === "span") return <span style={style}>{text}</span>;
      return <p style={style}>{text}</p>;
    }
    case "brandMark": {
      const label = typeof props.label === "string" ? props.label : "XpoMag";
      return (
        <span
          data-design-element="brand-mark"
          aria-label={label}
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            whiteSpace: "nowrap",
            fontFamily: "var(--xp-font-sans)",
            fontWeight: 760,
            lineHeight: 0.78,
            letterSpacing: "-0.095em",
            ...style,
          }}
        >
          <span style={{ fontWeight: 720 }}>Xpo</span>
          <span style={{ fontWeight: 880 }}>Mag</span>
        </span>
      );
    }
    case "image": {
      const src = typeof props.src === "string" ? props.src : "";
      const alt = typeof props.alt === "string" ? props.alt : "";
      const loading = props.loading === "eager" ? "eager" : "lazy";
      const fetchPriority = props.fetchPriority === "high" || props.fetchPriority === "low" ? props.fetchPriority : "auto";
      return <img src={src} alt={alt} style={style} loading={loading} fetchPriority={fetchPriority} />;
    }
    case "background": {
      const layers = Array.isArray(props.layers) ? props.layers.filter((layer): layer is Record<string, unknown> => Boolean(layer) && typeof layer === "object") : [];
      return (
        <div
          data-design-element="background"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none", ...style }}
        >
          {layers.map((layer, index) => {
            const kind = typeof layer.kind === "string" ? layer.kind : "solid";
            if ((kind === "image" || kind === "shape" || kind === "gobo") && typeof layer.src === "string") {
              return (
                <img
                  key={`${node.id}-layer-${index}`}
                  src={layer.src}
                  alt=""
                  loading={layer.loading === "lazy" ? "lazy" : "eager"}
                  style={{
                    ...backgroundLayerStyle(layer),
                    width: "100%",
                    height: "100%",
                    objectFit: (typeof layer.objectFit === "string" ? layer.objectFit : "cover") as CSSProperties["objectFit"],
                    objectPosition: typeof layer.objectPosition === "string" ? layer.objectPosition : "center",
                  }}
                />
              );
            }
            return <div key={`${node.id}-layer-${index}`} style={backgroundLayerStyle(layer)} />;
          })}
        </div>
      );
    }
    case "divider":
      return <hr style={style} />;
    case "spacer":
      return <div aria-hidden="true" style={{ height: "var(--xp-space-8)", ...style }} />;
    case "composerCanvas": {
      const document = props.document as ComposerDocument | undefined;
      if (!document) return null;
      return <ComposerCanvas document={document} style={style} renderNodeOverlay={renderComposerNodeOverlay} onNodeActivate={onComposerNodeActivate} />;
    }
    case "reference": {
      const ref = typeof props.ref === "string" ? props.ref : "";
      const referenced = registry?.[ref];
      if (!referenced) return null;
      return (
        <DesignElement
          node={{
            ...referenced,
            id: node.id,
            props: { ...(referenced.props ?? {}), ...props, ref: undefined },
            style: { ...(referenced.style ?? {}), ...(node.style ?? {}) },
          }}
          registry={registry}
          renderComposerNodeOverlay={renderComposerNodeOverlay}
          onComposerNodeActivate={onComposerNodeActivate}
        />
      );
    }
    default:
      return null;
  }
}
