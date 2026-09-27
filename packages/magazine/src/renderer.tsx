import type { CSSProperties, ReactNode } from "react";
import type { DesignElementNode } from "./schema.js";
import type { ComposerDocument, ComposerNode } from "./editor.js";
import { ComposerCanvas } from "./composer-renderer.js";

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
      const dropCap = props.dropCap === true && text.length > 0;
      const dropCapColor = typeof props.dropCapColor === "string" ? props.dropCapColor : undefined;
      const dropCapLines = typeof props.dropCapLines === "number" ? Math.max(3, Math.min(6, props.dropCapLines)) : 5;
      const dropCapStyle = dropCapColor ? ({ "--xp-drop-cap-color": dropCapColor } as CSSProperties) : undefined;
      const paragraph = dropCap ? (
        <p
          data-drop-cap="true"
          data-drop-cap-lines={dropCapLines}
          style={{ ...dropCapStyle, ...style }}
        >
          <span className="xp-editorial-drop-cap" aria-hidden="true">{text.charAt(0)}</span>
          {text.slice(1)}
        </p>
      ) : <p style={style}>{text}</p>;
      if (as === "h1") return <h1 style={style}>{text}</h1>;
      if (as === "h2") return <h2 style={style}>{text}</h2>;
      if (as === "h3") return <h3 style={style}>{text}</h3>;
      if (as === "span") return <span style={style}>{text}</span>;
      return paragraph;
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
      return <img src={src} alt={alt} style={style} loading={loading} fetchPriority={fetchPriority} decoding="async" />;
    }
    case "video": {
      const src = typeof props.src === "string" ? props.src : "";
      const title = typeof props.title === "string" ? props.title : "Magazine video";
      const poster = typeof props.poster === "string" ? props.poster : undefined;
      const autoplay = props.autoplay === true;
      const muted = props.muted !== false;
      const loop = props.loop === true;
      if (!src) return null;
      if (/youtube\.com|youtu\.be/.test(src)) {
        const cover = props.cover === true;
        if (cover) {
          return (
            <div
              data-design-element="video"
              data-video-fit="cover"
              style={{
                position: "relative",
                overflow: "hidden",
                containerType: "size",
                background: "#000",
                ...style,
              }}
            >
              <iframe
                src={src}
                title={title}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "max(100cqw, 177.7778cqh)",
                  height: "max(100cqh, 56.25cqw)",
                  maxWidth: "none",
                  border: 0,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: props.interactive === true ? "auto" : "none",
                }}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <iframe
            src={src}
            title={title}
            style={{ border: 0, ...style }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        );
      }
      return (
        <video
          src={src}
          title={title}
          poster={poster}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          playsInline
          controls={props.controls !== false}
          style={style}
        />
      );
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
                  loading={layer.loading === "eager" ? "eager" : "lazy"}
                  decoding="async"
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
