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

export function MagazineSpreadCanvas({
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
      {spread.pieces.map((piece) => (
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
          {renderEngagement?.(piece)}
        </section>
      ))}
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
}: {
  spread: MagazineSpreadDefinition;
  side: MagazineLeafSide;
  globalElements?: Record<string, DesignElementNode>;
  renderEngagement?: SpreadPieceEngagementRenderer;
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
