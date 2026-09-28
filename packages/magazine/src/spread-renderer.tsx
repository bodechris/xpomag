import type { CSSProperties, ReactNode } from "react";
import { DesignElement } from "./renderer.js";
import type { DesignElementNode } from "./schema.js";
import type { MagazineLeafSide, MagazineSpreadDefinition, MagazineSpreadPiece } from "./spread.js";

export type SpreadPieceEngagementRenderer = (piece: MagazineSpreadPiece) => ReactNode;

function pieceStyle(piece: MagazineSpreadPiece): CSSProperties {
  const base: CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    position: "relative",
    zIndex: 1,
  };

  if (piece.region === "left") {
    return { ...base, position: "absolute", inset: "0 50% 0 0", ...(piece.style as CSSProperties) };
  }
  if (piece.region === "right") {
    return { ...base, position: "absolute", inset: "0 0 0 50%", ...(piece.style as CSSProperties) };
  }
  return { ...base, ...(piece.style as CSSProperties) };
}


function mediaNodes(node: DesignElementNode): DesignElementNode[] {
  const own = node.type === "image" || node.type === "video" ? [node] : [];
  return [...own, ...(node.children ?? []).flatMap(mediaNodes)];
}

function mediaSource(node: DesignElementNode): string {
  return typeof node.props?.src === "string" ? node.props.src : "";
}

function inferredPieceSide(piece: MagazineSpreadPiece): MagazineLeafSide | "spread" {
  if (piece.region === "left" || piece.region === "right") return piece.region;
  const left = piece.style?.left;
  if (typeof left === "number") return left >= 50 ? "right" : "left";
  if (typeof left === "string" && left.trim().endsWith("%")) {
    const value = Number.parseFloat(left);
    if (Number.isFinite(value)) return value >= 50 ? "right" : "left";
  }
  return "spread";
}

function supplementalMobileMedia(spread: MagazineSpreadDefinition, mobilePiece: MagazineSpreadPiece): DesignElementNode[] {
  if (!mobilePiece.id.includes("-mobile-")) return [];
  const mobileSide = mobilePiece.region === "right" || mobilePiece.id.includes("mobile-right")
    ? "right"
    : "left";

  const alreadyPresent = new Set(
    mobilePiece.elements
      .flatMap(mediaNodes)
      .map(mediaSource)
      .filter(Boolean),
  );
  const seen = new Set(alreadyPresent);

  return spread.pieces
    .filter((piece) => !piece.id.includes("-mobile-"))
    .filter((piece) => {
      const side = inferredPieceSide(piece);
      return side === "spread" || side === mobileSide;
    })
    .flatMap((piece) => piece.elements.flatMap(mediaNodes))
    .filter((node) => {
      if (/logo|mark|qr|corner|icon/i.test(node.id)) return false;
      const src = mediaSource(node);
      if (!src || seen.has(src)) return false;
      seen.add(src);
      return true;
    });
}

export function MagazineSpreadCanvas({
  spread,
  globalElements,
  renderEngagement,
  includeSupplementalMobileMedia = true,
}: {
  spread: MagazineSpreadDefinition;
  globalElements?: Record<string, DesignElementNode>;
  renderEngagement?: SpreadPieceEngagementRenderer;
  includeSupplementalMobileMedia?: boolean;
}) {
  return (
    <div
      data-magazine-spread={spread.slug}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        isolation: "isolate",
        overflow: "hidden",
        containerType: "inline-size",
        ...(spread.style as CSSProperties),
      }}
    >
      {spread.background ? <DesignElement node={spread.background} registry={globalElements} /> : null}
      {spread.pieces.map((piece) => {
        const supplementalMedia = includeSupplementalMobileMedia ? supplementalMobileMedia(spread, piece) : [];
        return (
          <section
            id={piece.slug}
            key={piece.id}
            data-magazine-spread-piece={piece.slug}
            data-spread-piece-id={piece.id}
            data-spread-region={piece.region ?? "spread"}
            data-gutter-behaviour={piece.gutterBehaviour ?? "avoid"}
            style={pieceStyle(piece)}
          >
            {piece.elements.map((element) => (
              <DesignElement key={element.id} node={element} registry={globalElements} />
            ))}
            {supplementalMedia.length ? (
              <div data-mobile-spread-media aria-label="More media from this page">
                {supplementalMedia.map((element, index) => (
                  <div data-mobile-spread-media-item key={`${piece.id}-supplemental-${element.id}-${index}`}>
                    <DesignElement
                      node={{ ...element, id: `${piece.id}-supplemental-${element.id}-${index}` }}
                      registry={globalElements}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {renderEngagement?.(piece)}
          </section>
        );
      })}
      <span
        aria-hidden="true"
        data-magazine-gutter
        style={{
          position: "absolute",
          inset: "0 auto 0 50%",
          width: 0,
          borderLeft: "1px solid transparent",
          pointerEvents: "none",
          zIndex: 20,
        }}
      />
    </div>
  );
}

/**
 * Renders one physical leaf by clipping the authoritative two-page spread
 * canvas. The design is authored once; left and right leaves are viewports.
 */
export function MagazineSpreadLeaf({
  spread,
  side,
  globalElements,
  renderEngagement,
  includeSupplementalMobileMedia = true,
}: {
  spread: MagazineSpreadDefinition;
  side: MagazineLeafSide;
  globalElements?: Record<string, DesignElementNode>;
  renderEngagement?: SpreadPieceEngagementRenderer;
  includeSupplementalMobileMedia?: boolean;
}) {
  return (
    <div
      data-magazine-leaf={side}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: side === "right" ? "-100%" : 0,
          width: "200%",
        }}
      >
        <MagazineSpreadCanvas
          spread={spread}
          globalElements={globalElements}
          renderEngagement={renderEngagement}
          includeSupplementalMobileMedia={includeSupplementalMobileMedia}
        />
      </div>
    </div>
  );
}

export function MagazineMasterSpreadRenderer({
  spread,
  globalElements,
  renderEngagement,
}: {
  spread: MagazineSpreadDefinition;
  globalElements?: Record<string, DesignElementNode>;
  renderEngagement?: SpreadPieceEngagementRenderer;
}) {
  return (
    <div
      data-magazine-master-spread={spread.slug}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        perspective: "1800px",
      }}
    >
      <MagazineSpreadLeaf spread={spread} side="left" globalElements={globalElements} renderEngagement={renderEngagement} />
      <MagazineSpreadLeaf spread={spread} side="right" globalElements={globalElements} renderEngagement={renderEngagement} />
    </div>
  );
}
