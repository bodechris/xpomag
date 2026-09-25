import {
  createDemoCoverDocument,
  type ComposerDocument,
  type DesignElementNode,
  type MagazineGlobalDefinition,
  type MagazinePageDefinition,
  type MagazineSection,
} from "@xpomag/magazine";

export type DemoMagazineIssue = MagazineGlobalDefinition;

type DemoMagazineOptions = {
  alphaCoverAssets?: string[];
  coverDocument?: ComposerDocument | null;
};

type Tone = {
  bg: string;
  ink?: string;
  accent?: string;
  muted?: string;
};

const pad = "clamp(1.05rem, 2.7vw, 2.55rem)";
const sans = "var(--xp-font-sans)";
const serif = "var(--xp-font-editorial)";

function text(
  id: string,
  value: string,
  style: DesignElementNode["style"] = {},
  as: "h1" | "h2" | "h3" | "p" | "span" = "p",
): DesignElementNode {
  return { id, type: "text", props: { as, text: value }, style };
}

function label(id: string, value: string, color = "currentColor"): DesignElementNode {
  return text(
    id,
    value.toUpperCase(),
    {
      color,
      fontSize: "clamp(.48rem,.62vw,.62rem)",
      fontWeight: 820,
      lineHeight: 1.08,
      letterSpacing: "0.15em",
    },
    "span",
  );
}

function rule(id: string, color = "rgba(0,0,0,.18)"): DesignElementNode {
  return {
    id,
    type: "divider",
    style: { border: 0, background: color, minHeight: "1px", margin: ".15rem 0" },
  };
}

function stack(
  id: string,
  children: DesignElementNode[],
  style: DesignElementNode["style"] = {},
): DesignElementNode {
  return { id, type: "stack", style: { gap: ".72rem", ...style }, children };
}

function grid(
  id: string,
  children: DesignElementNode[],
  style: DesignElementNode["style"] = {},
): DesignElementNode {
  return { id, type: "grid", style: { gap: ".75rem", ...style }, children };
}

function imageNode(
  id: string,
  src: string | undefined,
  alt: string,
  style: DesignElementNode["style"] = {},
): DesignElementNode | null {
  if (!src) return null;
  return {
    id,
    type: "image",
    props: { src, alt },
    style: { width: "100%", height: "100%", objectFit: "contain", ...style },
  };
}

function source(id: string, value: string, light = false): DesignElementNode {
  return text(
    id,
    `SOURCE · ${value}`,
    {
      color: light ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.48)",
      fontSize: "clamp(.43rem,.53vw,.54rem)",
      lineHeight: 1.32,
      letterSpacing: ".03em",
      margin: ".25rem 0 0",
    },
    "span",
  );
}

function background(id: string, color: string): DesignElementNode {
  return {
    id: `${id}-background`,
    type: "background",
    props: { layers: [{ kind: "solid", color }] },
    style: { position: "absolute", inset: 0 },
  };
}

function section(
  id: string,
  title: string,
  slot: string,
  elements: DesignElementNode[],
  style: MagazineSection["style"] = {},
  engagement = true,
): MagazineSection {
  return {
    id,
    slug: id,
    title,
    kind: "editorial",
    slot,
    style: { padding: pad, overflow: "hidden", ...style },
    resources: { fonts: [], images: [], styles: [] },
    engagement: engagement
      ? { reactions: true, comments: true, share: true, save: true }
      : { reactions: false, comments: false, share: false, save: false },
    elements,
  };
}

function page(
  issueId: string,
  id: string,
  title: string,
  kind: MagazinePageDefinition["kind"],
  layoutId: string,
  bg: string,
  sections: MagazineSection[],
  access: MagazinePageDefinition["access"] = "public",
): MagazinePageDefinition {
  return {
    id,
    issueId,
    slug: id,
    title,
    kind,
    access,
    layoutId,
    background: background(id, bg),
    resources: { fonts: [], images: [], styles: [] },
    styles: {},
    sections,
  };
}

function introElements(
  id: string,
  pageNo: number,
  kicker: string,
  headline: string,
  deck?: string,
  tone: Tone = { bg: "#f4f1e9", ink: "#101010", accent: "#73706a" },
): DesignElementNode[] {
  const ink = tone.ink ?? "#111";
  const accent = tone.accent ?? ink;
  const elements: DesignElementNode[] = [
    grid(`${id}-meta`, [
      label(`${id}-page`, `XPOMAG 01 · ${String(pageNo).padStart(2, "0")}`, accent),
      label(`${id}-kick`, kicker, accent),
    ], { gridTemplateColumns: "1fr auto", alignItems: "center" }),
    text(`${id}-head`, headline, {
      color: ink,
      fontFamily: serif,
      fontSize: "clamp(2.25rem,4.25vw,4.5rem)",
      fontWeight: 400,
      lineHeight: .84,
      letterSpacing: "-.058em",
      margin: "auto 0 0",
      maxWidth: "96%",
    }, "h2"),
  ];
  if (deck) {
    elements.push(text(`${id}-deck`, deck, {
      color: tone.muted ?? ink,
      fontSize: "clamp(.76rem,1.03vw,.98rem)",
      lineHeight: 1.5,
      maxWidth: "42rem",
      margin: ".8rem 0 0",
      opacity: .82,
    }));
  }
  return elements;
}

function storyPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  paragraphs: string[],
  tone: Tone,
  options: { quote?: string; source?: string; kind?: MagazinePageDefinition["kind"] } = {},
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const light = ink === "#fff" || ink.toLowerCase() === "#ffffff";
  return page(issueId, id, headline, options.kind ?? "editorial", "article-classic", tone.bg, [
    section(`${id}-headline`, headline, "headline", introElements(id, pageNo, kicker, headline, undefined, tone), {
      background: tone.bg,
      color: ink,
      display: "flex",
      flexDirection: "column",
    }),
    section(`${id}-body`, `${headline} story`, "body", [
      ...paragraphs.flatMap((paragraph, index) => [
        text(`${id}-p-${index}`, paragraph, {
          color: ink,
          fontSize: "clamp(.78rem,1.05vw,1rem)",
          lineHeight: 1.58,
          maxWidth: "44rem",
        }),
        ...(index < paragraphs.length - 1 ? [rule(`${id}-rule-${index}`, light ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.14)")] : []),
      ]),
      ...(options.source ? [source(`${id}-source`, options.source, light)] : []),
    ], {
      background: light ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.56)",
      color: ink,
    }),
    ...(options.quote ? [section(`${id}-quote`, "Pull quote", "aside", [
      label(`${id}-quote-k`, "XPOMAG NOTE", tone.accent ?? ink),
      text(`${id}-quote-t`, options.quote, {
        color: ink,
        fontFamily: serif,
        fontSize: "clamp(1.7rem,3.4vw,3.5rem)",
        lineHeight: .94,
        letterSpacing: "-.045em",
      }, "h3"),
    ], { background: tone.accent ?? "#d8ff52", color: ink })] : []),
  ]);
}

function cardPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  cards: Array<{ title: string; body: string; tag?: string }>,
  tone: Tone,
  footer?: string,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";

  /*
   * Card-led editorial pages originally used the four-column feature-t-shape
   * layout. Inside the desktop book each physical page is only half of the
   * overall spread, which made those four columns too narrow and caused long
   * headings to be visibly clipped. Use the proven contents-index geometry
   * instead: a strong title rail plus a roomy 2x2 card field. This keeps the
   * page readable at spread size without shrinking the whole magazine.
   */
  const header = section(`${id}-header`, headline, "title", [
    grid(`${id}-meta`, [
      label(`${id}-page`, `XPOMAG 01 · ${String(pageNo).padStart(2, "0")}`, tone.accent ?? ink),
      label(`${id}-kick`, kicker, tone.accent ?? ink),
    ], { gridTemplateColumns: "1fr", gap: ".3rem" }),
    text(`${id}-head`, headline, {
      color: ink,
      fontFamily: serif,
      fontSize: "clamp(2rem,3.7vw,3.75rem)",
      fontWeight: 400,
      lineHeight: .86,
      letterSpacing: "-.052em",
      margin: "auto 0 0",
      maxWidth: "100%",
    }, "h2"),
    ...(footer ? [text(`${id}-deck`, footer, {
      color: tone.muted ?? ink,
      fontSize: "clamp(.62rem,.78vw,.78rem)",
      lineHeight: 1.42,
      maxWidth: "30rem",
      margin: ".7rem 0 0",
      opacity: .82,
    })] : []),
  ], {
    background: tone.bg,
    color: ink,
    display: "flex",
    flexDirection: "column",
  });

  const cardNodes = cards.slice(0, 4).map((card, index) =>
    stack(`${id}-card-${index + 1}`, [
      label(`${id}-tag-${index + 1}`, card.tag ?? `${String(index + 1).padStart(2, "0")} / ${kicker}`, tone.accent ?? ink),
      text(`${id}-title-${index + 1}`, card.title, {
        color: ink,
        fontSize: "clamp(.9rem,1.35vw,1.3rem)",
        fontWeight: 820,
        lineHeight: .96,
        letterSpacing: "-.035em",
        maxWidth: "100%",
      }, "h3"),
      text(`${id}-body-${index + 1}`, card.body, {
        color: tone.muted ?? ink,
        fontSize: "clamp(.56rem,.68vw,.7rem)",
        lineHeight: 1.45,
        opacity: .84,
        maxWidth: "100%",
      }),
    ], {
      gap: ".45rem",
      minWidth: 0,
      padding: "clamp(.7rem,1.2vw,1rem)",
      background: index % 2 === 0 ? "rgba(255,255,255,.62)" : "rgba(0,0,0,.045)",
      border: "1px solid rgba(0,0,0,.08)",
    }),
  );

  const cardsSection = section(`${id}-cards`, `${headline} cards`, "list", [
    grid(`${id}-card-grid`, cardNodes, {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      alignItems: "stretch",
      gap: ".6rem",
      minWidth: 0,
      width: "100%",
    }),
  ], {
    background: "rgba(255,255,255,.32)",
    color: ink,
    minWidth: 0,
  });

  return page(issueId, id, headline, "guide", "contents-index", tone.bg, [header, cardsSection]);
}

function listPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  items: Array<{ title: string; body: string; meta?: string }>,
  tone: Tone,
  note?: string,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const light = ink === "#fff" || ink.toLowerCase() === "#ffffff";
  return page(issueId, id, headline, "directory", "contents-index", tone.bg, [
    section(`${id}-intro`, headline, "title", introElements(id, pageNo, kicker, headline, note, tone), {
      background: tone.bg,
      color: ink,
      display: "flex",
      flexDirection: "column",
    }),
    section(`${id}-list`, `${headline} list`, "list", [
      stack(`${id}-rows`, items.flatMap((item, index) => [
        grid(`${id}-row-${index}`, [
          text(`${id}-n-${index}`, String(index + 1).padStart(2, "0"), {
            color: tone.accent ?? ink,
            fontSize: ".62rem",
            fontWeight: 850,
            letterSpacing: ".08em",
            padding: ".2rem 0 0",
          }, "span"),
          stack(`${id}-copy-${index}`, [
            text(`${id}-t-${index}`, item.title, {
              color: ink,
              fontSize: "clamp(.95rem,1.45vw,1.38rem)",
              fontWeight: 770,
              lineHeight: 1,
              letterSpacing: "-.035em",
            }, "h3"),
            text(`${id}-d-${index}`, item.body, {
              color: tone.muted ?? ink,
              fontSize: ".66rem",
              lineHeight: 1.38,
              opacity: .78,
            }),
            ...(item.meta ? [label(`${id}-m-${index}`, item.meta, tone.accent ?? ink)] : []),
          ], { gap: ".18rem" }),
        ], { gridTemplateColumns: "38px 1fr", alignItems: "start", padding: ".28rem 0" }),
        rule(`${id}-r-${index}`, light ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.15)"),
      ]), { gap: 0 }),
    ], { background: light ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.52)", color: ink }),
  ]);
}

function advertPage(
  issueId: string,
  pageNo: number,
  id: string,
  brand: string,
  headline: string,
  body: string,
  bg: string,
  ink = "#fff",
): MagazinePageDefinition {
  return page(issueId, id, `${brand} concept advert`, "advert", "advert-full", bg, [
    section(`${id}-ad`, `${brand} concept placement`, "ad", [
      grid(`${id}-top`, [
        label(`${id}-label`, `PAGE ${String(pageNo).padStart(2, "0")} · CONCEPT PLACEMENT`, ink === "#fff" ? "rgba(255,255,255,.62)" : "rgba(0,0,0,.56)"),
        text(`${id}-brand`, brand, { color: ink, fontSize: ".64rem", fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }, "span"),
      ], { gridTemplateColumns: "1fr auto", alignItems: "center" }),
      text(`${id}-head`, headline, {
        color: ink,
        fontFamily: "var(--xp-font-display-sans)",
        fontSize: "clamp(3.15rem,6.8vw,7rem)",
        fontWeight: 800,
        lineHeight: .78,
        letterSpacing: "-.035em",
        textTransform: "uppercase",
        margin: "auto 0 0",
        maxWidth: "94%",
      }, "h2"),
      text(`${id}-body`, body, {
        color: ink,
        fontSize: "clamp(.78rem,1.04vw,1rem)",
        lineHeight: 1.5,
        opacity: .72,
        maxWidth: "34rem",
      }),
      label(`${id}-footer`, "XPOMAG PARTNER PREVIEW · NOT AN ANNOUNCED SPONSOR", ink === "#fff" ? "rgba(255,255,255,.56)" : "rgba(0,0,0,.52)"),
    ], { background: bg, color: ink, display: "flex", flexDirection: "column" }),
  ]);
}

function sponsoredStoryPage(
  issueId: string,
  pageNo: number,
  id: string,
  headline: string,
  deck: string,
  paragraphs: string[],
  tone: Tone,
  portraitSrc?: string,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const portrait = imageNode(`${id}-portrait`, portraitSrc, "Concept sponsored-story portrait", {
    position: "absolute",
    right: "-5%",
    bottom: "-8%",
    width: "58%",
    height: "78%",
    objectFit: "contain",
    objectPosition: "bottom right",
    opacity: .94,
  });
  return page(issueId, id, headline, "feature", "feature-offset-left", tone.bg, [
    section(`${id}-hero`, headline, "hero", [
      ...introElements(id, pageNo, "SPONSORED STORY · CONCEPT", headline, deck, tone),
      ...(portrait ? [portrait] : []),
    ], { background: tone.bg, color: ink, position: "relative", display: "flex", flexDirection: "column" }),
    section(`${id}-story`, `${headline} story`, "top", [
      ...paragraphs.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, {
        color: ink,
        fontSize: "clamp(.76rem,1vw,.95rem)",
        lineHeight: 1.56,
        maxWidth: "42rem",
      })),
      label(`${id}-disclosure`, "DEMONSTRATION PROFILE · FICTIONAL BRAND/FOUNDER", tone.accent ?? ink),
    ], { background: "rgba(255,255,255,.62)", color: ink }),
  ]);
}



const art = {
  portraitA: "/resources/images-with-alpha/older-corporate-man-3.webp",
  portraitB: "/resources/images-with-alpha/corporate-african-lady-smiling-1.webp",
  portraitC: "/resources/images-with-alpha/young-man-in-glasses-1.webp",
  portraitD: "/resources/images-with-alpha/dark-lady-in-dreads-smiling-1.webp",
  portraitE: "/resources/images-with-alpha/corporate-man-posing-1.webp",
  portraitF: "/resources/images-with-alpha/african-man-in-bead-chain-1.webp",
  portraitG: "/resources/images-with-alpha/beautiful-corporate-lady-1.webp",
};

function editorialPhoto(
  id: string,
  src: string,
  alt: string,
  style: DesignElementNode["style"] = {},
): DesignElementNode {
  return {
    id,
    type: "image",
    props: { src, alt },
    style: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      filter: "grayscale(1) contrast(1.08)",
      ...style,
    },
  };
}

function displaySansStyle(size: string, color: string): DesignElementNode["style"] {
  return {
    color,
    fontFamily: "var(--xp-font-display-sans)",
    fontSize: size,
    fontWeight: 800,
    lineHeight: .82,
    letterSpacing: "-.035em",
    textTransform: "uppercase",
    maxWidth: "100%",
    overflowWrap: "normal",
  };
}

function editorialBodyStyle(color: string): DesignElementNode["style"] {
  return {
    color,
    fontFamily: "var(--xp-font-editorial-body)",
    fontSize: "clamp(.68rem,.82vw,.82rem)",
    lineHeight: 1.43,
  };
}

function portraitFeaturePage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  paragraphs: string[],
  portraitSrc: string,
  tone: Tone,
  options: { quote?: string; source?: string; portraitSide?: "left" | "right"; accentBox?: string } = {},
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const accent = options.accentBox ?? tone.accent ?? "#f3cf20";
  const side = options.portraitSide ?? "right";
  const openingFullBleed = id === "rosebank-0642";
  const portraitStyle: DesignElementNode["style"] = openingFullBleed
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center 28%",
        zIndex: 1,
        filter: "grayscale(1) contrast(1.1)",
      }
    : side === "right"
      ? {
          position: "absolute",
          right: "-2%",
          bottom: "-1%",
          width: "84%",
          height: "104%",
          objectFit: "contain",
          objectPosition: "bottom right",
          zIndex: 1,
        }
      : {
          position: "absolute",
          left: "-2%",
          bottom: "-1%",
          width: "84%",
          height: "104%",
          objectFit: "contain",
          objectPosition: "bottom left",
          zIndex: 1,
        };

  const copySide = side === "right" ? { left: "5.5%", right: "auto" } : { right: "5.5%", left: "auto" };
  const quoteSide = side === "right" ? { right: "5%", left: "auto" } : { left: "5%", right: "auto" };
  const headingInk = openingFullBleed ? "#fff" : ink;
  const headingAccent = openingFullBleed ? "#8ec5ff" : (tone.accent ?? ink);

  return page(issueId, id, headline, "feature", "utility-full", tone.bg, [
    section(`${id}-hero`, headline, "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, headline, portraitStyle),
      ...(openingFullBleed ? [stack(`${id}-headline-shade`, [], {
        position: "absolute",
        left: 0,
        top: 0,
        width: "68%",
        height: "38%",
        zIndex: 2,
        background: "linear-gradient(135deg, rgba(0,0,0,.58) 0%, rgba(0,0,0,.34) 48%, rgba(0,0,0,0) 100%)",
        pointerEvents: "none",
      })] : []),
      stack(`${id}-heading-block`, [
        label(`${id}-kicker`, `${String(pageNo).padStart(2, "0")} / ${kicker}`, headingAccent),
        text(`${id}-headline`, headline, {
          ...displaySansStyle("clamp(3rem,6.2vw,6.4rem)", headingInk),
          whiteSpace: "pre-line",
          textShadow: openingFullBleed ? "0 3px 22px rgba(0,0,0,.48)" : undefined,
        }, "h2"),
      ], {
        position: "absolute",
        top: "5.5%",
        width: "47%",
        zIndex: 4,
        gap: ".5rem",
        ...copySide,
      }),
      stack(`${id}-copy-block`, [
        ...paragraphs.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, {
          ...editorialBodyStyle(ink),
          fontSize: "clamp(.57rem,.78vw,.78rem)",
          lineHeight: 1.42,
          textShadow: tone.bg === "#f5f3ed" || tone.bg === "#f7f6f2" ? "0 1px 0 rgba(255,255,255,.25)" : undefined,
        })),
        ...(options.source ? [source(`${id}-source`, options.source, false)] : []),
      ], {
        position: "absolute",
        bottom: "5.5%",
        width: "43%",
        zIndex: 4,
        gap: ".55rem",
        padding: "clamp(.72rem,1.1vw,1rem)",
        background: openingFullBleed ? "rgba(248,246,240,.94)" : "rgba(248,246,240,.9)",
        backdropFilter: "blur(6px)",
        borderTop: `4px solid ${tone.accent ?? ink}`,
        ...copySide,
      }),
      ...(options.quote ? [stack(`${id}-quote-box`, [
        label(`${id}-quote-label`, "XPOMAG / PULL QUOTE", ink),
        text(`${id}-quote`, options.quote, {
          color: ink,
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(1.15rem,2vw,1.95rem)",
          lineHeight: .96,
          letterSpacing: "-.035em",
        }, "h3"),
      ], {
        position: "absolute",
        bottom: "7%",
        zIndex: 5,
        width: "35%",
        padding: "clamp(.75rem,1.35vw,1.2rem)",
        background: accent,
        border: `2px solid ${ink}`,
        boxShadow: "0 14px 34px rgba(0,0,0,.12)",
        ...quoteSide,
      })] : []),
    ], {
      background: tone.bg,
      color: ink,
      position: "relative",
      minHeight: "100%",
      padding: 0,
    }),
  ]);
}

function fastReadPage(
  issueId: string,
  pageNo: number,
  id: string,
  items: Array<{ title: string; body: string; meta?: string }>,
): MagazinePageDefinition {
  const ink = "#111";
  return page(issueId, id, "If you only have 60 seconds", "directory", "contents-index", "#f3cf20", [
    section(`${id}-intro`, "The issue in 60 seconds", "title", [
      label(`${id}-label`, `XPOMAG / ${String(pageNo).padStart(2, "0")} / FAST READ`, "#773412"),
      text(`${id}-60`, "60", { ...displaySansStyle("clamp(6rem,12vw,12rem)", ink), lineHeight: .62, margin: "auto 0 0" }, "h2"),
      text(`${id}-seconds`, "SECONDS", { ...displaySansStyle("clamp(2.1rem,4vw,4rem)", ink), lineHeight: .8 }, "h3"),
      text(`${id}-small`, "The whole issue, reduced to eight useful signals.", {
        ...editorialBodyStyle(ink), maxWidth: "18rem", marginTop: ".7rem",
      }),
    ], { background: "#f3cf20", color: ink, display: "flex", flexDirection: "column" }),
    section(`${id}-list`, "Fast read index", "list", [
      grid(`${id}-grid`, items.map((item, index) => stack(`${id}-item-${index}`, [
        grid(`${id}-meta-${index}`, [
          label(`${id}-n-${index}`, String(index + 1).padStart(2, "0"), "#b23b20"),
          label(`${id}-m-${index}`, item.meta ?? "ISSUE 01", "#777"),
        ], { gridTemplateColumns: "auto 1fr", gap: ".45rem", alignItems: "center" }),
        text(`${id}-t-${index}`, item.title, {
          color: ink,
          fontFamily: "var(--xp-font-grotesk)",
          fontSize: "clamp(.78rem,1.1vw,1.05rem)",
          fontWeight: 760,
          lineHeight: .95,
          letterSpacing: "-.025em",
        }, "h3"),
        text(`${id}-b-${index}`, item.body, {
          ...editorialBodyStyle("#3e3b35"), fontSize: ".58rem", lineHeight: 1.36,
        }),
      ], { padding: ".5rem 0", borderTop: "1px solid rgba(0,0,0,.18)", gap: ".28rem" })), {
        gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "0 1rem",
      }),
    ], { background: "#f8f6f0", color: ink }),
  ]);
}

function pulseEditorialPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  cards: Array<{ title: string; body: string; tag?: string }>,
  tone: Tone,
  heroImage: string,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  return page(issueId, id, headline, "guide", "utility-full", tone.bg, [
    section(`${id}-spread`, headline, "main", [
      editorialPhoto(`${id}-image`, heroImage, headline, {
        position: "absolute",
        right: "-10%",
        top: "-4%",
        width: "86%",
        height: "108%",
        objectFit: "contain",
        objectPosition: "bottom right",
        opacity: .98,
        zIndex: 1,
        transform: "scale(1.22)",
        transformOrigin: "bottom right",
      }),
      stack(`${id}-title-block`, [
        label(`${id}-meta`, `XPOMAG / THE PULSE / ${String(pageNo).padStart(2,"0")} · ${kicker}`, tone.accent ?? ink),
        text(`${id}-headline`, headline, {
          ...displaySansStyle("clamp(2.7rem,5.6vw,5.8rem)", ink),
          whiteSpace: "pre-line",
          maxWidth: "100%",
        }, "h2"),
      ], {
        position: "absolute",
        left: "5%",
        top: "5%",
        width: "45%",
        zIndex: 4,
        gap: ".45rem",
      }),
      grid(`${id}-grid`, cards.map((card, index) => stack(`${id}-card-${index}`, [
        label(`${id}-tag-${index}`, card.tag ?? `0${index + 1}`, tone.accent ?? ink),
        text(`${id}-title-${index}`, card.title, {
          color: ink,
          fontFamily: "var(--xp-font-grotesk)",
          fontSize: "clamp(.78rem,1.04vw,1.02rem)",
          fontWeight: 800,
          lineHeight: .94,
          letterSpacing: "-.03em",
        }, "h3"),
        text(`${id}-body-${index}`, card.body, {
          ...editorialBodyStyle(tone.muted ?? ink),
          fontSize: ".54rem",
          lineHeight: 1.34,
        }),
      ], {
        gap: ".28rem",
        padding: ".6rem .62rem .68rem",
        borderTop: `4px solid ${tone.accent ?? ink}`,
        background: index % 2 === 0 ? "rgba(255,255,255,.93)" : "rgba(255,255,255,.76)",
        backdropFilter: "blur(5px)",
      })), {
        position: "absolute",
        left: "5%",
        right: "5%",
        bottom: "5%",
        zIndex: 5,
        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
        gap: ".58rem",
      }),
      stack(`${id}-marker`, [
        text(`${id}-marker-num`, String(pageNo - 5).padStart(2,"0"), { ...displaySansStyle("2rem", ink), lineHeight: .9 }, "span"),
        label(`${id}-marker-text`, kicker, tone.accent ?? ink),
      ], { position: "absolute", right: "5%", top: "5%", zIndex: 5, gap: ".18rem", textAlign: "right" }),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function dataPosterPage(
  issueId: string,
  pageNo: number,
  id: string,
  headline: string,
  items: Array<{ title: string; body: string; meta?: string }>,
): MagazinePageDefinition {
  const ink = "#111b13";
  return page(issueId, id, headline, "directory", "utility-full", "#dde7d3", [
    section(`${id}-main`, headline, "main", [
      stack(`${id}-title-block`, [
        label(`${id}-meta`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / ROSEBANK DATA`, "#406547"),
        text(`${id}-head`, "ROSEBANK\nBY THE\nNUMBERS", {
          ...displaySansStyle("clamp(2.1rem,3.85vw,3.95rem)", ink), whiteSpace: "pre-line", lineHeight: .83, maxWidth: "92%",
        }, "h2"),
        text(`${id}-note`, "Density changes behaviour.", {
          color: "#406547", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.05rem,1.55vw,1.55rem)", fontStyle: "italic",
        }),
        text(`${id}-dek`, "The useful story is not one number. It is what happens when transport, retail, work, culture and recurring rituals sit close enough to reinforce one another.", {
          ...editorialBodyStyle("#39483b"), fontSize: "clamp(.63rem,.76vw,.76rem)", lineHeight: 1.45, maxWidth: "24rem",
        }),
      ], { position: "absolute", left: "5%", top: "5%", bottom: "5%", width: "33%", justifyContent: "space-between", gap: ".6rem" }),
      grid(`${id}-grid`, items.slice(0,6).map((item, index) => stack(`${id}-stat-${index}`, [
        text(`${id}-number-${index}`, item.title, {
          color: index === 0 ? "#2e6e42" : ink,
          fontFamily: "var(--xp-font-display-sans)",
          fontSize: index === 0 ? "clamp(2.7rem,4.6vw,4.8rem)" : "clamp(1.55rem,2.35vw,2.35rem)",
          fontWeight: 820, lineHeight: .82, letterSpacing: "-.045em",
        }, "h3"),
        label(`${id}-label-${index}`, item.meta ?? "SIGNAL", "#53715a"),
        text(`${id}-body-${index}`, item.body, { ...editorialBodyStyle("#39483b"), fontSize: "clamp(.55rem,.64vw,.65rem)", lineHeight: 1.38 }),
      ], { padding: ".72rem .1rem", borderTop: "1px solid rgba(17,27,19,.22)", gap: ".3rem", minWidth: 0 })), {
        position: "absolute", left: "46%", right: "5%", top: "8%", bottom: "7%",
        gridTemplateColumns: "repeat(2,minmax(0,1fr))", gridTemplateRows: "repeat(3,minmax(0,1fr))", gap: "0 1rem",
      }),
    ], { background: "#dde7d3", color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function signalPosterPage(
  issueId: string,
  pageNo: number,
  id: string,
  cards: Array<{ title: string; body: string; tag?: string }>,
  portraitSrc: string,
): MagazinePageDefinition {
  const ink = "#f5f3ed";
  return page(issueId, id, "Sandton Signals", "guide", "utility-full", "#141821", [
    section(`${id}-spread`, "Sandton Signals", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "Sandton portrait", {
        position: "absolute",
        right: "-4%",
        bottom: "-1%",
        width: "74%",
        height: "102%",
        objectFit: "contain",
        objectPosition: "bottom right",
        opacity: .96,
        zIndex: 1,
      }),
      text(`${id}-s`, "S", {
        ...displaySansStyle("clamp(10rem,20vw,20rem)", "#8fc8ff"),
        position: "absolute",
        left: "2%",
        top: "1%",
        lineHeight: .55,
        opacity: .14,
        zIndex: 0,
      }, "span"),
      stack(`${id}-heading`, [
        label(`${id}-meta`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / SANDTON`, "#8fc8ff"),
        text(`${id}-head`, "SANDTON\nSIGNALS", {
          ...displaySansStyle("clamp(2.65rem,5vw,5.25rem)", ink),
          whiteSpace: "pre-line",
        }, "h2"),
      ], { position: "absolute", left: "5%", top: "5%", width: "45%", zIndex: 4, gap: ".4rem" }),
      stack(`${id}-rows`, cards.map((card, index) => grid(`${id}-row-${index}`, [
        text(`${id}-n-${index}`, `0${index + 1}`, { ...displaySansStyle("1rem", "#8fc8ff"), lineHeight: 1 }, "span"),
        stack(`${id}-copy-${index}`, [
          text(`${id}-t-${index}`, card.title, { color: ink, fontFamily: "var(--xp-font-grotesk)", fontSize: ".78rem", fontWeight: 800, lineHeight: 1 }, "h3"),
          text(`${id}-b-${index}`, card.body, { ...editorialBodyStyle("#c9ced9"), fontSize: ".52rem", lineHeight: 1.32 }),
        ], { gap: ".15rem" }),
      ], { gridTemplateColumns: "34px 1fr", gap: ".36rem", padding: ".38rem 0", borderTop: "1px solid rgba(255,255,255,.18)" })), {
        position: "absolute",
        left: "5%",
        bottom: "6%",
        width: "42%",
        zIndex: 5,
        gap: 0,
        padding: ".7rem .85rem",
        background: "rgba(20,24,33,.83)",
        backdropFilter: "blur(8px)",
      }),
      text(`${id}-close`, "THE NEXT COMPETITION MAY BE FOR TIME, NOT MONEY.", {
        color: "#8fc8ff",
        fontFamily: "var(--xp-font-display-sans)",
        fontSize: "clamp(1rem,1.7vw,1.55rem)",
        fontWeight: 780,
        lineHeight: .92,
        letterSpacing: "-.025em",
        position: "absolute",
        right: "5%",
        bottom: "5%",
        width: "38%",
        zIndex: 5,
        textAlign: "right",
      }, "h3"),
    ], { background: "#141821", color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function districtEssayPage(
  issueId: string,
  pageNo: number,
  id: string,
  city: string,
  adjective: string,
  paragraphs: string[],
  portraitSrc: string,
  bg: string,
  accent: string,
): MagazinePageDefinition {
  const ink = "#111";
  return page(issueId, id, `${city}: ${adjective}`, "editorial", "utility-full", bg, [
    section(`${id}-spread`, `${city}: ${adjective}`, "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, `${city} portrait`, {
        position: "absolute",
        right: "-3%",
        bottom: "-1%",
        width: "82%",
        height: "104%",
        objectFit: "contain",
        objectPosition: "bottom right",
        opacity: .98,
        zIndex: 1,
      }),
      stack(`${id}-heading`, [
        label(`${id}-meta`, `XPOMAG / CITY ESSAY / ${String(pageNo).padStart(2,"0")}`, accent),
        text(`${id}-city`, city.toUpperCase(), { ...displaySansStyle("clamp(2.8rem,5.2vw,5.5rem)", ink) }, "h2"),
        text(`${id}-adj`, adjective.toLowerCase() + ".", {
          color: accent,
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(3.6rem,7.2vw,7.2rem)",
          fontWeight: 400,
          fontStyle: "italic",
          lineHeight: .7,
          letterSpacing: "-.06em",
        }, "h3"),
      ], { position: "absolute", left: "5%", top: "5%", width: "50%", zIndex: 4, gap: ".2rem" }),
      stack(`${id}-body`, [
        ...paragraphs.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, {
          ...editorialBodyStyle(ink),
          fontSize: ".57rem",
          lineHeight: 1.4,
        })),
        text(`${id}-quote`, city === "ROSEBANK" ? "ONE DISTRICT FEELS NEIGHBOURHOOD-SIZED." : "DON'T CHOOSE. MOVE BETWEEN THEM.", {
          color: ink,
          fontFamily: "var(--xp-font-display-sans)",
          fontSize: "clamp(.95rem,1.55vw,1.45rem)",
          fontWeight: 800,
          lineHeight: .9,
          letterSpacing: "-.025em",
          borderTop: `4px solid ${accent}`,
          paddingTop: ".45rem",
        }, "h3"),
      ], {
        position: "absolute",
        left: "5%",
        bottom: "5%",
        width: "42%",
        zIndex: 5,
        gap: ".48rem",
        padding: ".78rem .85rem",
        background: "rgba(248,246,241,.88)",
        backdropFilter: "blur(5px)",
      }),
    ], { background: bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}


function fullBleedEditorialPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  deck: string,
  body: string[],
  imageSrc: string,
  tone: Tone,
  options: { imageSide?: "left" | "right"; quote?: string; labelText?: string } = {},
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const accent = tone.accent ?? ink;
  const imageSide = options.imageSide ?? "right";
  const imageLeft = imageSide === "left" ? "0" : "42%";
  const copyLeft = imageSide === "left" ? "57%" : "5%";
  const copyWidth = imageSide === "left" ? "38%" : "39%";
  const isFormRoomFirst = id === "sponsored-formroom-i";
  const isPowerCorridorTwo = id === "power-corridor-ii";
  return page(issueId, id, headline, "feature", "advert-full", tone.bg, [
    section(`${id}-feature`, headline, "ad", [
      ...(isPowerCorridorTwo ? [stack(`${id}-photo-box`, [
        editorialPhoto(`${id}-photo`, imageSrc, headline, {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          filter: "grayscale(1) contrast(1.12)",
        }),
      ], {
        position: "absolute",
        left: "2.5%",
        bottom: 0,
        width: "41%",
        height: "64%",
        background: "rgba(18,35,24,.08)",
        overflow: "hidden",
        padding: 0,
        gap: 0,
        zIndex: 1,
      })] : [editorialPhoto(`${id}-photo`, imageSrc, headline, {
        position: "absolute",
        left: isFormRoomFirst ? "38%" : imageLeft,
        top: 0,
        width: isFormRoomFirst ? "62%" : "58%",
        height: isFormRoomFirst ? "100%" : "100%",
        objectFit: isFormRoomFirst ? "cover" : "contain",
        objectPosition: isFormRoomFirst ? "right bottom" : (imageSide === "left" ? "bottom left" : "bottom right"),
        filter: "grayscale(1) contrast(1.12)",
        zIndex: 1,
      })]),
      stack(`${id}-copy`, [
        grid(`${id}-meta`, [
          label(`${id}-page`, `XPOMAG 01 · ${String(pageNo).padStart(2, "0")}`, accent),
          label(`${id}-kick`, kicker, accent),
        ], { gridTemplateColumns: "1fr", gap: ".2rem" }),
        text(`${id}-head`, headline, {
          ...displaySansStyle(headline.length > 22 ? "clamp(2.25rem,4.2vw,4.5rem)" : "clamp(2.6rem,4.8vw,5rem)", ink),
          margin: ".55rem 0 0",
          maxWidth: "100%",
        }, "h2"),
        text(`${id}-deck`, deck, {
          color: ink,
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(1rem,1.55vw,1.55rem)",
          lineHeight: 1.08,
          letterSpacing: "-.025em",
          maxWidth: "34rem",
        }),
        grid(`${id}-body-grid`, body.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, {
          ...editorialBodyStyle(ink),
          lineHeight: 1.5,
        })), {
          gridTemplateColumns: body.length > 1 ? "repeat(2,minmax(0,1fr))" : "1fr",
          gap: "1rem",
          marginTop: ".45rem",
        }),
        ...(options.quote ? [text(`${id}-quote`, options.quote, {
          color: accent,
          fontFamily: "var(--xp-font-editorial)",
          fontStyle: "italic",
          fontSize: "clamp(1.55rem,2.6vw,2.8rem)",
          lineHeight: .95,
          letterSpacing: "-.045em",
          marginTop: ".5rem",
          maxWidth: "32rem",
        }, "h3")] : []),
        ...(options.labelText ? [label(`${id}-bottom-label`, options.labelText, accent)] : []),
      ], {
        position: "absolute",
        left: copyLeft,
        top: "5%",
        bottom: "5%",
        width: copyWidth,
        zIndex: 4,
        gap: ".6rem",
        justifyContent: "space-between",
      }),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function editorialMosaicPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  cards: Array<{ title: string; body: string; image: string; meta: string }>,
  tone: Tone,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const accent = tone.accent ?? ink;
  return page(issueId, id, headline, "feature", "utility-full", tone.bg, [
    section(`${id}-mosaic`, headline, "main", [
      stack(`${id}-heading`, [
        label(`${id}-kicker`, `${String(pageNo).padStart(2,"0")} · ${kicker}`, accent),
        text(`${id}-head`, headline, {
          ...displaySansStyle("clamp(2.6rem,4.7vw,4.9rem)", ink),
          maxWidth: "92%",
        }, "h2"),
      ], { position: "absolute", left: "5%", top: "5%", right: "5%", height: "19%", gap: ".35rem" }),
      grid(`${id}-cards`, cards.slice(0,4).map((card,index)=>stack(`${id}-card-${index}`, [
        editorialPhoto(`${id}-img-${index}`, card.image, card.title, {
          width: "100%", height: "52%", objectFit: "contain", objectPosition: index % 2 === 0 ? "bottom left" : "bottom right", filter: "grayscale(1) contrast(1.12)",
        }),
        label(`${id}-meta-${index}`, card.meta, accent),
        text(`${id}-title-${index}`, card.title, { color: ink, fontFamily: "var(--xp-font-display-sans)", fontSize: "clamp(.95rem,1.35vw,1.35rem)", fontWeight: 840, lineHeight: .92, letterSpacing: "-.03em", textTransform: "uppercase" }, "h3"),
        text(`${id}-body-${index}`, card.body, { ...editorialBodyStyle(ink), fontSize: "clamp(.56rem,.66vw,.67rem)", lineHeight: 1.4 }),
      ], { borderTop: `3px solid ${accent}`, paddingTop: ".4rem", gap: ".3rem", minWidth: 0, overflow: "hidden" })), {
        position: "absolute", left: "5%", right: "5%", top: "25%", bottom: "5%",
        gridTemplateColumns: "repeat(2,minmax(0,1fr))", gridTemplateRows: "repeat(2,minmax(0,1fr))", gap: ".8rem 1rem",
      }),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function routeTimelinePage(
  issueId: string,
  pageNo: number,
  id: string,
  headline: string,
  items: Array<{ time: string; place: string; body: string }>,
  tone: Tone,
  imageSrc: string,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const accent = tone.accent ?? ink;
  return page(issueId, id, headline, "guide", "utility-full", tone.bg, [
    section(`${id}-timeline`, headline, "main", [
      editorialPhoto(`${id}-photo`, imageSrc, headline, {
        position: "absolute", left: "0", top: 0, bottom: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "left bottom", opacity: .98,
      }),
      stack(`${id}-intro`, [
        label(`${id}-kicker`, `${String(pageNo).padStart(2,"0")} · THE WORKDAY`, accent),
        text(`${id}-head`, headline, { color: ink, fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(2.8rem,4.8vw,5rem)", fontWeight: 400, lineHeight: .82, letterSpacing: "-.06em" }, "h2"),
        text(`${id}-sub`, "A working day across Rosebank + Sandton — where transport, hospitality and public space become part of the office.", { ...editorialBodyStyle(ink), maxWidth: "28rem", fontSize: "clamp(.72rem,.9vw,.88rem)" }),
      ], { position: "absolute", left: "47%", right: "5%", top: "5%", gap: ".55rem" }),
      stack(`${id}-rows`, items.map((item,index)=>grid(`${id}-row-${index}`, [
        text(`${id}-time-${index}`, item.time, { color: accent, fontFamily: "var(--xp-font-display-sans)", fontSize: "clamp(.95rem,1.35vw,1.35rem)", fontWeight: 850, lineHeight: .9 }, "span"),
        stack(`${id}-copy-${index}`, [
          text(`${id}-place-${index}`, item.place, { color: ink, fontWeight: 850, fontSize: "clamp(.72rem,.9vw,.9rem)", lineHeight: 1 }, "h3"),
          text(`${id}-body-${index}`, item.body, { ...editorialBodyStyle(ink), fontSize: "clamp(.52rem,.6vw,.62rem)", lineHeight: 1.35 }),
        ], { gap: ".08rem" }),
      ], { gridTemplateColumns: "68px 1fr", gap: ".5rem", padding: ".25rem 0", borderTop: index===0 ? `2px solid ${accent}` : "1px solid rgba(0,0,0,.14)" })), {
        position: "absolute", left: "47%", right: "5%", bottom: "5%", gap: 0,
      }),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function utilityGridPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  items: Array<{ title: string; body: string }>,
  tone: Tone,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const accent = tone.accent ?? ink;
  return page(issueId, id, headline, "guide", "advert-full", tone.bg, [
    section(`${id}-grid-page`, headline, "ad", [
      stack(`${id}-header`, [
        label(`${id}-kick`, `${String(pageNo).padStart(2,"0")} · ${kicker}`, accent),
        text(`${id}-head`, headline, { ...displaySansStyle("clamp(2.15rem,4vw,4.15rem)", ink), maxWidth: "98%" }, "h2"),
        text(`${id}-deck`, "Eight situations, eight different kinds of room. Save the page now; assign real venues in the final editorial pass.", {
          ...editorialBodyStyle(ink), maxWidth: "34rem", fontSize: "clamp(.66rem,.82vw,.82rem)"
        }),
      ], { position: "absolute", left: "5%", top: "5%", right: "5%", height: "27%", gap: ".45rem" }),
      grid(`${id}-cards`, items.slice(0,8).map((item,index) => stack(`${id}-card-${index}`, [
        text(`${id}-num-${index}`, String(index+1).padStart(2,"0"), { color: accent, fontFamily: "var(--xp-font-display-sans)", fontSize: "clamp(1.6rem,2.3vw,2.4rem)", fontWeight: 850, lineHeight: .85 }, "span"),
        text(`${id}-title-${index}`, item.title, { color: ink, fontWeight: 850, fontSize: "clamp(.7rem,.92vw,.94rem)", lineHeight: .95, letterSpacing: "-.025em" }, "h3"),
        text(`${id}-body-${index}`, item.body, { ...editorialBodyStyle(ink), fontSize: "clamp(.57rem,.68vw,.69rem)", lineHeight: 1.38 }),
      ], { gap: ".2rem", padding: ".55rem", background: index % 3 === 0 ? accent : "rgba(255,255,255,.64)", color: index % 3 === 0 ? tone.bg : ink })), {
        position: "absolute", left: "5%", right: "5%", bottom: "5%", top: "34%",
        gridTemplateColumns: "repeat(4,minmax(0,1fr))", gridTemplateRows: "repeat(2,minmax(0,1fr))", gap: ".5rem",
      }),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function placesGridPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  items: Array<{ title: string; body: string; meta?: string }>,
  tone: Tone,
  imageSrc: string,
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const accent = tone.accent ?? ink;
  return page(issueId, id, headline, "directory", "advert-full", tone.bg, [
    section(`${id}-places`, headline, "ad", [
      stack(`${id}-hero-box`, [
        editorialPhoto(`${id}-hero`, imageSrc, headline, {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: id === "places-i" ? "center 28%" : "center 18%",
          opacity: .98,
          filter: "grayscale(1) contrast(1.08)",
        }),
      ], {
        position: "absolute",
        right: "0",
        top: 0,
        width: "42%",
        height: "47%",
        background: id === "places-i" ? "#c7a96e" : "#9f7dc1",
        overflow: "hidden",
        padding: 0,
        gap: 0,
        zIndex: 1,
      }),
      stack(`${id}-header`, [
        label(`${id}-kick`, `${String(pageNo).padStart(2,"0")} · ${kicker}`, accent),
        text(`${id}-head`, headline, { ...displaySansStyle("clamp(2.7rem,5.3vw,5.7rem)", ink), maxWidth: "90%" }, "h2"),
        text(`${id}-dek`, "A starter list, not a ranking. Each place is a saveable object inside the issue.", { ...editorialBodyStyle(ink), maxWidth: "26rem" }),
      ], { position: "absolute", left: "5%", top: "5%", width: "49%", gap: ".45rem" }),
      grid(`${id}-list`, items.slice(0,10).map((item,index) => stack(`${id}-item-${index}`, [
        grid(`${id}-item-meta-${index}`, [
          text(`${id}-num-${index}`, String(index+1).padStart(2,"0"), { color: accent, fontFamily: "var(--xp-font-display-sans)", fontSize: ".72rem", fontWeight: 850 }, "span"),
          label(`${id}-tag-${index}`, item.meta ?? "PLACE", accent),
        ], { gridTemplateColumns: "auto 1fr", gap: ".4rem", alignItems: "center" }),
        text(`${id}-title-${index}`, item.title, { color: ink, fontWeight: 850, fontSize: "clamp(.7rem,.95vw,.95rem)", lineHeight: .95, letterSpacing: "-.02em" }, "h3"),
        text(`${id}-body-${index}`, item.body, { ...editorialBodyStyle(ink), fontSize: "clamp(.48rem,.57vw,.58rem)", lineHeight: 1.32 }),
      ], { gap: ".18rem", borderTop: "1px solid rgba(0,0,0,.18)", paddingTop: ".32rem" })), {
        position: "absolute", left: "5%", right: "5%", bottom: "5%", height: "47%",
        gridTemplateColumns: "repeat(5,minmax(0,1fr))", gridTemplateRows: "repeat(2,minmax(0,1fr))", gap: ".55rem",
      }),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function imageAdvertPage(
  issueId: string,
  pageNo: number,
  id: string,
  brand: string,
  headline: string,
  body: string,
  bg: string,
  ink: string,
  imageSrc: string,
): MagazinePageDefinition {
  const isArcSouth = id === "ad-arc-south";
  return page(issueId, id, `${brand} concept advert`, "advert", "advert-full", bg, [
    section(`${id}-ad`, `${brand} concept placement`, "ad", [
      editorialPhoto(`${id}-portrait`, imageSrc, brand, {
        position: "absolute",
        left: isArcSouth ? "0" : undefined,
        right: isArcSouth ? "auto" : "-5%",
        bottom: isArcSouth ? "0" : "-3%",
        width: isArcSouth ? "100%" : "76%",
        height: isArcSouth ? "112%" : "108%",
        objectFit: isArcSouth ? "cover" : "contain",
        objectPosition: isArcSouth ? "left bottom" : "bottom right",
        filter: "grayscale(1) contrast(1.12)",
      }),
      label(`${id}-concept`, `PAGE ${String(pageNo).padStart(2,"0")} · CONCEPT PLACEMENT`, ink),
      text(`${id}-brand`, brand, { color: ink, fontWeight: 900, fontSize: ".7rem", letterSpacing: ".16em", textTransform: "uppercase", position: "absolute", top: "6%", right: "5%", zIndex: 4 }, "span"),
      stack(`${id}-copy`, [
        text(`${id}-head`, headline, { ...displaySansStyle("clamp(3.2rem,6.4vw,6.7rem)", ink), maxWidth: "95%" }, "h2"),
        text(`${id}-body`, body, { color: ink, fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.9rem,1.25vw,1.2rem)", lineHeight: 1.15, maxWidth: "28rem" }),
        label(`${id}-footer`, "XPOMAG PARTNER PREVIEW · NOT AN ANNOUNCED SPONSOR", ink),
      ], { position: "absolute", left: "5%", bottom: "6%", width: "48%", gap: ".6rem", zIndex: 4 }),
    ], { background: bg, color: ink, position: "relative", minHeight: "100%", padding: "5%" }),
  ]);
}

function withCoverStoryLinks(document: ComposerDocument): ComposerDocument {
  const coverStyleByNode: Record<string, NonNullable<ComposerDocument["nodes"][number]["style"]>> = {
    "issue-meta": { fontFamily: "var(--xp-font-grotesk)", fontSize: 9, fontWeight: 750, lineHeight: 1, letterSpacing: ".14em", textAlign: "left", color: "#171717" },
    "left-kicker": { fontFamily: "var(--xp-font-grotesk)", fontWeight: 700, letterSpacing: ".1em" },
    "right-kicker": { fontFamily: "var(--xp-font-grotesk)", fontWeight: 700, letterSpacing: ".1em" },
    "left-headline": { fontFamily: "var(--xp-font-editorial)", fontWeight: 400, letterSpacing: "-.055em", lineHeight: .82 },
    "lead-headline": { fontFamily: "var(--xp-font-display-sans)", fontWeight: 850, letterSpacing: "-.035em", lineHeight: .78, color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,.52)" },
    "lead-kicker": { fontFamily: "var(--xp-font-grotesk)", fontWeight: 750, letterSpacing: ".12em", color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.58)" },
    "right-story-1": { fontFamily: "var(--xp-font-grotesk)", fontWeight: 760, letterSpacing: "-.025em", color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,.48)" },
    "right-story-2": { fontFamily: "var(--xp-font-grotesk)", fontWeight: 760, letterSpacing: "-.025em", color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,.48)" },
  };

  const storyByNode: Record<string, { story?: NonNullable<ComposerDocument["nodes"][number]["story"]>; content?: string }> = {
    "left-headline": {
      content: "The city\nis open.",
      story: { id: "cover-city-open", targetPageSlug: "power-corridor-i", targetSectionSlug: "power-corridor-i-headline", engagementAnchor: true, engagementAppearance: "dark" },
    },
    "left-copy": {
      content: "Rosebank + Sandton: people, places, food, culture, property and the businesses shaping the city now.",
      story: { id: "cover-issue-intro", targetPageSlug: "editors-note", targetSectionSlug: "editors-note-headline", engagementAnchor: true, engagementAppearance: "dark" },
    },
    "right-story-1": {
      content: "The new table: where Sandton is eating now",
      story: { id: "cover-new-table", targetPageSlug: "new-table-i", targetSectionSlug: "new-table-i-headline", engagementAnchor: true, engagementAppearance: "dark" },
    },
    "right-story-2": {
      content: "Rosebank after hours: art, food and movement",
      story: { id: "cover-after-hours", targetPageSlug: "after-five-i", targetSectionSlug: "after-five-i-headline", engagementAnchor: true, engagementAppearance: "dark" },
    },
    "lead-band": {
      story: { id: "cover-city-open", targetPageSlug: "power-corridor-i", targetSectionSlug: "power-corridor-i-headline", engagementAppearance: "light" },
    },
    "lead-kicker": {
      content: "ROSEBANK + SANDTON / THE CITY ISSUE",
      story: { id: "cover-city-open", targetPageSlug: "power-corridor-i", targetSectionSlug: "power-corridor-i-headline", engagementAppearance: "light" },
    },
    "lead-headline": {
      content: "THE CITY IS OPEN.",
      story: { id: "cover-city-open", targetPageSlug: "power-corridor-i", targetSectionSlug: "power-corridor-i-headline", engagementAnchor: true, engagementAppearance: "light" },
    },
    "issue-meta": { content: "ROSEBANK + SANDTON · NOVEMBER 2026 · ISSUE 001" },
    "left-kicker": { content: "THE PEOPLE · THE PLACES · THE IDEAS" },
    "right-kicker": { content: "ALSO INSIDE" },
  };

  return {
    ...document,
    title: "Rosebank + Sandton · November 2026 · Cover",
    nodes: document.nodes.map((node) => {
      const next = storyByNode[node.id];
      const coverStyle = coverStyleByNode[node.id];

      // Production cover art-direction overrides. Keep admin-authored copy/links,
      // but make the subject intentionally oversized/full-bleed and keep the
      // issue line tucked beneath the masthead.
      if (node.id === "portrait") {
        return {
          ...node,
          placement: { ...node.placement, x: -8, y: 8, width: 116, height: 98, zIndex: 20 },
          imageStyle: { ...(node.imageStyle ?? {}), objectFit: "contain", objectPosition: "50% 100%", opacity: 1 },
        };
      }
      if (node.id === "issue-meta") {
        return {
          ...node,
          placement: { ...node.placement, x: 5, y: 14.2, width: 58, height: 2.2, zIndex: 30 },
          style: { ...(node.style ?? {}), ...coverStyleByNode["issue-meta"] },
          ...(next?.content ? { content: next.content } : {}),
        };
      }
      if (node.id === "lead-band") {
        return {
          ...node,
          style: { ...(node.style ?? {}), background: "transparent", borderRadius: 0 },
        };
      }
      if (!next && !coverStyle) return node;
      if (!next && coverStyle) return { ...node, style: { ...(node.style ?? {}), ...coverStyle } };
      return {
        ...node,
        ...(coverStyleByNode[node.id] ? { style: { ...(node.style ?? {}), ...coverStyleByNode[node.id] } } : {}),
        ...(next.content ? { content: next.content } : {}),
        ...(next.story ? { story: next.story } : {}),
      };
    }),
  };
}



function culturePosterPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  deck: string,
  paragraphs: string[],
  tone: Tone,
  portraitSrc: string,
  options: { imageSide?: "left" | "right"; quote?: string; note?: string } = {},
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const imageLeft = (options.imageSide ?? "right") === "left";
  const isRosebankArtTwo = id === "rosebank-art-ii";
  return page(issueId, id, headline, "feature", "utility-full", tone.bg, [
    section(`${id}-main`, headline, "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, headline, {
        position: "absolute",
        left: isRosebankArtTwo ? "0" : (imageLeft ? "-2%" : "44%"),
        right: isRosebankArtTwo ? "0" : (imageLeft ? "44%" : "-2%"),
        top: isRosebankArtTwo ? "0" : undefined,
        bottom: 0,
        width: isRosebankArtTwo ? "100%" : "58%",
        height: isRosebankArtTwo ? "100%" : "102%",
        objectFit: isRosebankArtTwo ? "cover" : "contain",
        objectPosition: isRosebankArtTwo ? "center center" : "bottom center",
        filter: "grayscale(1) contrast(1.08)",
        zIndex: 2,
      }),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / ${kicker}`, tone.accent ?? ink),
        text(`${id}-headline`, headline, {
          ...displaySansStyle(isRosebankArtTwo ? "clamp(2.25rem,4.1vw,4.2rem)" : "clamp(2.7rem,5vw,5.1rem)", ink),
          whiteSpace: "pre-line",
          maxWidth: isRosebankArtTwo ? "94%" : "98%",
        }, "h2"),
        text(`${id}-deck`, deck, {
          color: ink,
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(1rem,1.7vw,1.65rem)",
          lineHeight: 1.02,
          letterSpacing: "-.035em",
          maxWidth: "27rem",
        }),
        grid(`${id}-body`, paragraphs.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, {
          ...editorialBodyStyle(ink),
          fontSize: "clamp(.62rem,.8vw,.8rem)",
          lineHeight: 1.45,
        })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".9rem" }),
        ...(options.note ? [label(`${id}-note`, options.note, tone.accent ?? ink)] : []),
      ], {
        position: "absolute",
        top: isRosebankArtTwo ? "4%" : "5%",
        bottom: isRosebankArtTwo ? "4%" : "5%",
        left: isRosebankArtTwo ? "52%" : (imageLeft ? "56%" : "5%"),
        right: isRosebankArtTwo ? "4%" : (imageLeft ? "5%" : "56%"),
        zIndex: 4,
        gap: ".72rem",
        justifyContent: "space-between",
        ...(isRosebankArtTwo ? {
          background: "rgba(242,231,204,.92)",
          backdropFilter: "blur(3px)",
          padding: "1.15rem 1.2rem",
          borderLeft: `2px solid ${tone.accent ?? ink}`,
        } : {}),
      }),
      ...(options.quote ? [stack(`${id}-quote`, [
        label(`${id}-quote-label`, "THE IDEA", ink),
        text(`${id}-quote-copy`, options.quote, {
          color: ink,
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(1.2rem,2.1vw,2rem)",
          lineHeight: .94,
          letterSpacing: "-.045em",
        }, "h3"),
      ], {
        position: "absolute",
        zIndex: 5,
        left: imageLeft ? "5%" : "55%",
        bottom: "6%",
        width: "35%",
        padding: "1rem",
        background: tone.accent ?? "#f2cf00",
        border: `2px solid ${ink}`,
      })] : []),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function cultureGuidePage(
  issueId: string,
  pageNo: number,
  id: string,
  headline: string,
  items: Array<{ title: string; body: string; meta: string }>,
  portraitSrc: string,
): MagazinePageDefinition {
  return page(issueId, id, headline, "directory", "utility-full", "#f4e647", [
    section(`${id}-main`, headline, "main", [
      stack(`${id}-portrait-box`, [
        editorialPhoto(`${id}-portrait`, portraitSrc, headline, {
          width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", filter: "grayscale(1) contrast(1.08)",
        }),
      ], {
        position: "absolute", right: "3%", bottom: 0, width: "40%", height: "48%", background: "#d7c12a", overflow: "hidden", padding: 0, gap: 0, zIndex: 2,
      }),
      stack(`${id}-head`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / KEYES ART MILE`, "#111"),
        text(`${id}-headline`, headline, { ...displaySansStyle("clamp(3.2rem,5.6vw,5.8rem)", "#111"), maxWidth: "95%" }, "h2"),
        text(`${id}-deck`, "Six anchors for an afternoon that moves from art into food, design and conversation.", { fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.5vw,1.45rem)", lineHeight: 1.02, maxWidth: "25rem" }),
      ], { position: "absolute", left: "5%", top: "5%", width: "48%", zIndex: 4, gap: ".65rem" }),
      grid(`${id}-items`, items.map((item,index)=>stack(`${id}-item-${index}`, [
        grid(`${id}-meta-${index}`, [
          text(`${id}-num-${index}`, String(index+1).padStart(2,"0"), { fontSize: ".62rem", fontWeight: 900, letterSpacing: ".1em" }, "span"),
          label(`${id}-kind-${index}`, item.meta, "#111"),
        ], { gridTemplateColumns: "auto 1fr", alignItems: "center", gap: ".55rem" }),
        text(`${id}-title-${index}`, item.title, { fontFamily: "var(--xp-font-display-sans)", fontWeight: 850, fontSize: "clamp(1rem,1.5vw,1.45rem)", lineHeight: .9, letterSpacing: "-.035em" }, "h3"),
        text(`${id}-body-${index}`, item.body, { ...editorialBodyStyle("#111"), fontSize: ".58rem", lineHeight: 1.38 }),
      ], { borderTop: "2px solid #111", paddingTop: ".5rem", gap: ".35rem", minWidth: 0 })), {
        position: "absolute", left: "5%", right: "5%", bottom: "5%", height: "40%", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: ".85rem", zIndex: 4,
      }),
    ], { background: "#f4e647", color: "#111", position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function notebookCulturePage(
  issueId: string,
  pageNo: number,
  id: string,
  cards: Array<{ title: string; body: string }>,
  portraitSrc: string,
): MagazinePageDefinition {
  return page(issueId, id, "What we're looking at", "guide", "utility-full", "#ede9df", [
    section(`${id}-main`, "What we're looking at", "main", [
      stack(`${id}-left`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / EDITOR'S NOTEBOOK`, "#b13c24"),
        text(`${id}-headline`, "WHAT WE\'RE\nLOOKING AT", { ...displaySansStyle("clamp(3.3rem,6.7vw,6.7rem)", "#111"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-intro`, "A recurring visual notebook: one exhibition, one building, one material and one overlooked detail.", { fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.5vw,1.45rem)", lineHeight: 1.05, maxWidth: "25rem" }),
      ], { position: "absolute", left: "5%", top: "5%", width: "43%", zIndex: 4, gap: ".75rem" }),
      stack(`${id}-portrait-box`, [
        editorialPhoto(`${id}-portrait`, portraitSrc, "Editor's notebook portrait", {
          width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", filter: "grayscale(1) contrast(1.08)",
        }),
      ], {
        position: "absolute", right: "4%", top: "5%", width: "40%", height: "47%", background: "#f2b19c", overflow: "hidden", padding: 0, gap: 0, zIndex: 2,
      }),
      grid(`${id}-cards`, cards.map((card,index)=>stack(`${id}-card-${index}`, [
        label(`${id}-num-${index}`, String(index+1).padStart(2,"0"), index===0 ? "#b13c24" : "#111"),
        text(`${id}-title-${index}`, card.title, { fontFamily: "var(--xp-font-display-sans)", fontWeight: 850, fontSize: "clamp(1rem,1.5vw,1.4rem)", lineHeight: .92, letterSpacing: "-.03em" }, "h3"),
        text(`${id}-body-${index}`, card.body, { ...editorialBodyStyle("#111"), fontSize: ".58rem", lineHeight: 1.42 }),
      ], { background: index===0 ? "#f2b19c" : "#fff", padding: ".8rem", borderTop: "2px solid #111", minWidth: 0 })), {
        position: "absolute", left: "5%", right: "5%", bottom: "5%", height: "31%", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: ".65rem", zIndex: 4,
      }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#ede9df", color: "#111" }),
  ]);
}

function afterHoursFeaturePage(
  issueId: string,
  pageNo: number,
  id: string,
  headline: string,
  paragraphs: string[],
  portraitSrc: string,
): MagazinePageDefinition {
  return page(issueId, id, headline, "feature", "utility-full", "#0b0d12", [
    section(`${id}-main`, headline, "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, headline, { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 42%", filter: "grayscale(1) contrast(1.18)", zIndex: 1 }),
      stack(`${id}-glow`, [], { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,9,13,.96) 0%, rgba(7,9,13,.86) 31%, rgba(7,9,13,.42) 54%, rgba(7,9,13,.10) 100%), radial-gradient(circle at 73% 42%, rgba(255,83,58,.28), transparent 44%)", zIndex: 2 }),
      stack(`${id}-content`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / AFTER HOURS`, "#ff5b43"),
        text(`${id}-headline`, headline, { ...displaySansStyle("clamp(3.2rem,6.5vw,6.4rem)", "#fff"), whiteSpace: "pre-line", maxWidth: "92%" }, "h2"),
        text(`${id}-deck`, "At 17:00 the same streets begin serving a different city.", { color: "#fff", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.1rem,1.9vw,1.8rem)", lineHeight: .98, maxWidth: "24rem" }),
        grid(`${id}-body`, paragraphs.map((paragraph,index)=>text(`${id}-p-${index}`, paragraph, { color: "rgba(255,255,255,.82)", fontFamily: "var(--xp-font-editorial-body)", fontSize: "clamp(.64rem,.82vw,.82rem)", lineHeight: 1.48 })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".9rem" }),
        stack(`${id}-quote`, [label(`${id}-quote-label`, "THE LINE", "#111"), text(`${id}-quote`, "AFTER-HOURS ECONOMY IS STILL ECONOMY.", { color: "#111", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.2rem,2vw,1.9rem)", lineHeight: .94 }, "h3")], { background: "#d9ff4f", padding: ".9rem", maxWidth: "25rem", border: "2px solid #111" }),
      ], { position: "absolute", left: "5%", top: "5%", bottom: "5%", width: "41%", zIndex: 4, gap: ".7rem", justifyContent: "space-between", textShadow: "0 1px 16px rgba(0,0,0,.32)" }),
    ], { background: "#0b0d12", color: "#fff", position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function afterHoursModesPage(
  issueId: string,
  pageNo: number,
  id: string,
  cards: Array<{ title: string; body: string }>,
  portraitSrc: string,
): MagazinePageDefinition {
  return page(issueId, id, "Four ways the city changes after 5", "guide", "utility-full", "#241f34", [
    section(`${id}-main`, "Four ways the city changes after 5", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "After hours", { position: "absolute", left: "28%", bottom: 0, width: "44%", height: "78%", objectFit: "contain", objectPosition: "bottom center", filter: "grayscale(1) contrast(1.12)", zIndex: 2 }),
      stack(`${id}-title`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / AFTER HOURS`, "#d9ff4f"),
        text(`${id}-headline`, "FOUR WAYS\nTHE CITY\nCHANGES\nAFTER 5", { ...displaySansStyle("clamp(2.9rem,5.7vw,5.6rem)", "#fff"), whiteSpace: "pre-line" }, "h2"),
      ], { position: "absolute", left: "5%", top: "5%", width: "36%", zIndex: 4, gap: ".6rem" }),
      grid(`${id}-cards`, cards.map((card,index)=>stack(`${id}-card-${index}`, [
        text(`${id}-num-${index}`, String(index+1).padStart(2,"0"), { color: "#d9ff4f", fontSize: "clamp(1.6rem,2.8vw,2.7rem)", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, lineHeight: .85 }, "span"),
        text(`${id}-title-${index}`, card.title, { color: "#fff", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(1.1rem,1.7vw,1.7rem)", lineHeight: .9 }, "h3"),
        text(`${id}-body-${index}`, card.body, { color: "rgba(255,255,255,.76)", fontSize: ".58rem", lineHeight: 1.4 }),
      ], { background: index%2===0 ? "rgba(217,255,79,.08)" : "rgba(255,255,255,.05)", borderTop: "2px solid rgba(217,255,79,.72)", padding: ".7rem", minWidth: 0 })), { position: "absolute", right: "5%", top: "8%", bottom: "8%", width: "34%", gridTemplateColumns: "1fr", gap: ".65rem", zIndex: 4 }),
      label(`${id}-footer`, "THE CITY DOESN'T CLOCK OUT AT 17:00.", "#d9ff4f"),
    ], { background: "#241f34", color: "#fff", position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function afterWorkAdvertPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  return page(issueId, id, "AFTER/WORK", "ad", "utility-full", "#050505", [
    section(`${id}-main`, "AFTER/WORK concept campaign", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "After Work campaign", {
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 32%", filter: "grayscale(1) contrast(1.14)", zIndex: 1,
      }),
      stack(`${id}-flare`, [], {
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, rgba(5,5,5,.96) 0%, rgba(5,5,5,.86) 32%, rgba(53,16,19,.5) 60%, rgba(124,31,34,.16) 100%), radial-gradient(circle at 80% 32%, rgba(255,91,67,.22), transparent 38%)",
        zIndex: 2,
      }),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, "XPOMAG / CONCEPT CAMPAIGN", "#ff5b43"),
        text(`${id}-brand`, "AFTER/WORK", { color: "#fff", fontFamily: "var(--xp-font-grotesk)", fontSize: "clamp(.8rem,1.2vw,1.15rem)", fontWeight: 900, letterSpacing: ".17em" }, "span"),
        text(`${id}-headline`, "18:03.\nYOUR DAY\nIS NOT\nOVER.", { ...displaySansStyle("clamp(3.55rem,7vw,7rem)", "#fff"), whiteSpace: "pre-line", maxWidth: "92%" }, "h2"),
        text(`${id}-body`, "A nightlife-and-events concept placement showing how a premium partner can own the transition between work and the city after dark.", { color: "rgba(255,255,255,.82)", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.85rem,1.2vw,1.12rem)", lineHeight: 1.14, maxWidth: "27rem" }),
        label(`${id}-disclosure`, "PARTNER PREVIEW · NOT AN ANNOUNCED SPONSOR", "rgba(255,255,255,.65)"),
      ], { position: "absolute", left: "5%", top: "6%", bottom: "6%", width: "45%", zIndex: 4, gap: ".65rem", justifyContent: "space-between" }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#050505" }),
  ]);
}



function propertyFeaturePage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  deck: string,
  body: string[],
  tone: Tone,
  portraitSrc: string,
  options: { imageSide?: "left" | "right"; quote?: string; stat?: string; statLabel?: string } = {},
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const imageLeft = (options.imageSide ?? "right") === "left";
  const useFullBleedImage = id === "mixed-use-ii" || id === "sandton-scale";
  const propertyPortraitStyle: DesignElementNode["style"] = id === "mixed-use-i"
    ? {
        position: "absolute",
        left: "56%",
        right: "-1%",
        bottom: 0,
        width: "41%",
        height: "78%",
        objectFit: "contain",
        objectPosition: "bottom left",
        filter: "grayscale(1) contrast(1.08)",
        zIndex: 6,
      }
    : useFullBleedImage
      ? {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: id === "mixed-use-ii" ? "center 24%" : "center 22%",
          filter: id === "sandton-scale" ? "grayscale(1) contrast(1.18) brightness(.9)" : "grayscale(1) contrast(1.08)",
          zIndex: 2,
          opacity: id === "sandton-scale" ? .92 : .96,
        }
      : {
          position: "absolute",
          left: imageLeft ? "-3%" : "46%",
          right: imageLeft ? "46%" : "-3%",
          bottom: 0,
          width: "57%",
          height: "100%",
          objectFit: "contain",
          objectPosition: imageLeft ? "bottom left" : "bottom right",
          filter: "grayscale(1) contrast(1.08)",
          zIndex: 3,
        };
  const copyLeft = useFullBleedImage ? (id === "mixed-use-ii" ? "53%" : "5%") : imageLeft ? "56%" : "5%";
  const copyRight = useFullBleedImage ? (id === "mixed-use-ii" ? "5%" : "48%") : imageLeft ? "5%" : "56%";
  const statLeft = useFullBleedImage ? (id === "mixed-use-ii" ? "5%" : "67%") : imageLeft ? "5%" : "56%";
  const statBackground = id === "sandton-scale" ? "rgba(19,33,41,.84)" : "rgba(255,255,255,.84)";
  return page(issueId, id, headline, "feature", "utility-full", tone.bg, [
    section(`${id}-main`, headline, "main", [
      stack(`${id}-gridlines`, [], {
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to right, transparent 24.8%, rgba(0,0,0,.08) 25%, transparent 25.2%, transparent 49.8%, rgba(0,0,0,.08) 50%, transparent 50.2%, transparent 74.8%, rgba(0,0,0,.08) 75%, transparent 75.2%), linear-gradient(to bottom, transparent 24.8%, rgba(0,0,0,.06) 25%, transparent 25.2%, transparent 49.8%, rgba(0,0,0,.06) 50%, transparent 50.2%, transparent 74.8%, rgba(0,0,0,.06) 75%, transparent 75.2%)",
      }),
      editorialPhoto(`${id}-portrait`, portraitSrc, headline, propertyPortraitStyle),
      ...(useFullBleedImage ? [stack(`${id}-image-wash`, [], {
        position: "absolute",
        inset: 0,
        zIndex: 3,
        background: id === "mixed-use-ii"
          ? "linear-gradient(90deg, rgba(238,232,220,.08) 0%, rgba(238,232,220,.14) 30%, rgba(238,232,220,.82) 56%, rgba(238,232,220,.96) 100%)"
          : "linear-gradient(90deg, rgba(19,33,41,.96) 0%, rgba(19,33,41,.86) 38%, rgba(19,33,41,.46) 62%, rgba(19,33,41,.16) 100%)",
      })] : []),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / ${kicker}`, tone.accent ?? ink),
        text(`${id}-headline`, headline, {
          ...displaySansStyle("clamp(3.1rem,6.2vw,5.95rem)", ink),
          whiteSpace: "pre-line",
          maxWidth: "92%",
        }, "h2"),
        text(`${id}-deck`, deck, {
          color: ink,
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(1rem,1.7vw,1.6rem)",
          lineHeight: 1.02,
          letterSpacing: "-.035em",
          maxWidth: "27rem",
        }),
        grid(`${id}-body`, body.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, {
          ...editorialBodyStyle(ink),
          fontSize: "clamp(.62rem,.82vw,.82rem)",
          lineHeight: 1.46,
        })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".9rem" }),
        ...(options.quote ? [stack(`${id}-quote`, [
          label(`${id}-quote-label`, "THE IDEA", ink),
          text(`${id}-quote-copy`, options.quote, {
            color: ink,
            fontFamily: "var(--xp-font-editorial)",
            fontSize: "clamp(1.15rem,1.95vw,1.85rem)",
            lineHeight: .96,
            letterSpacing: "-.04em",
          }, "h3"),
        ], { background: tone.accent ?? "#d8ff52", border: `2px solid ${ink}`, padding: ".85rem", maxWidth: "25rem" })] : []),
      ], {
        position: "absolute",
        top: "5%",
        bottom: "5%",
        left: copyLeft,
        right: copyRight,
        zIndex: 4,
        gap: ".72rem",
        justifyContent: "space-between",
      }),
      ...(options.stat ? [stack(`${id}-stat`, [
        text(`${id}-stat-value`, options.stat, { fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(2.7rem,5vw,5rem)", lineHeight: .8, color: ink }, "span"),
        label(`${id}-stat-label`, options.statLabel ?? "", ink),
      ], {
        position: "absolute",
        zIndex: 5,
        left: statLeft,
        top: "7%",
        width: "27%",
        padding: ".8rem",
        background: statBackground,
        borderTop: `4px solid ${tone.accent ?? ink}`,
      })] : []),
    ], { position: "relative", minHeight: "100%", padding: 0, background: tone.bg, color: ink }),
  ]);
}

function retailDataPage(
  issueId: string,
  pageNo: number,
  id: string,
  headline: string,
  portraitSrc: string,
): MagazinePageDefinition {
  const cards = [
    { value: "1.3%", label: "REPORTED VACANCY", body: "Rosebank Mall vacancy in Hyprop's June 2026 operational update." },
    { value: "6", label: "RECENT ADDITIONS", body: "FARO, Wellness Warehouse, Lupis, Livo, Nuage and Stouti." },
    { value: "2", label: "UPGRADES", body: "Swarovski upgraded while Total Sports expanded." },
    { value: "1", label: "CORE IDEA", body: "Physical retail still matters when the visit feels worth making." },
  ];
  return page(issueId, id, headline, "data", "utility-full", "#f5c84a", [
    section(`${id}-main`, headline, "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, headline, {
        position: "absolute", right: "-3%", bottom: 0, width: "50%", height: "84%", objectFit: "contain", objectPosition: "bottom right", filter: "grayscale(1) contrast(1.1)", zIndex: 2,
      }),
      stack(`${id}-head`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / RETAIL / ROSEBANK`, "#7b4200"),
        text(`${id}-headline`, "LOW VACANCY.\nNEW NAMES.", { ...displaySansStyle("clamp(3.55rem,7.2vw,7rem)", "#1f1705"), whiteSpace: "pre-line", maxWidth: "88%" }, "h2"),
        text(`${id}-deck`, "Retail is not dead. Undifferentiated retail has a harder job.", { fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.6vw,1.5rem)", lineHeight: 1.03, maxWidth: "27rem" }),
      ], { position: "absolute", left: "5%", top: "5%", width: "52%", zIndex: 4, gap: ".65rem" }),
      grid(`${id}-cards`, cards.map((card,index)=>stack(`${id}-card-${index}`, [
        text(`${id}-value-${index}`, card.value, { fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(2rem,3.8vw,3.7rem)", lineHeight: .85, color: "#1f1705" }, "span"),
        label(`${id}-label-${index}`, card.label, "#7b4200"),
        text(`${id}-body-${index}`, card.body, { ...editorialBodyStyle("#1f1705"), fontSize: ".6rem", lineHeight: 1.42 }),
      ], { background: index===0 ? "#fff3c5" : "rgba(255,255,255,.5)", borderTop: "2px solid #1f1705", padding: ".75rem", minWidth: 0 })), {
        position: "absolute", left: "5%", right: "5%", bottom: "5%", height: "31%", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: ".65rem", zIndex: 4,
      }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#f5c84a", color: "#1f1705" }),
  ]);
}

function sponsoredPropertyPage(
  issueId: string,
  pageNo: number,
  id: string,
  headline: string,
  deck: string,
  body: string[],
  portraitSrc: string,
  options: { reversed?: boolean; quote?: string } = {},
): MagazinePageDefinition {
  const reversed = options.reversed ?? false;
  const useFullBleedImage = id === "sponsored-fieldwork-ii";
  return page(issueId, id, headline, "sponsored", "utility-full", "#e7eef4", [
    section(`${id}-main`, headline, "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, headline, useFullBleedImage ? {
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "grayscale(1) contrast(1.1)", zIndex: 2,
      } : {
        position: "absolute", left: reversed ? "-2%" : "48%", right: reversed ? "48%" : "-2%", bottom: 0, width: "54%", height: "100%", objectFit: "contain", objectPosition: reversed ? "bottom left" : "bottom right", filter: "grayscale(1) contrast(1.08)", zIndex: 5,
      }),
      ...(useFullBleedImage ? [stack(`${id}-image-wash`, [], {
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(90deg, rgba(231,238,244,.96) 0%, rgba(231,238,244,.88) 40%, rgba(231,238,244,.46) 68%, rgba(231,238,244,.12) 100%)",
      })] : []),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / PARTNER STORY · CONCEPT`, "#3157ff"),
        text(`${id}-brand`, "FIELDWORK", { fontFamily: "var(--xp-font-grotesk)", fontWeight: 900, letterSpacing: ".17em", fontSize: ".82rem", color: "#3157ff" }, "span"),
        text(`${id}-headline`, headline, { ...displaySansStyle("clamp(2.95rem,5.9vw,5.7rem)", "#111820"), whiteSpace: "pre-line", maxWidth: "92%" }, "h2"),
        text(`${id}-deck`, deck, { color: "#111820", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.6vw,1.5rem)", lineHeight: 1.02 }),
        grid(`${id}-body`, body.map((paragraph,index)=>text(`${id}-p-${index}`, paragraph, { ...editorialBodyStyle("#27343b"), fontSize: ".64rem", lineHeight: 1.46 })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".9rem" }),
        ...(options.quote ? [stack(`${id}-quote`, [
          label(`${id}-quote-label`, "THE SHIFT", "#111"),
          text(`${id}-quote-copy`, options.quote, { fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.1rem,1.9vw,1.8rem)", lineHeight: .96, color: "#111" }, "h3"),
        ], { background: "#b9ceff", border: "2px solid #111", padding: ".85rem" })] : []),
      ], {
        position: "absolute", top: "5%", bottom: "5%", left: useFullBleedImage ? "5%" : reversed ? "52%" : "5%", right: useFullBleedImage ? "48%" : reversed ? "5%" : "52%", zIndex: 4, gap: ".7rem", justifyContent: "space-between",
      }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#e7eef4" }),
  ]);
}

function propertyAdvertPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  return page(issueId, id, "FIELDWORK", "ad", "utility-full", "#3157ff", [
    section(`${id}-main`, "FIELDWORK concept campaign", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "Fieldwork campaign", {
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", filter: "grayscale(1) contrast(1.12)", zIndex: 1,
      }),
      stack(`${id}-wash`, [], {
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, rgba(49,87,255,.96) 0%, rgba(49,87,255,.86) 36%, rgba(49,87,255,.52) 64%, rgba(49,87,255,.12) 100%)",
        zIndex: 2,
      }),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / CONCEPT CAMPAIGN`, "#dbe5ff"),
        text(`${id}-brand`, "FIELDWORK", { color: "#fff", fontFamily: "var(--xp-font-grotesk)", fontSize: "clamp(.85rem,1.2vw,1.15rem)", fontWeight: 900, letterSpacing: ".17em" }, "span"),
        text(`${id}-headline`, "YOU DON'T LEASE\nFOUR WALLS.\nYOU LEASE\nWHAT'S AROUND THEM.", { ...displaySansStyle("clamp(3.05rem,6vw,5.9rem)", "#fff"), whiteSpace: "pre-line", maxWidth: "92%" }, "h2"),
        text(`${id}-body`, "A fictional office-and-property campaign showing how commercial inventory can sit inside the magazine without pretending to be editorial.", { color: "rgba(255,255,255,.82)", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.88rem,1.25vw,1.15rem)", lineHeight: 1.15, maxWidth: "27rem" }),
        label(`${id}-disclosure`, "PARTNER PREVIEW · NOT AN ANNOUNCED SPONSOR", "rgba(255,255,255,.66)"),
      ], { position: "absolute", left: "5%", top: "6%", bottom: "6%", width: "47%", zIndex: 4, gap: ".65rem", justifyContent: "space-between" }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#3157ff" }),
  ]);
}


function wellnessFeaturePage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  deck: string,
  body: string[],
  portraitSrc: string,
  tone: Tone,
  options: { imageSide?: "left" | "right"; quote?: string; metric?: string; metricLabel?: string } = {},
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const imageLeft = (options.imageSide ?? "right") === "left";
  const useFullBleedImage = id === "wellness-ii";
  return page(issueId, id, headline, "feature", "utility-full", tone.bg, [
    section(`${id}-main`, headline, "main", [
      stack(`${id}-track-lines`, [], {
        position: "absolute", inset: 0, zIndex: 1,
        background: `repeating-linear-gradient(90deg, transparent 0 8.2%, ${tone.accent ?? ink}20 8.2% 8.45%)`,
      }),
      editorialPhoto(`${id}-portrait`, portraitSrc, headline, useFullBleedImage ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center 24%",
        filter: "grayscale(1) contrast(1.08)",
        zIndex: 2,
      } : {
        position: "absolute",
        left: imageLeft ? "-3%" : "46%",
        right: imageLeft ? "46%" : "-3%",
        bottom: 0,
        width: "58%",
        height: "102%",
        objectFit: "contain",
        objectPosition: imageLeft ? "bottom left" : "bottom right",
        filter: "grayscale(1) contrast(1.08)",
        zIndex: 3,
      }),
      ...(useFullBleedImage ? [stack(`${id}-image-wash`, [], {
        position: "absolute",
        inset: 0,
        zIndex: 3,
        background: "linear-gradient(90deg, rgba(240,236,210,.08) 0%, rgba(240,236,210,.16) 28%, rgba(240,236,210,.82) 56%, rgba(240,236,210,.96) 100%)",
      })] : []),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / ${kicker}`, tone.accent ?? ink),
        text(`${id}-headline`, headline, { ...displaySansStyle("clamp(3rem,6vw,5.8rem)", ink), whiteSpace: "pre-line", maxWidth: "92%" }, "h2"),
        text(`${id}-deck`, deck, {
          color: ink, fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.7vw,1.55rem)", lineHeight: 1.03, letterSpacing: "-.035em",
        }),
        grid(`${id}-body`, body.map((paragraph,index)=>text(`${id}-p-${index}`, paragraph, {
          ...editorialBodyStyle(ink), fontSize: "clamp(.62rem,.84vw,.82rem)", lineHeight: 1.46,
        })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".9rem" }),
        ...(options.quote ? [stack(`${id}-quote`, [
          label(`${id}-quote-label`, "THE TAKEAWAY", ink),
          text(`${id}-quote-copy`, options.quote, { fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.15rem,1.95vw,1.9rem)", lineHeight: .95, color: ink }, "h3"),
        ], { background: tone.accent ?? "#d8ff52", border: `2px solid ${ink}`, padding: ".85rem" })] : []),
      ], {
        position: "absolute", top: "5%", bottom: "5%", left: useFullBleedImage ? "53%" : imageLeft ? "53%" : "5%", right: useFullBleedImage ? "5%" : imageLeft ? "5%" : "53%", zIndex: 4, gap: ".72rem", justifyContent: "space-between",
      }),
      ...(options.metric ? [stack(`${id}-metric`, [
        text(`${id}-metric-value`, options.metric, { fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(2.5rem,5vw,4.9rem)", lineHeight: .8, color: ink }, "span"),
        label(`${id}-metric-label`, options.metricLabel ?? "", ink),
      ], {
        position: "absolute", zIndex: 5, left: useFullBleedImage ? "5%" : imageLeft ? "5%" : "58%", top: "7%", width: "25%", padding: ".75rem", background: "rgba(255,255,255,.84)", borderTop: `4px solid ${tone.accent ?? ink}`,
      })] : []),
    ], { position: "relative", minHeight: "100%", padding: 0, background: tone.bg, color: ink }),
  ]);
}

function runClubPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  const clubs = [
    { n: "01", title: "LET THE PEOPLE RUN", meta: "SOCIAL RUN", body: "A recurring Rosebank community that turns weekday movement into repeated social contact." },
    { n: "02", title: "BENCHWARMERS", meta: "SOCIAL RUN", body: "Rosebank streets become a meeting place, not just the distance between destinations." },
    { n: "03", title: "THE PACK", meta: "THE ZONE", body: "A running community linked to The Zone @ Rosebank in current precinct listings." },
    { n: "04", title: "THE QUESTION", meta: "ISSUE 02", body: "Which group should XpoMag join next — and what do runners notice that drivers miss?" },
  ];
  return page(issueId, id, "RUN FIRST. NETWORK ACCIDENTALLY.", "guide", "utility-full", "#18241e", [
    section(`${id}-main`, "Rosebank runs", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "Rosebank running", {
        position: "absolute", left: "28%", bottom: 0, width: "50%", height: "100%", objectFit: "contain", objectPosition: "bottom center", filter: "grayscale(1) contrast(1.18)", zIndex: 2,
      }),
      stack(`${id}-head`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / ROSEBANK RUNNING`, "#d8ff52"),
        text(`${id}-headline`, "RUN FIRST.\nNETWORK\nACCIDENTALLY.", { ...displaySansStyle("clamp(3rem,6vw,5.8rem)", "#fff"), whiteSpace: "pre-line", maxWidth: "94%" }, "h2"),
        text(`${id}-deck`, "Movement is the visible activity. Community is the infrastructure underneath it.", { color: "#d6e1d9", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.95rem,1.5vw,1.4rem)", lineHeight: 1.05 }),
      ], { position: "absolute", left: "5%", top: "5%", width: "35%", zIndex: 4, gap: ".65rem" }),
      grid(`${id}-clubs`, clubs.map((club,index)=>stack(`${id}-club-${index}`, [
        text(`${id}-n-${index}`, club.n, { color: "#d8ff52", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(1.6rem,2.8vw,2.8rem)", lineHeight: .8 }, "span"),
        label(`${id}-meta-${index}`, club.meta, "#d8ff52"),
        text(`${id}-title-${index}`, club.title, { color: "#fff", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(1rem,1.55vw,1.45rem)", lineHeight: .9 }, "h3"),
        text(`${id}-body-${index}`, club.body, { color: "rgba(255,255,255,.72)", fontSize: ".58rem", lineHeight: 1.4 }),
      ], { padding: ".75rem", background: index % 2 ? "rgba(255,255,255,.055)" : "rgba(216,255,82,.07)", borderTop: "2px solid rgba(216,255,82,.7)" })), {
        position: "absolute", right: "4%", top: "8%", bottom: "8%", width: "25%", gridTemplateColumns: "1fr", gap: ".6rem", zIndex: 4,
      }),
      label(`${id}-footer`, "SAVE THIS GUIDE · SHARE IT WITH YOUR RUNNING GROUP", "#d8ff52"),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#18241e" }),
  ]);
}

function itineraryPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  const stops = [
    ["08:00", "ROSEBANK COFFEE", "Start compact. Walk the first few stops rather than driving between them."],
    ["10:00", "GALLERY LOOP", "Keyes and the surrounding art circuit turn the district into a cultural walk."],
    ["13:00", "LONG LUNCH", "Choose one place worth staying in rather than treating lunch as a gap."],
    ["16:30", "MOVE NORTH", "Shift into Sandton while the commercial node is still fully active."],
    ["18:00", "DRINK / PAUSE", "Let the workday dissolve before dinner."],
    ["20:00", "DESTINATION DINNER", "End somewhere designed to feel like an occasion."],
  ];
  return page(issueId, id, "48 HOURS · ROSEBANK + SANDTON", "guide", "utility-full", "#dbe3f6", [
    section(`${id}-main`, "48 hour itinerary", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "48 hours in the city", { position: "absolute", right: "-2%", bottom: 0, width: "54%", height: "100%", objectFit: "contain", objectPosition: "bottom right", filter: "grayscale(1) contrast(1.08)", zIndex: 2 }),
      stack(`${id}-head`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / CITY ITINERARY`, "#3157ff"),
        text(`${id}-headline`, "48\nHOURS", { ...displaySansStyle("clamp(4.4rem,8.6vw,8.4rem)", "#141b2b"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-sub`, "ROSEBANK + SANDTON", { color: "#3157ff", fontFamily: "var(--xp-font-grotesk)", fontWeight: 900, fontSize: "clamp(1rem,1.7vw,1.6rem)", letterSpacing: ".08em" }, "span"),
        text(`${id}-deck`, "Stay inside the two-node universe and see how much city fits into it.", { color: "#141b2b", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.55vw,1.4rem)", lineHeight: 1.04 }),
      ], { position: "absolute", left: "5%", top: "5%", width: "36%", zIndex: 4, gap: ".55rem" }),
      grid(`${id}-stops`, stops.map((stop,index)=>stack(`${id}-stop-${index}`, [
        text(`${id}-time-${index}`, stop[0], { color: "#3157ff", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(1.2rem,2vw,1.9rem)", lineHeight: .9 }, "span"),
        text(`${id}-title-${index}`, stop[1], { color: "#141b2b", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".84rem", lineHeight: .95 }, "h3"),
        text(`${id}-body-${index}`, stop[2], { color: "#4c5670", fontSize: ".55rem", lineHeight: 1.38 }),
      ], { borderTop: "2px solid #3157ff", paddingTop: ".55rem" })), { position: "absolute", left: "5%", bottom: "5%", width: "46%", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".8rem 1rem", zIndex: 4 }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#dbe3f6" }),
  ]);
}

function weekendPosterPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  const items = ["SEE AN EXHIBITION","BUY FROM A LOCAL MAKER","TAKE THE GAUTRAIN","GO TO THE SUNDAY MARKET","TRY A NEW RESTAURANT","WALK KEYES","GO FOR A RUN","TAKE SOMEONE FOR COFFEE","SPEND AN HOUR IN A GALLERY","VISIT A SHOP YOU'VE IGNORED","SIT IN A HOTEL LOBBY","END SOMEWHERE UNPLANNED"];
  return page(issueId, id, "TWELVE REASONS NOT TO STAY HOME", "guide", "utility-full", "#efc3aa", [
    section(`${id}-main`, "Weekend list", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "Weekend city guide", { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "grayscale(1) contrast(1.1)", opacity: .96, zIndex: 1 }),
      stack(`${id}-image-wash`, [], {
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(90deg, rgba(239,195,170,.95) 0%, rgba(239,195,170,.86) 40%, rgba(239,195,170,.48) 66%, rgba(239,195,170,.1) 100%)",
      }),
      stack(`${id}-head`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / THE WEEKEND LIST`, "#8f3e27"),
        text(`${id}-headline`, "12 REASONS\nNOT TO\nSTAY HOME", { ...displaySansStyle("clamp(3.45rem,6.9vw,6.7rem)", "#28170f"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-deck`, "Save the list. Do one thing this weekend. Leave one hour unplanned.", { fontFamily: "var(--xp-font-editorial)", color: "#28170f", fontSize: "clamp(.95rem,1.45vw,1.35rem)", lineHeight: 1.05 }),
      ], { position: "absolute", left: "5%", top: "5%", width: "43%", zIndex: 4, gap: ".6rem" }),
      grid(`${id}-items`, items.map((item,index)=>stack(`${id}-item-${index}`, [
        text(`${id}-num-${index}`, String(index+1).padStart(2,"0"), { color: "#8f3e27", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".8rem" }, "span"),
        text(`${id}-item-title-${index}`, item, { color: "#28170f", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".62rem", lineHeight: .95 }, "span"),
      ], { borderTop: "1px solid rgba(40,23,15,.45)", paddingTop: ".35rem" })), { position: "absolute", left: "5%", bottom: "5%", width: "49%", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: ".6rem .8rem", zIndex: 4 }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#efc3aa" }),
  ]);
}

function eventsCalendarPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  const events = [
    { date: "15", mon: "NOV", title: "WOMEN MAKING THEIR MARK", place: "Art&About · Sandton", body: "A large exhibition bringing together women artists across generations and disciplines." },
    { date: "28", mon: "NOV", title: "PLATED: A CHEF'S TABLE", place: "The Maslow · Sandton", body: "A chef-led dining experience with a confirmed late-November date in the current series." },
    { date: "↻", mon: "WEEK", title: "ROSEBANK RUNNING COMMUNITIES", place: "Rosebank precinct", body: "Recurring social runs continue to animate weekday evenings." },
    { date: "SUN", mon: "WEEKLY", title: "ROSEBANK SUNDAY MARKET", place: "Rosebank Mall rooftop", body: "A repeat weekend anchor with three decades of history." },
  ];
  return page(issueId, id, "WHAT'S ON", "events", "utility-full", "#f3efe6", [
    section(`${id}-main`, "November what's on", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "November events", { position: "absolute", right: "-1%", top: "9%", width: "45%", height: "89%", objectFit: "contain", objectPosition: "bottom right", filter: "grayscale(1) contrast(1.1)", zIndex: 2 }),
      stack(`${id}-head`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / NOVEMBER`, "#3157ff"),
        text(`${id}-headline`, "WHAT'S\nON", { ...displaySansStyle("clamp(4.2rem,7.8vw,7.6rem)", "#171512"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-deck`, "Only confirmed listings belong here. This page is rechecked 7–10 days before publication.", { color: "#57534c", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.9rem,1.35vw,1.25rem)", lineHeight: 1.05 }),
      ], { position: "absolute", left: "5%", top: "5%", width: "38%", zIndex: 4, gap: ".55rem" }),
      grid(`${id}-events`, events.map((event,index)=>stack(`${id}-event-${index}`, [
        stack(`${id}-date-${index}`, [
          text(`${id}-date-n-${index}`, event.date, { color: "#171512", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(1.7rem,3vw,2.8rem)", lineHeight: .8 }, "span"),
          label(`${id}-date-mon-${index}`, event.mon, "#3157ff"),
        ], { gap: ".15rem" }),
        stack(`${id}-event-copy-${index}`, [
          text(`${id}-event-title-${index}`, event.title, { color: "#171512", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".8rem", lineHeight: .94 }, "h3"),
          label(`${id}-event-place-${index}`, event.place, "#3157ff"),
          text(`${id}-event-body-${index}`, event.body, { color: "#57534c", fontSize: ".56rem", lineHeight: 1.4 }),
        ], { gap: ".25rem" }),
      ], { gridTemplateColumns: "64px 1fr", gap: ".65rem", borderTop: "2px solid #171512", paddingTop: ".55rem" })), { position: "absolute", left: "5%", bottom: "5%", width: "56%", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".8rem 1rem", zIndex: 4 }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#f3efe6" }),
  ]);
}

function xpomag12Page(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  const items = ["KORA","KEYES ART MILE","CIRCA","ROSEBANK SUNDAY MARKET","WOMEN MAKING THEIR MARK","QLOUNGE MENU REFRESH","ROSEBANK RUNNING COMMUNITIES","LIVO","FARO","STOUTI","BARBOUR · SANDTON CITY","THE MASLOW CHEF'S TABLE"];
  return page(issueId, id, "THE XPOMAG 12", "list", "utility-full", "#101010", [
    section(`${id}-main`, "The XpoMag 12", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "XpoMag 12", { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%", filter: "grayscale(1) contrast(1.2)", opacity: .88, zIndex: 1 }),
      stack(`${id}-wash`, [], {
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(90deg, rgba(16,16,16,.97) 0%, rgba(16,16,16,.88) 38%, rgba(16,16,16,.54) 64%, rgba(16,16,16,.14) 100%)",
      }),
      stack(`${id}-head`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / EDITOR'S NOTEBOOK`, "#d8ff52"),
        text(`${id}-headline`, "THE\nXPOMAG\n12", { ...displaySansStyle("clamp(4rem,7.8vw,7.7rem)", "#fff"), whiteSpace: "pre-line", maxWidth: "92%" }, "h2"),
        text(`${id}-deck`, "Not awards. Not 'best of'. Twelve things we'd save this month.", { color: "#d5d5d5", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.95rem,1.5vw,1.35rem)", lineHeight: 1.05 }),
      ], { position: "absolute", left: "5%", top: "5%", width: "39%", zIndex: 4, gap: ".55rem" }),
      grid(`${id}-items`, items.map((item,index)=>stack(`${id}-item-${index}`, [
        text(`${id}-num-${index}`, String(index+1).padStart(2,"0"), { color: "#d8ff52", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".78rem" }, "span"),
        text(`${id}-item-title-${index}`, item, { color: "#fff", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".62rem", lineHeight: .94 }, "span"),
      ], { borderTop: "1px solid rgba(216,255,82,.45)", paddingTop: ".35rem" })), { position: "absolute", left: "5%", bottom: "5%", width: "52%", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: ".65rem .85rem", zIndex: 4 }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#101010" }),
  ]);
}

function threadAdvertPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  return page(issueId, id, "THREAD", "ad", "utility-full", "#6c4dff", [
    section(`${id}-main`, "THREAD concept campaign", "main", [
      stack(`${id}-rings`, [], { position: "absolute", inset: "-18% -10% -18% 35%", borderRadius: "50%", border: "90px solid rgba(255,255,255,.08)", zIndex: 2 }),
      editorialPhoto(`${id}-portrait`, portraitSrc, "THREAD campaign", { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", filter: "grayscale(1) contrast(1.15)", zIndex: 1 }),
      stack(`${id}-wash`, [], {
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(90deg, rgba(108,77,255,.96) 0%, rgba(108,77,255,.86) 36%, rgba(108,77,255,.5) 64%, rgba(108,77,255,.14) 100%)",
      }),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / CONCEPT CAMPAIGN`, "#dcd4ff"),
        text(`${id}-brand`, "THREAD", { color: "#fff", fontFamily: "var(--xp-font-grotesk)", fontSize: "clamp(.9rem,1.3vw,1.2rem)", fontWeight: 900, letterSpacing: ".17em" }, "span"),
        text(`${id}-headline`, "YOUR CITY\nSHOULD KNOW\nWHAT YOU LIKE.", { ...displaySansStyle("clamp(3.25rem,6.5vw,6.3rem)", "#fff"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-body`, "Local discovery reorganised around you. A fictional technology campaign intentionally close to XpoMag's save-and-collection behaviour.", { color: "rgba(255,255,255,.84)", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.9rem,1.3vw,1.2rem)", lineHeight: 1.12, maxWidth: "28rem" }),
        label(`${id}-disclosure`, "PARTNER PREVIEW · NOT AN ANNOUNCED SPONSOR", "rgba(255,255,255,.68)"),
      ], { position: "absolute", left: "5%", top: "6%", bottom: "6%", width: "48%", zIndex: 4, gap: ".65rem", justifyContent: "space-between" }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#6c4dff" }),
  ]);
}


function interviewFinalePage(
  issueId: string,
  pageNo: number,
  id: string,
  portraitSrc: string,
): MagazinePageDefinition {
  const questions = [
    ["01", "WHAT ARE YOU BUILDING?", "Start with the work itself. Not the title, not the pitch deck — what are you actually trying to put into the world?"],
    ["02", "WHY HERE?", "Why Rosebank or Sandton? What does this part of Johannesburg make easier, harder or more interesting?"],
    ["03", "WHAT'S HARDER THAN PEOPLE REALISE?", "The part outsiders miss: distribution, hiring, landlords, margins, timing, community, regulation or simply staying consistent."],
    ["04", "WHICH LOCAL BUSINESS DO YOU USE CONSTANTLY?", "A useful answer turns the interview into discovery and gives another operator a reason to be found."],
    ["05", "WHAT SHOULD EXIST HERE THAT DOESN'T YET?", "End on possibility. Every strong city interview should leave one unfinished idea behind."],
  ] as const;
  return page(issueId, id, "Five Questions", "feature", "utility-full", "#f0dfef", [
    section(`${id}-main`, "Five Questions", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "XpoMag interview portrait", {
        position: "absolute", right: "-3%", bottom: 0, width: "52%", height: "98%", objectFit: "contain", objectPosition: "bottom right", filter: "grayscale(1) contrast(1.14)", zIndex: 1,
      }),
      stack(`${id}-header`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / PEOPLE`, "#7d3d93"),
        text(`${id}-headline`, "FIVE\nQUESTIONS", { ...displaySansStyle("clamp(3.8rem,7.3vw,7rem)", "#221628"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-dek`, "A recurring interview format designed to be quick to answer, useful to read and easy to return to every month.", {
          color: "#221628", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.55vw,1.45rem)", lineHeight: 1.02, letterSpacing: "-.035em", maxWidth: "24rem",
        }),
      ], { position: "absolute", left: "5%", top: "5%", width: "43%", zIndex: 4, gap: ".55rem" }),
      grid(`${id}-questions`, questions.map(([num,title,body], index) => stack(`${id}-q-${index}`, [
        grid(`${id}-qhead-${index}`, [
          text(`${id}-qnum-${index}`, num, { color: "#7d3d93", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "1rem", lineHeight: 1 }, "span"),
          text(`${id}-qtitle-${index}`, title, { color: "#221628", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(.62rem,.78vw,.8rem)", lineHeight: .95 }, "h3"),
        ], { gridTemplateColumns: "30px 1fr", gap: ".35rem", alignItems: "start" }),
        text(`${id}-qbody-${index}`, body, { ...editorialBodyStyle("#221628"), fontSize: "clamp(.49rem,.58vw,.59rem)", lineHeight: 1.34 }),
      ], { borderTop: "1px solid rgba(34,22,40,.25)", paddingTop: ".35rem", gap: ".22rem" })), {
        position: "absolute", left: "5%", bottom: "5%", width: "49%", height: "43%", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".55rem .8rem", zIndex: 4,
      }),
      stack(`${id}-pull`, [
        label(`${id}-pull-label`, "THE FORMAT", "#221628"),
        text(`${id}-pull-text`, "15 MINUTES.\n5 QUESTIONS.\n1 PERSON WORTH KNOWING.", { color: "#221628", fontFamily: "var(--xp-font-editorial)", fontStyle: "italic", fontSize: "clamp(1.15rem,2vw,1.95rem)", lineHeight: .92, whiteSpace: "pre-line" }, "h3"),
      ], { position: "absolute", right: "4%", bottom: "6%", width: "30%", background: "#f5d34f", border: "2px solid #221628", padding: "1rem", zIndex: 5 }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#f0dfef" }),
  ]);
}

function madeHereFinalePage(
  issueId: string,
  pageNo: number,
  id: string,
  portraitSrc: string,
): MagazinePageDefinition {
  const items = [
    ["01", "WEAR", "A fashion label with a local point of view — product, price, maker and where to find it."],
    ["02", "LIVE WITH", "Furniture, ceramics, print or an object that makes a room feel more intentional."],
    ["03", "USE", "Beauty, grooming or wellness built by a founder worth discovering."],
    ["04", "GIFT", "Something edible, tactile or beautifully packaged that travels well beyond the neighbourhood."],
    ["05", "READ", "A book, publication or printed object connected to the city."],
    ["06", "KEEP", "A small thing with enough character to become a personal souvenir of the issue."],
  ] as const;
  return page(issueId, id, "Made Here", "directory", "utility-full", "#e8ddc8", [
    section(`${id}-main`, "Made Here", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "Made Here editorial subject", {
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", filter: "grayscale(1) contrast(1.1)", zIndex: 1,
      }),
      stack(`${id}-image-wash`, [], {
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(90deg, rgba(232,221,200,.14) 0%, rgba(232,221,200,.18) 26%, rgba(232,221,200,.8) 52%, rgba(232,221,200,.96) 100%)",
      }),
      stack(`${id}-header`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / LOCAL COMMERCE`, "#8c5d2c"),
        text(`${id}-headline`, "MADE\nHERE", { ...displaySansStyle("clamp(5rem,10vw,9.5rem)", "#1e1810"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-dek`, "Six things we would happily carry out of the city with us.", { color: "#1e1810", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.15rem,1.9vw,1.8rem)", lineHeight: .98, maxWidth: "22rem" }),
      ], { position: "absolute", left: "44%", top: "5%", right: "5%", zIndex: 4, gap: ".45rem" }),
      grid(`${id}-items`, items.map(([num,title,body], index) => stack(`${id}-item-${index}`, [
        label(`${id}-num-${index}`, num, "#8c5d2c"),
        text(`${id}-title-${index}`, title, { color: "#1e1810", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(.9rem,1.3vw,1.25rem)", lineHeight: .9 }, "h3"),
        text(`${id}-body-${index}`, body, { ...editorialBodyStyle("#1e1810"), fontSize: "clamp(.49rem,.58vw,.6rem)", lineHeight: 1.34 }),
      ], { borderTop: "2px solid #8c5d2c", paddingTop: ".35rem", gap: ".22rem" })), {
        position: "absolute", left: "44%", right: "5%", bottom: "5%", height: "51%", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gridTemplateRows: "repeat(2,minmax(0,1fr))", gap: ".7rem .9rem", zIndex: 4,
      }),
      text(`${id}-side-note`, "SAVE · VISIT · BUY LOCAL", { position: "absolute", left: "4%", top: "7%", color: "#8c5d2c", fontFamily: "var(--xp-font-display-sans)", fontSize: ".62rem", fontWeight: 900, letterSpacing: ".16em", transform: "rotate(-90deg)", transformOrigin: "left top", zIndex: 4 }, "span"),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#e8ddc8" }),
  ]);
}

function issueIndexFinalePage(issueId: string, pageNo: number, id: string): MagazinePageDefinition {
  const items = [
    "ART&ABOUT · Sandton exhibition venue",
    "BARBOUR · Sandton City retail",
    "BENCHWARMERS · Rosebank running community",
    "BKhz · Rosebank gallery",
    "CIRCA · Rosebank gallery + architecture",
    "DAVID KRUT · Art, print and publishing",
    "EVERARD READ · Keyes Art Mile gallery anchor",
    "FARO · Rosebank retail addition",
    "GOODMAN GALLERY · Contemporary-art anchor",
    "KEYES ART MILE · Art, design + hospitality precinct",
    "KORA · Restaurant at The Marc",
    "LET THE PEOPLE RUN · Rosebank running community",
    "LIVO · Rosebank retail addition",
    "QLounge · Rosebank restaurant",
    "ROSEBANK MALL · Retail anchor",
    "ROSEBANK SUNDAY MARKET · Rooftop market",
    "SANDTON CITY · Major retail destination",
    "THE MARC · Office, retail + hospitality",
    "THE MASLOW · Hotel + dining",
    "THE PACK · Rosebank running community",
  ];
  return page(issueId, id, "Everything in this issue", "directory", "utility-full", "#f0efea", [
    section(`${id}-main`, "Everything in this issue", "main", [
      stack(`${id}-header`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / REFERENCE`, "#3157ff"),
        text(`${id}-headline`, "THE\nINDEX", { ...displaySansStyle("clamp(4.7rem,9.5vw,9.1rem)", "#151515"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-dek`, "Everything worth finding again — people, places, venues, businesses and communities from Issue 01.", { color: "#151515", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.5vw,1.45rem)", lineHeight: 1.02, maxWidth: "25rem" }),
      ], { position: "absolute", left: "5%", top: "5%", width: "34%", gap: ".5rem" }),
      grid(`${id}-index`, items.map((item,index) => {
        const [name, desc] = item.split(" · ");
        return grid(`${id}-row-${index}`, [
          text(`${id}-num-${index}`, String(index+1).padStart(2,"0"), { color: "#3157ff", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".62rem" }, "span"),
          stack(`${id}-copy-${index}`, [
            text(`${id}-name-${index}`, name, { color: "#151515", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(.61rem,.78vw,.78rem)", lineHeight: .95 }, "h3"),
            text(`${id}-desc-${index}`, desc ?? "", { ...editorialBodyStyle("#151515"), fontSize: "clamp(.45rem,.52vw,.54rem)", lineHeight: 1.25 }),
          ], { gap: ".05rem" }),
        ], { gridTemplateColumns: "27px 1fr", gap: ".28rem", borderTop: "1px solid rgba(0,0,0,.16)", paddingTop: ".28rem" });
      }), { position: "absolute", left: "39%", right: "5%", top: "5%", bottom: "7%", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gridTemplateRows: "repeat(10,minmax(0,1fr))", gap: ".28rem 1rem" }),
      text(`${id}-footer`, "CLICKABLE IN THE FULL PRODUCT · SAVE WHAT YOU WANT TO RETURN TO", { position: "absolute", left: "5%", bottom: "5%", color: "#3157ff", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".58rem", letterSpacing: ".12em" }, "span"),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#f0efea" }),
  ]);
}

function communityFinalePage(
  issueId: string,
  pageNo: number,
  id: string,
  portraitSrc: string,
): MagazinePageDefinition {
  const ctas = [
    ["01", "NOMINATE A STORY", "A founder, operator, designer, chef, artist or builder we should meet."],
    ["02", "SUBMIT A PLACE", "A new opening, hidden favourite, useful room or neighbourhood ritual."],
    ["03", "PARTNER WITH XPOMAG", "Sponsor a story, own a premium placement or become an issue partner."],
    ["04", "GET THE NEXT ISSUE", "Return next month with your saved places, people and collections still intact."],
  ] as const;
  return page(issueId, id, "This magazine isn't finished", "feature", "utility-full", "#d8ff52", [
    section(`${id}-main`, "This magazine isn't finished", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "XpoMag community", { position: "absolute", right: "-2%", bottom: 0, width: "49%", height: "96%", objectFit: "contain", objectPosition: "bottom right", filter: "grayscale(1) contrast(1.1)", zIndex: 1 }),
      stack(`${id}-header`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / COMMUNITY`, "#3157ff"),
        text(`${id}-headline`, "THIS\nMAGAZINE\nISN'T\nFINISHED", { ...displaySansStyle("clamp(3.6rem,7.2vw,7rem)", "#111"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-dek`, "The next edition gets better when the city talks back.", { color: "#111", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.05rem,1.7vw,1.55rem)", lineHeight: .98, maxWidth: "24rem" }),
      ], { position: "absolute", left: "5%", top: "5%", width: "45%", gap: ".5rem", zIndex: 4 }),
      grid(`${id}-ctas`, ctas.map(([num,title,body],index)=>stack(`${id}-cta-${index}`, [
        label(`${id}-num-${index}`, num, "#3157ff"),
        text(`${id}-title-${index}`, title, { color: "#111", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(.72rem,.95vw,.95rem)", lineHeight: .92 }, "h3"),
        text(`${id}-body-${index}`, body, { ...editorialBodyStyle("#111"), fontSize: "clamp(.49rem,.58vw,.59rem)", lineHeight: 1.3 }),
      ], { background: index === 2 ? "#3157ff" : "rgba(255,255,255,.58)", color: index === 2 ? "#fff" : "#111", padding: ".65rem", gap: ".18rem" })), { position: "absolute", left: "5%", bottom: "5%", width: "53%", height: "32%", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".5rem", zIndex: 4 }),
      stack(`${id}-stamp`, [
        label(`${id}-stamp-a`, "ISSUE 02", "#fff"),
        text(`${id}-stamp-b`, "ROSEBANK + SANDTON\nRETURNS NEXT MONTH.", { color: "#fff", fontFamily: "var(--xp-font-editorial)", fontStyle: "italic", fontSize: "clamp(1rem,1.65vw,1.55rem)", lineHeight: .95, whiteSpace: "pre-line" }, "h3"),
      ], { position: "absolute", right: "4%", top: "6%", width: "28%", padding: ".8rem", background: "#111", zIndex: 5 }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#d8ff52" }),
  ]);
}

function insideBackCoverFinalePage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  const offerings = ["FULL-PAGE CAMPAIGNS", "SPONSORED STORIES", "NATIVE PLACEMENTS", "ISSUE PARTNERSHIPS"];
  return page(issueId, id, "Your brand × XpoMag", "ad", "utility-full", "#ffb8cf", [
    section(`${id}-main`, "Your brand × XpoMag", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "XpoMag partner campaign", { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "grayscale(1) contrast(1.12)", zIndex: 1 }),
      stack(`${id}-wash`, [], {
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(90deg, rgba(255,184,207,.96) 0%, rgba(255,184,207,.88) 40%, rgba(255,184,207,.5) 68%, rgba(255,184,207,.14) 100%)",
      }),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / INSIDE BACK COVER`, "#7b1639"),
        text(`${id}-headline`, "BE SEEN\nWHERE THE CITY\nIS LOOKING.", { ...displaySansStyle("clamp(3.7rem,7.5vw,7.2rem)", "#1a0f13"), whiteSpace: "pre-line" }, "h2"),
        text(`${id}-dek`, "A premium commercial surface inside a magazine people can keep discovering, saving and sharing long after publication day.", { color: "#1a0f13", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1rem,1.6vw,1.5rem)", lineHeight: 1.02, maxWidth: "25rem" }),
        grid(`${id}-offers`, offerings.map((offer,index)=>stack(`${id}-offer-${index}`, [
          label(`${id}-offer-n-${index}`, String(index+1).padStart(2,"0"), "#7b1639"),
          text(`${id}-offer-t-${index}`, offer, { color: "#1a0f13", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: ".66rem", lineHeight: .95 }, "span"),
        ], { borderTop: "1px solid rgba(26,15,19,.3)", paddingTop: ".3rem" })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".5rem .8rem" }),
        stack(`${id}-contact-details`, [
          text(`${id}-email`, "HELLO@BODILUM.COM", { color: "#1a0f13", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(.76rem,1.05vw,1rem)", letterSpacing: ".035em" }, "span"),
          text(`${id}-phone`, "+27 73 311 0149 · CALL / WHATSAPP", { color: "#1a0f13", fontFamily: "var(--xp-font-display-sans)", fontWeight: 800, fontSize: "clamp(.66rem,.9vw,.86rem)", letterSpacing: ".025em" }, "span"),
          text(`${id}-linkedin`, "DM · LINKEDIN.COM/IN/BODE-CHRIS", { color: "#1a0f13", fontFamily: "var(--xp-font-display-sans)", fontWeight: 800, fontSize: "clamp(.66rem,.9vw,.86rem)", letterSpacing: ".025em" }, "span"),
        ], { gap: ".16rem" }),
        label(`${id}-disclosure`, "PARTNER PREVIEW · SALES SURFACE", "#7b1639"),
      ], { position: "absolute", left: "5%", top: "5%", bottom: "5%", width: "48%", gap: ".65rem", justifyContent: "space-between", zIndex: 4 }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#ffb8cf" }),
  ]);
}

function backCoverFinalePage(issueId: string, pageNo: number, id: string): MagazinePageDefinition {
  return page(issueId, id, "XpoMag Issue Partner", "ad", "utility-full", "#090909", [
    section(`${id}-main`, "XpoMag Issue Partner", "main", [
      stack(`${id}-frame`, [], { position: "absolute", inset: "4%", border: "1px solid rgba(255,255,255,.3)", zIndex: 1 }),
      stack(`${id}-copy`, [
        grid(`${id}-meta`, [
          label(`${id}-page`, `XPOMAG / ${String(pageNo).padStart(2,"0")} / BACK COVER`, "rgba(255,255,255,.62)"),
          label(`${id}-issue`, "ROSEBANK + SANDTON · NOVEMBER 2026", "rgba(255,255,255,.62)"),
        ], { gridTemplateColumns: "1fr auto", gap: "1rem" }),
        text(`${id}-headline`, "THIS PAGE\nBELONGS TO\nONE BRAND.", { ...displaySansStyle("clamp(4.8rem,9.6vw,9.2rem)", "#fff"), whiteSpace: "pre-line", maxWidth: "90%" }, "h2"),
        grid(`${id}-bottom`, [
          stack(`${id}-partner`, [
            label(`${id}-partner-label`, "XPOMAG ISSUE PARTNER", "#d8ff52"),
            text(`${id}-partner-body`, "Major issue-partner inventory. One brand can own the final impression of Issue 01.", { color: "#fff", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(.9rem,1.35vw,1.25rem)", lineHeight: 1.08, maxWidth: "23rem" }),
          ], { gap: ".35rem" }),
          stack(`${id}-contact`, [
            label(`${id}-contact-label`, "ENQUIRE", "rgba(255,255,255,.6)"),
            text(`${id}-contact-email`, "hello@bodilum.com", { color: "#fff", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(.74rem,1vw,.96rem)" }, "span"),
            text(`${id}-contact-phone`, "+27 73 311 0149 · CALL / WHATSAPP", { color: "rgba(255,255,255,.86)", fontFamily: "var(--xp-font-display-sans)", fontWeight: 800, fontSize: "clamp(.58rem,.82vw,.76rem)", letterSpacing: ".02em" }, "span"),
            text(`${id}-contact-linkedin`, "DM · linkedin.com/in/bode-chris", { color: "rgba(255,255,255,.86)", fontFamily: "var(--xp-font-display-sans)", fontWeight: 800, fontSize: "clamp(.58rem,.82vw,.76rem)", letterSpacing: ".02em" }, "span"),
          ], { gap: ".18rem", alignItems: "flex-end" }),
        ], { gridTemplateColumns: "1fr auto", alignItems: "end", gap: "1rem" }),
      ], { position: "absolute", inset: "7%", zIndex: 3, justifyContent: "space-between" }),
      text(`${id}-ghost`, "01", { position: "absolute", right: "2%", bottom: "-7%", color: "rgba(255,255,255,.05)", fontFamily: "var(--xp-font-display-sans)", fontWeight: 900, fontSize: "clamp(14rem,29vw,28rem)", lineHeight: .8, zIndex: 2 }, "span"),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#090909" }),
  ]);
}

const hospitalityArt = {
  koraTable: "https://images.unsplash.com/photo-1661312219620-87ec133af79b?auto=format&fit=crop&fm=jpg&q=88&w=2400",
  sundayMarket: "https://images.unsplash.com/photo-1692689383052-9fbf3d1c0969?auto=format&fit=crop&fm=jpg&q=88&w=2400",
};

function hospitalityEditorialPage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  deck: string,
  body: string[],
  tone: Tone,
  imageSrc: string,
  options: { imageSide?: "left" | "right"; quote?: string; meta?: string[] } = {},
): MagazinePageDefinition {
  const ink = tone.ink ?? "#111";
  const imageSide = options.imageSide ?? "right";
  const imageLeft = imageSide === "left";
  return page(issueId, id, headline, "feature", "utility-full", tone.bg, [
    section(`${id}-main`, headline, "main", [
      editorialPhoto(`${id}-photo`, imageSrc, headline, {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: imageLeft ? 0 : "48%",
        right: imageLeft ? "48%" : 0,
        width: "52%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        filter: "contrast(1.03) saturate(.86)",
        zIndex: 1,
      }),
      stack(`${id}-copy`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2, "0")} / ${kicker}`, tone.accent ?? ink),
        text(`${id}-headline`, headline, {
          ...displaySansStyle("clamp(3.1rem,6.1vw,6rem)", ink),
          whiteSpace: "pre-line",
        }, "h2"),
        text(`${id}-deck`, deck, {
          color: ink,
          fontFamily: "var(--xp-font-editorial)",
          fontSize: "clamp(1.05rem,1.75vw,1.65rem)",
          lineHeight: 1.03,
          letterSpacing: "-.035em",
          maxWidth: "26rem",
        }),
        grid(`${id}-body`, body.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, {
          ...editorialBodyStyle(ink),
          fontSize: "clamp(.64rem,.82vw,.82rem)",
          lineHeight: 1.42,
        })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "1rem" }),
        ...(options.meta?.length ? [grid(`${id}-meta-grid`, options.meta.map((item, index) => stack(`${id}-meta-${index}`, [
          label(`${id}-meta-n-${index}`, String(index + 1).padStart(2, "0"), tone.accent ?? ink),
          text(`${id}-meta-t-${index}`, item, { color: ink, fontFamily: "var(--xp-font-grotesk)", fontSize: ".62rem", fontWeight: 760, lineHeight: 1.05 }),
        ], { paddingTop: ".45rem", borderTop: `1px solid ${tone.accent ?? ink}` })), { gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: ".8rem" })] : []),
      ], {
        position: "absolute",
        top: "5%",
        bottom: "5%",
        left: imageLeft ? "55%" : "5%",
        right: imageLeft ? "5%" : "55%",
        zIndex: 3,
        gap: ".8rem",
        justifyContent: "space-between",
      }),
      ...(options.quote ? [stack(`${id}-quote`, [
        label(`${id}-quote-label`, "XPOMAG / THE LINE", ink),
        text(`${id}-quote-text`, options.quote, { color: ink, fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.05rem,1.8vw,1.7rem)", lineHeight: .96, letterSpacing: "-.04em" }, "h3"),
      ], {
        position: "absolute",
        zIndex: 4,
        bottom: "6%",
        left: imageLeft ? "5%" : "55%",
        width: "36%",
        padding: "1rem",
        background: tone.accent ?? "#f5cc28",
        border: `2px solid ${ink}`,
      })] : []),
    ], { background: tone.bg, color: ink, position: "relative", minHeight: "100%", padding: 0 }),
  ]);
}

function fullBleedVenuePage(
  issueId: string,
  pageNo: number,
  id: string,
  kicker: string,
  headline: string,
  body: string[],
  imageSrc: string,
  accent: string,
  sourceText?: string,
): MagazinePageDefinition {
  return page(issueId, id, headline, "feature", "utility-full", "#111", [
    section(`${id}-main`, headline, "main", [
      editorialPhoto(`${id}-photo`, imageSrc, headline, { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.04) saturate(.82)", zIndex: 1 }),
      stack(`${id}-shade`, [], { position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.47) 43%,rgba(0,0,0,.08) 76%)", zIndex: 2 }),
      stack(`${id}-content`, [
        label(`${id}-kicker`, `XPOMAG / ${String(pageNo).padStart(2, "0")} / ${kicker}`, accent),
        text(`${id}-headline`, headline, { ...displaySansStyle("clamp(4rem,8vw,8rem)", "#fff"), whiteSpace: "pre-line" }, "h2"),
        ...body.map((paragraph, index) => text(`${id}-p-${index}`, paragraph, { color: "#fff", fontFamily: "var(--xp-font-editorial-body)", fontSize: "clamp(.7rem,.92vw,.9rem)", lineHeight: 1.48, maxWidth: "28rem" })),
        ...(sourceText ? [source(`${id}-source`, sourceText, true)] : []),
      ], { position: "absolute", zIndex: 3, left: "5.5%", top: "6%", bottom: "6%", width: "42%", gap: ".9rem", justifyContent: "flex-end" }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#111" }),
  ]);
}

function fashionAdvertPage(issueId: string, pageNo: number, id: string, portraitSrc: string): MagazinePageDefinition {
  return page(issueId, id, "Studio Nine", "ad", "utility-full", "#f7a7cf", [
    section(`${id}-ad`, "Studio Nine concept campaign", "main", [
      editorialPhoto(`${id}-portrait`, portraitSrc, "Studio Nine fashion campaign", {
        position: "absolute", left: "0", right: "auto", top: "0", bottom: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center", filter: "grayscale(1) contrast(1.08)", zIndex: 1,
      }),
      stack(`${id}-copy`, [
        label(`${id}-label`, `PAGE ${pageNo} · CONCEPT PLACEMENT`, "#60153d"),
        text(`${id}-brand`, "STUDIO\nNINE", { ...displaySansStyle("clamp(3.2rem,6.1vw,6.2rem)", "#111"), whiteSpace: "pre-line", textShadow: "0 1px 0 rgba(255,255,255,.18)" }, "h2"),
        text(`${id}-line`, "JOHANNESBURG,\nWEAR SOMETHING\nWORTH REMEMBERING.", { color: "#111", fontFamily: "var(--xp-font-editorial)", fontSize: "clamp(1.25rem,2.15vw,2.15rem)", lineHeight: .92, letterSpacing: "-.045em", whiteSpace: "pre-line", maxWidth: "22rem" }, "h3"),
        label(`${id}-season`, "SUMMER 2026 · XPOMAG PARTNER PREVIEW", "#60153d"),
      ], { position: "absolute", left: "4%", top: "4%", bottom: "4%", width: "43%", zIndex: 3, justifyContent: "space-between", padding: "1rem", background: "rgba(247,167,207,.90)", backdropFilter: "blur(6px)", boxShadow: "0 0 0 1px rgba(17,17,17,.08)" }),
    ], { position: "relative", minHeight: "100%", padding: 0, background: "#f7a7cf" }),
  ]);
}

function buildIssuePages(issueId: string, options: DemoMagazineOptions, cover: MagazinePageDefinition): MagazinePageDefinition[] {
  const people = options.alphaCoverAssets ?? [];
  const pages: MagazinePageDefinition[] = [cover];

  pages.push(advertPage(issueId, 2, "inside-front-cover", "NORTH/01", "MOVE\nDIFFERENTLY.", "Made for the city between meetings. Electric mobility for Johannesburg. The first commercial page is treated as a campaign, not a banner.", "#f3cf20", "#0b0b0b"));

  pages.push(portraitFeaturePage(issueId, 3, "rosebank-0642", "OPENING / ROSEBANK", "ROSEBANK,\n06:42", [
    "A Gautrain arrives beneath Oxford Road. Coffee machines are already running. Runners disappear around corners. Delivery vehicles turn into loading bays. Someone unlocks a gallery. Someone else orders their first coffee.",
    "A city does not open all at once. It happens one person at a time. One shutter goes up. One office light appears. One table is set. One train door opens. The neighbourhood becomes itself again.",
  ], art.portraitD, { bg: "#f5f3ed", ink: "#111", accent: "#2e67a0" }, {
    quote: "A CITY DOESN'T OPEN ALL AT ONCE.",
    source: "Gautrain station information · Rosebank station sits beneath Oxford Road opposite The Zone",
    accentBox: "#f3cf20",
  }));

  pages.push(portraitFeaturePage(issueId, 4, "editors-note", "EDITOR'S NOTE", "WHY HERE?\nWHY NOW?", [
    "Rosebank and Sandton are separated by only a few kilometres, but they represent two different versions of Johannesburg. Sandton communicates scale: head offices, hotels, major retail, towers and restaurants built for occasions. Rosebank feels more compressed: offices beside apartments, galleries beside restaurants, a Sunday market on a shopping-centre roof, runners in the streets while commuters emerge from the train.",
    "Together they form something larger than a business node. They are places where people build companies, sell things, meet people, make culture, eat well and construct lives around work. XpoMag is interested in that overlap — not businesses as entries in a directory, but businesses inside the places and communities that make them meaningful. This is Issue 01.",
  ], art.portraitF, { bg: "#f7f6f2", ink: "#111", accent: "#ef5a24" }, {
    quote: "BUSINESS IS MORE INTERESTING WHEN YOU CAN SEE THE CITY AROUND IT.",
    source: "Rosebank Management District precinct information",
    portraitSide: "right",
    accentBox: "#ef5a24",
  }));

  pages.push(fastReadPage(issueId, 5, "issue-in-60", [
    { title: "1.3%", body: "Rosebank Mall's reported vacancy after falling from 2.0% in Hyprop's June 2026 update.", meta: "RETAIL" },
    { title: "KORA", body: "One of Sandton's notable 2026 restaurant arrivals at The Marc.", meta: "FOOD" },
    { title: "ART AFTER WORK", body: "Keyes Art Night keeps the gallery-and-dining precinct active after office hours.", meta: "CULTURE" },
    { title: "RUN THE CITY", body: "Rosebank's public calendar includes recurring social running communities.", meta: "WELLNESS" },
    { title: "SUNDAY ON THE ROOF", body: "Rosebank Sunday Market continues as a long-running weekend ritual.", meta: "COMMUNITY" },
    { title: "NEW NAMES", body: "Recent retail additions include FARO, Wellness Warehouse, Livo, Nuage and Stouti.", meta: "RETAIL" },
    { title: "TWO DISTRICTS", body: "One feels compact and neighbourhood-like. The other feels metropolitan.", meta: "CITY" },
    { title: "64 PAGES", body: "People. Places. Food. Ideas. Property. Culture. Business. One first issue.", meta: "XPOMAG" },
  ]));

  pages.push(pulseEditorialPage(issueId, 6, "pulse-i", "01—04", "12 THINGS\nMOVING THE CITY", [
    { title: "ROSEBANK KEEPS ADDING RETAIL", body: "Rosebank Mall's tenant mix continues to move, with recent additions and upgrades reinforcing the idea that physical retail is evolving rather than disappearing.", tag: "01 · RETAIL" },
    { title: "KORA ARRIVES IN SANDTON", body: "The Marc added another destination restaurant in 2026, combining food, interiors, music and wine in a package designed to make the restaurant itself the occasion.", tag: "02 · FOOD" },
    { title: "ROSEBANK IS RUNNING", body: "Social running is becoming visible city infrastructure: routine, fitness and networking without the formality of a networking event.", tag: "03 · WELLNESS" },
    { title: "ART NIGHT RETURNS", body: "Keyes Art Mile continues to use evening programming to connect galleries, restaurants, design and street-level activity.", tag: "04 · CULTURE" },
  ], { bg: "#eee8de", ink: "#111", accent: "#b93220", muted: "#4d453f" }, art.portraitA));

  pages.push(pulseEditorialPage(issueId, 7, "pulse-ii", "05—08", "THE CITY IS\nCHANGING IN\nSMALL WAYS", [
    { title: "THE MARKET IS STILL HERE", body: "Rosebank Sunday Market remains one of the neighbourhood's recurring community rituals — commerce that feels personal, temporary and human.", tag: "05 · COMMUNITY" },
    { title: "WALKABILITY IS AN ASSET", body: "When retail, offices, apartments, food, art and transport sit close together, every urban improvement multiplies the number of useful connections.", tag: "06 · CITY" },
    { title: "THE OFFICE ISN'T JUST AN OFFICE", body: "Coffee shops, hotel lounges and restaurants increasingly operate as extensions of formal workplaces.", tag: "07 · WORK" },
    { title: "COMMUNITY IS DISTRIBUTION", body: "Run clubs, markets, founder circles, art evenings and local groups already contain the trust many brands try to manufacture from scratch.", tag: "08 · BUSINESS" },
  ], { bg: "#dceaf2", ink: "#111820", accent: "#2f6c8d", muted: "#40535c" }, art.portraitG));

  pages.push(dataPosterPage(issueId, 8, "rosebank-numbers", "ROSEBANK BY THE NUMBERS", [
    { title: "1.3%", body: "Recent reported Rosebank Mall vacancy after a decline from 2.0%.", meta: "RETAIL" },
    { title: "6+", body: "FARO, Wellness Warehouse, Lupis, Livo, Nuage and Stouti were among names reported in recent leasing activity.", meta: "RETAIL MOVES" },
    { title: "3+", body: "Current Rosebank listings include Let the People Run, Benchwarmers and The Pack Running.", meta: "RUN COMMUNITIES" },
    { title: "1", body: "The Sunday Market continues above Rosebank Mall, bringing another type of commerce into the precinct.", meta: "ROOFTOP MARKET" },
    { title: "1", body: "A transport anchor beneath Oxford Road connecting the district to Sandton and the wider city.", meta: "GAUTRAIN STATION" },
    { title: "DENSITY", body: "Work, food, transport, art and shopping overlap within a compact radius.", meta: "THE REAL STORY" },
  ]));

  pages.push(signalPosterPage(issueId, 9, "sandton-signals", [
    { title: "BUSINESS", body: "Major offices, banks, hotels and conference infrastructure keep the district synonymous with Johannesburg's corporate economy." },
    { title: "HOSPITALITY", body: "Hotels and restaurants increasingly blur work, entertainment, meetings and city life." },
    { title: "RETAIL", body: "Sandton's retail ecosystem spans everyday and luxury shopping at unusual scale." },
    { title: "EXPERIENCE", body: "Increasingly the product isn't simply eat, shop or stay. It is: go there." },
  ], art.portraitE));

  pages.push(districtEssayPage(issueId, 10, "two-districts-i", "ROSEBANK", "CLOSE", [
    "Rosebank rewards compression. A person can leave a train, buy coffee, attend a meeting, walk to lunch, visit a gallery, browse a shop and meet someone for drinks without travelling very far.",
    "Its advantage is not that everything is tiny. It is that many different activities can happen within the same mental map. The neighbourhood feels legible. One place introduces you to the next.",
  ], art.portraitB, "#f0e7dc", "#c33e22"));

  pages.push(districtEssayPage(issueId, 11, "two-districts-ii", "SANDTON", "BIG", [
    "Sandton communicates scale differently: corporate headquarters, major hotels, destination retail, large developments and restaurants built to host occasions.",
    "But the trajectories increasingly overlap. Rosebank is becoming more commercially ambitious. Sandton is becoming more experiential. Both are learning that a business district needs reasons to remain after work, reasons to arrive on Saturday and reasons to come back.",
  ], art.portraitE, "#dfe8f3", "#3157ff"));

  pages.push(imageAdvertPage(issueId, 12, "ad-arc-south", "ARC SOUTH", "CAPITAL SHOULD MOVE AS FAST AS AMBITION.", "Private banking for builders. A fictional premium financial-services campaign demonstrating a full-page interruption between city essay and cover story.", "#17233f", "#ffffff", art.portraitC));

  pages.push(fullBleedEditorialPage(issueId, 13, "power-corridor-i", "COVER STORY / I", "THE NEW POWER CORRIDOR", "Between Rosebank and Sandton, Johannesburg is building a new kind of city centre — less a single CBD than a chain of connected rooms.", [
    "The traditional business district had a predictable rhythm: arrive, work, leave. Everything surrounding the office was infrastructure supporting the office.",
    "The new model reverses some of that relationship. The café becomes the meeting room. The hotel lobby becomes a workplace. The restaurant becomes where deals happen. The gallery becomes a reason to stay.",
  ], art.portraitF, { bg: "#e7ff62", ink: "#151515", accent: "#3157ff" }, { imageSide: "right", quote: "THE CITY IS NO LONGER ONLY WHERE YOU WORK.", labelText: "ROSEBANK ↔ SANDTON" }));

  pages.push(fullBleedEditorialPage(issueId, 14, "power-corridor-ii", "COVER STORY / II", "ROSEBANK'S ADVANTAGE", "Proximity is not a side effect here. It is the product.", [
    "Rosebank's strength is proximity. Professionals, restaurants, shops, art and lifestyle uses sit close enough to continuously introduce people to one another.",
    "You went for lunch and saw a store. You attended an exhibition and found a restaurant. You came for a meeting and stayed. Accidental discovery becomes an economic feature.",
  ], art.portraitD, { bg: "#cfe2d2", ink: "#122318", accent: "#3b6d45" }, { imageSide: "left", quote: "ACCIDENTAL DISCOVERY IS AN ECONOMIC FEATURE.", labelText: "CLOSE / WALKABLE / MIXED" }));

  pages.push(fullBleedEditorialPage(issueId, 15, "power-corridor-iii", "COVER STORY / III", "SANDTON'S ADVANTAGE", "Scale creates choice. Choice creates gravity.", [
    "Sandton operates at a different scale: offices, hotels, conference venues, retailers and restaurants stack into a district that can absorb many different reasons to arrive.",
    "The strongest future may belong to the corridor between both models: a visitor moving from a Rosebank gallery to a Sandton meeting, from Sandton lunch to Rosebank drinks, from a hotel to an exhibition.",
  ], art.portraitE, { bg: "#22283b", ink: "#ffffff", accent: "#d8ff52", muted: "#d1d4df" }, { imageSide: "right", quote: "THE CITY IS THE NETWORK OF PLACES YOU MOVE THROUGH.", labelText: "SCALE / GRAVITY / OCCASION" }));

  pages.push(editorialMosaicPage(issueId, 16, "people-i", "THE PEOPLE / I", "PEOPLE MAKE PLACES", [
    { title: "THE RESTAURATEUR", body: "Builds reasons to stay after work. Turns a meal into a destination, a room into a memory and regular customers into community.", image: art.portraitB, meta: "01 · HOSPITALITY" },
    { title: "THE GALLERIST", body: "Turns culture into city infrastructure. Creates reasons to wander without a shopping list and to stay without a transaction in mind.", image: art.portraitD, meta: "02 · CULTURE" },
    { title: "THE RETAILER", body: "Makes local brands physically visible and gives discovery a texture that a browser tab cannot reproduce.", image: art.portraitG, meta: "03 · RETAIL" },
    { title: "THE PROPERTY BUILDER", body: "Designs the spaces where all these communities collide — deliberately or accidentally — and determines what sits next to what.", image: art.portraitC, meta: "04 · PLACE" },
  ], { bg: "#f0c5d3", ink: "#241019", accent: "#8d2949" }));

  pages.push(editorialMosaicPage(issueId, 17, "people-ii", "THE PEOPLE / II", "THE PEOPLE BEHIND THE PLACES", [
    { title: "THE RUN-CLUB ORGANISER", body: "Builds community without calling it networking. People arrive for movement and return for familiarity.", image: art.portraitB, meta: "05 · COMMUNITY" },
    { title: "THE HOTELIER", body: "Turns transient visitors into neighbourhood participants through food, events, meetings and wellness.", image: art.portraitA, meta: "06 · HOSPITALITY" },
    { title: "THE DESIGNER", body: "Gives businesses a visual identity people recognise before they have read a single word.", image: art.portraitD, meta: "07 · DESIGN" },
    { title: "THE FOUNDER", body: "Chooses where to build, whom to hire, where to meet customers and which local ecosystem becomes part of the company story.", image: art.portraitF, meta: "08 · BUSINESS" },
  ], { bg: "#c8d7ee", ink: "#131b2c", accent: "#3157ff" }));

  pages.push(fullBleedEditorialPage(issueId, 18, "sponsored-formroom-i", "SPONSORED STORY · CONCEPT", "BUILD WHERE PEOPLE ALREADY ARE", "FORM/ROOM is a fictional Rosebank workspace brand showing how paid storytelling can still feel genuinely editorial.", [
    "FORM/ROOM begins with a simple question: why do flexible workplaces still feel temporary? The concept company designs compact work lounges for independent teams that want flexibility without the anonymous feel of a hot desk.",
    "The founder chooses Rosebank because the value proposition extends beyond the workspace itself. Transport, food, meetings, fitness and culture already exist around the front door.",
  ], art.portraitG, { bg: "#f1e7da", ink: "#20160f", accent: "#9a5c31" }, { imageSide: "right", quote: "A WORKSPACE IS ALSO A ROUTE THROUGH THE CITY.", labelText: "PAID PARTNER STORY · CLEARLY LABELLED" }));

  pages.push(fullBleedEditorialPage(issueId, 19, "sponsored-formroom-ii", "SPONSORED STORY · CONCEPT", "THE ROUTE IS PART OF THE PRODUCT", "The story continues beyond the workspace: where the founder meets, eats, moves and decompresses becomes part of the brand narrative.", [
    "A useful sponsored profile should contain decisions, lessons, places, products and ideas worth saving. It can explain why a location was chosen, how first customers arrived and what changed after launch.",
    "XpoMag should label the commercial relationship unmistakably while still giving the reader something they would have wanted to know anyway.",
  ], art.portraitC, { bg: "#efe3cd", ink: "#24170d", accent: "#98521f" }, { imageSide: "left", quote: "SPONSORED DOESN'T HAVE TO MEAN BORING.", labelText: "ORIGIN / FIRST CUSTOMERS / ROUTINE / PLACES" }));

  pages.push(routeTimelinePage(issueId, 20, "working-day", "08:00 → 20:30", [
    { time: "08:00", place: "ROSEBANK", body: "Coffee before the first call." },
    { time: "09:00", place: "OXFORD ROAD", body: "Client meeting. The formal workday begins." },
    { time: "10:30", place: "GAUTRAIN", body: "Move north. Transition becomes part of the working rhythm." },
    { time: "11:00", place: "SANDTON", body: "Presentation — office tower, hotel meeting room or client floor." },
    { time: "13:00", place: "LUNCH", body: "A meal that is still half meeting." },
    { time: "14:30", place: "LOBBY", body: "Emails between appointments. Hospitality becomes workplace." },
    { time: "17:30", place: "RUN CLUB", body: "The workday dissolves into community." },
    { time: "19:00", place: "DINNER", body: "The same district becomes social infrastructure." },
  ], { bg: "#f4efe7", ink: "#151515", accent: "#3157ff" }, art.portraitB));

  pages.push(utilityGridPage(issueId, 21, "meeting-guide", "CITY UTILITY", "NOT EVERY MEETING NEEDS A BOARDROOM", [
    { title: "THE QUICK COFFEE", body: "Twenty useful minutes before everyone moves again." },
    { title: "THE QUIET ONE-TO-ONE", body: "Low noise, comfortable seating and enough privacy to think." },
    { title: "THE LUNCH THAT MATTERS", body: "Service good enough not to interrupt the conversation." },
    { title: "THE LAPTOP AFTERNOON", body: "Power, connectivity and permission to stay." },
    { title: "THE VISITOR FROM OUT OF TOWN", body: "Easy to find, easy to reach, easy to explain." },
    { title: "THE GROUP BRAINSTORM", body: "Space to spread out without becoming the room everyone hates." },
    { title: "THE AFTER-HOURS MEETING", body: "Where formality can soften without the conversation ending." },
    { title: "THE 'LET'S KEEP TALKING' DRINK", body: "Often the most productive hour was never on the calendar." },
  ], { bg: "#d9e6ef", ink: "#15212a", accent: "#3157ff" }));

  pages.push(placesGridPage(issueId, 22, "places-i", "THE STARTER LIST / I", "20 PLACES WORTH KNOWING", [
    { title: "KEYES ART MILE", body: "Rosebank's art-and-design cluster: galleries, architecture, restaurants and event programming.", meta: "SEE" },
    { title: "CIRCA", body: "An architectural and exhibition destination beside Everard Read.", meta: "ART" },
    { title: "EVERARD READ", body: "A major anchor in Rosebank's gallery ecosystem.", meta: "ART" },
    { title: "BKhz", body: "Contemporary gallery programming within the Keyes ecosystem.", meta: "ART" },
    { title: "GOODMAN GALLERY", body: "A significant contemporary-art presence in the broader Rosebank area.", meta: "ART" },
    { title: "DAVID KRUT", body: "Print, publishing and contemporary art within the neighbourhood's cultural orbit.", meta: "ART" },
    { title: "ROSEBANK SUNDAY MARKET", body: "Weekend rooftop market with makers, food and local discovery.", meta: "WEEKEND" },
    { title: "ROSEBANK MALL", body: "One of the district's primary retail anchors and a lens into changing tenant mix.", meta: "SHOP" },
    { title: "THE ZONE @ ROSEBANK", body: "A high-traffic node directly opposite the Gautrain station.", meta: "MEET" },
    { title: "ROSEBANK GAUTRAIN", body: "The transport link that makes the two-district issue work in real life.", meta: "MOVE" },
  ], { bg: "#e7d6b3", ink: "#211b11", accent: "#7a5425" }, art.portraitF));

  pages.push(placesGridPage(issueId, 23, "places-ii", "THE STARTER LIST / II", "10 MORE PLACES TO EXPLORE", [
    { title: "KORA", body: "A 2026 Sandton restaurant arrival at The Marc.", meta: "EAT" },
    { title: "THE MARC", body: "Office, retail and hospitality within Sandton's weekday flow.", meta: "WORK + EAT" },
    { title: "SANDTON CITY", body: "A retail ecosystem operating at a scale few Johannesburg nodes can match.", meta: "SHOP" },
    { title: "SANDTON GAUTRAIN", body: "A transport anchor inside the commercial core.", meta: "MOVE" },
    { title: "THE MASLOW", body: "Hotel, dining and event programming within Sandton.", meta: "STAY" },
    { title: "ART&ABOUT · 8 MERCHANT PLACE", body: "A current exhibition venue in Sandton's corporate landscape.", meta: "SEE" },
    { title: "QLounge", body: "Rosebank dining with a 2026 menu refresh.", meta: "EAT" },
    { title: "NINE YARDS", body: "A newer mixed-use Rosebank precinct built around greenery, food and public space.", meta: "LINGER" },
    { title: "OXFORD ROAD", body: "The connector running through the everyday logic of both work and movement.", meta: "CITY" },
    { title: "YOUR NEXT DISCOVERY", body: "The reader-submitted place that earns its way into Issue 02.", meta: "COMMUNITY" },
  ], { bg: "#d8c7ed", ink: "#21172b", accent: "#6d3b9a" }, art.portraitD));

  pages.push(imageAdvertPage(issueId, 24, "ad-common-place", "COMMON/PLACE", "YOUR NEXT OFFICE SHOULD HAVE A NEIGHBOURHOOD.", "Workspaces for teams that want more than four walls. A fictional property campaign designed to show a full-page commercial break at editorial quality.", "#ff694f", "#101010", art.portraitE));

  pages.push(hospitalityEditorialPage(issueId, 25, "new-table-i", "FOOD / I", "THE NEW\nTABLE", "Restaurants are becoming media — and the room is part of the product.", [
    "People photograph restaurants, tag them, meet there, celebrate there, work there and return because of how the room made them feel.",
    "Food still matters most. But service, architecture, lighting, music, identity and shareability now shape whether a restaurant earns the trip.",
  ], { bg: "#f0d9cc", ink: "#2a1510", accent: "#b3452b" }, hospitalityArt.koraTable, { quote: "THE MEAL IS THE PRODUCT. THE EXPERIENCE IS THE DISTRIBUTION.", meta: ["FOOD", "ROOM", "MUSIC", "MEMORY"] }));

  pages.push(hospitalityEditorialPage(issueId, 26, "new-table-ii", "FOOD / II", "FROM PLACE\nTO OCCASION", "The city now asks more of a restaurant than whether the plate is good.", [
    "Do I want to be there? Do I want to bring someone? Does the room make a Tuesday night feel different?",
    "Destination restaurants answer by treating arrival, soundtrack, service, interiors and after-dinner rhythm as part of the product rather than decoration around it.",
  ], { bg: "#221a15", ink: "#fff", accent: "#f0aa65" }, hospitalityArt.koraTable, { imageSide: "left", quote: "DO I WANT TO BE THERE?", meta: ["ARRIVAL", "SERVICE", "SOUND", "AFTER DARK"] }));

  pages.push(hospitalityEditorialPage(issueId, 27, "new-table-iii", "FOOD / III", "THE CITY EATS\nDIFFERENTLY NOW", "Rosebank and Sandton are two versions of the same hospitality shift.", [
    "Rosebank's dining ecosystem sits close to art, retail and neighbourhood movement. Sandton often operates at a larger, more occasion-driven scale.",
    "What connects them is the expectation that a physical experience should give people something delivery cannot reproduce: atmosphere, encounter and memory.",
  ], { bg: "#dfead1", ink: "#192515", accent: "#4d6d39" }, art.portraitD, { quote: "THE PHYSICAL EXPERIENCE HAS TO EARN THE TRIP.", meta: ["ROSEBANK", "SANDTON", "DINNER", "DISCOVERY"] }));

  pages.push(fullBleedVenuePage(issueId, 28, "kora", "NEW IN SANDTON", "KORA", [
    "KORA at The Marc positions dining as a full evening: considered plates, warm interiors, live sound and a reason to stay beyond the meal.",
    "The wider signal matters as much as the venue itself: in Sandton, hospitality is increasingly competing on the total night, not one transaction.",
  ], hospitalityArt.koraTable, "#f6b25f", "KORA official site + Time Out Johannesburg · 2026"));

  pages.push(hospitalityEditorialPage(issueId, 29, "qlounge", "ROSEBANK / MENU REFRESH", "QLOUNGE", "A mature hospitality brand does not always need reinvention. Sometimes it needs a sharper next chapter.", [
    "QLounge Wine Restaurant & Qsushi Bar expanded its menu in 2026 while keeping established favourites — an example of evolving without making regulars relearn the place.",
    "The venue positions itself around wine, food, meetings and late-day energy, giving it multiple reasons to exist across the same day.",
  ], { bg: "#1f382f", ink: "#fff", accent: "#d7ad55" }, art.portraitG, { imageSide: "left", quote: "EVOLVE WITHOUT ERASING FAMILIARITY.", meta: ["WINE", "MENU", "MEETINGS", "EVENING"] }));

  pages.push(listPage(issueId, 30, "perfect-saturday", "WEEKEND / ITINERARY", "ONE PERFECT SATURDAY", [
    { title: "09:00 · COFFEE", body: "Begin in Rosebank before the district gets loud. Sit somewhere with a view of people arriving." },
    { title: "10:00 · WALK", body: "Move without a shopping list. Let the street tell you what has changed." },
    { title: "11:00 · GALLERIES", body: "Give yourself enough time to look rather than simply check in." },
    { title: "13:00 · LONG LUNCH", body: "Choose a table that makes nobody look at the clock." },
    { title: "15:00 · RETAIL", body: "Browse fashion, design, books or local products you can touch." },
    { title: "16:30 · MOVE NORTH", body: "Shift the mood by moving into Sandton for the second half of the day." },
    { title: "18:00 · DRINK", body: "Let the pace change. Stay long enough for the room to become different." },
    { title: "19:30 · DINNER", body: "Finish somewhere that feels like the reason you left home." },
  ], { bg: "#e9db52", ink: "#1c1b0c", accent: "#8c4a1d", muted: "#4b4719" }, "Don't plan too much. The best city days need one or two gaps for discovery."));

  pages.push(fullBleedVenuePage(issueId, 31, "sunday-market", "ROSEBANK / WEEKEND", "SUNDAY\nON THE ROOF", [
    "Rosebank Sunday Market remains one of the neighbourhood's recurring weekend rituals, bringing makers, shoppers and food into the same temporary marketplace.",
    "Markets make commerce feel personal: a table, a maker, an object and a conversation. That unpredictability is part of the attraction.",
  ], hospitalityArt.sundayMarket, "#f3c730", "Rosebank Sunday Market · public listing"));

  pages.push(hospitalityEditorialPage(issueId, 32, "sponsored-house44-i", "SPONSORED STORY · CONCEPT", "THE HOTEL IS NO LONGER\nJUST FOR TRAVELLERS", "HOUSE/44 is a fictional partner story showing how hospitality can become neighbourhood infrastructure.", [
    "A modern city hotel can be restaurant, meeting room, remote office, spa, event venue and social space — creating reasons for local people to enter a building they may never sleep in.",
    "The partner story follows one complete day through those uses, turning a sponsor placement into useful editorial rather than a generic advert.",
  ], { bg: "#d9d1c3", ink: "#1d1914", accent: "#755f43" }, art.portraitE, { quote: "THE BUILDING BECOMES MORE VALUABLE WHEN LOCALS FEEL INVITED IN.", meta: ["MEET", "WORK", "RESET", "DINNER"] }));

  pages.push(hospitalityEditorialPage(issueId, 33, "sponsored-house44-ii", "SPONSORED STORY · CONCEPT", "HOSPITALITY AS\nCITY INFRASTRUCTURE", "The useful question is larger than the hotel: why are these spaces increasingly relevant to people who live ten minutes away?", [
    "People need somewhere to meet, wait, eat, work, reset and celebrate. The hotel already contains many of those rooms.",
    "The opportunity is to make locals feel invited into them — and to make every room carry a reason to return.",
  ], { bg: "#ebe4d8", ink: "#211b15", accent: "#916b3f" }, art.portraitB, { imageSide: "left", quote: "A HOTEL CAN BELONG TO THE NEIGHBOURHOOD EVEN WHEN YOU NEVER STAY THE NIGHT.", meta: ["LOBBY", "TABLE", "SPA", "EVENT"] }));

  pages.push(fashionAdvertPage(issueId, 34, "ad-studio-nine", "/resources/images-with-alpha/lady-in-ankara-1.webp"));

  pages.push(culturePosterPage(issueId, 35, "rosebank-art-i", "DESIGN + CULTURE / I", "ART DOES\nSOMETHING\nRETAIL CAN\'T", "It gives people permission to wander.", [
    "Keyes Art Mile deliberately combines galleries, design, restaurants and urban activity. The broader Rosebank area extends that cultural ecosystem into surrounding streets.",
    "The commercial effect is subtle but important: people arrive without a shopping list. They look, walk, talk, eat, drink, discover and stay. Culture creates footfall without needing to describe itself that way.",
  ], { bg: "#d7e6f5", ink: "#111820", accent: "#3157ff" }, "/resources/images-with-alpha/african-woman-with-head-tie-1.webp", { quote: "CULTURE CAN BE ECONOMIC INFRASTRUCTURE.", note: "KEYES / CIRCA / BKhz / EVERARD READ" }));

  pages.push(culturePosterPage(issueId, 36, "rosebank-art-ii", "DESIGN + CULTURE / II", "THE VALUE\nOF WANDERING", "Looking can be the entire purpose.", [
    "Retail usually begins with intent: a shirt, a meal, a gift, a service. Art changes the rhythm because looking itself can be enough reason to arrive.",
    "That slower behaviour matters to a district. A person who wanders is available to be surprised. Gallery, café, store, restaurant and street begin to read as one connected experience.",
  ], { bg: "#f2e7cc", ink: "#241b0d", accent: "#d09a00" }, "/resources/images-with-alpha/man-with-dreadlocks-smiling-1.webp", { imageSide: "left", quote: "A PERSON WHO WANDERS IS AVAILABLE TO BE SURPRISED.", note: "LOOK / WALK / DISCOVER / STAY" }));

  pages.push(culturePosterPage(issueId, 37, "rosebank-art-iii", "DESIGN + CULTURE / III", "WHEN A\nPRECINCT\nBECOMES\nA HABIT", "The goal is not one event. It is repeat behaviour.", [
    "The strongest cultural districts are not visited only for openings. They become part of the ordinary mental map: somewhere to take a visitor, start a Saturday, meet after work or discover what changed.",
    "That is the deeper opportunity for Rosebank. Art is not merely a category inside the neighbourhood; it can be one of the reasons the neighbourhood keeps being chosen.",
  ], { bg: "#171415", ink: "#fff", accent: "#e9ff58" }, "/resources/images-with-alpha/lady-in-gele-1.webp", { quote: "THE GOAL IS NOT ONE EVENT. IT'S REPEAT BEHAVIOUR.", note: "ART NIGHT / SATURDAY / VISITORS / ROUTINE" }));

  pages.push(cultureGuidePage(issueId, 38, "keyes-guide", "START HERE", [
    { title: "EVERARD READ", body: "A long-standing gallery institution and one of the precinct's anchors.", meta: "GALLERY" },
    { title: "CIRCA", body: "Art and architecture in one of Rosebank's most recognisable cultural buildings.", meta: "GALLERY + BUILDING" },
    { title: "BKhz", body: "Contemporary programming and a distinct curatorial voice.", meta: "GALLERY" },
    { title: "ORIGIN ART", body: "Part of the wider Keyes creative mix.", meta: "GALLERY" },
    { title: "THE ATRIUM", body: "A flexible gathering and event space within the precinct.", meta: "EVENTS" },
    { title: "FOOD + DRINK", body: "Culture and hospitality sit close enough to form one complete afternoon or evening.", meta: "STAY LONGER" },
  ], "/resources/images-with-alpha/young-man-in-glasses-1.webp"));

  pages.push(notebookCulturePage(issueId, 39, "looking-at", [
    { title: "ONE EXHIBITION", body: "Women Making Their Mark at Art&About, 8 Merchant Place — a major women-artists exhibition running into November." },
    { title: "ONE BUILDING", body: "CIRCA — because the building itself is part of the cultural experience." },
    { title: "ONE MATERIAL", body: "Concrete, glass, stone, planted edges and the softening effect of vegetation." },
    { title: "ONE DETAIL", body: "The thing you almost walked past. XpoMag wants to make small city discoveries worth saving." },
  ], "/resources/images-with-alpha/corporate-african-lady-smiling-1.webp"));

  pages.push(afterHoursFeaturePage(issueId, 40, "after-five-i", "DON\'T GO\nHOME YET", [
    "Five o'clock changes the function of the city. The meeting ends. Tables fill. Lights become warmer. Music gets louder. People who were rushing begin staying.",
    "Rosebank's evening rhythm increasingly mixes art, dining and social running. Sandton layers in hotels, destination restaurants, event programming and retail. The office district becomes something else without moving anywhere.",
  ], "/resources/images-with-alpha/dark-lady-in-dreads-smiling-1.webp"));

  pages.push(afterHoursModesPage(issueId, 41, "after-five-ii", [
    { title: "MOVE", body: "Run. Walk. Let the streets become social rather than transitional." },
    { title: "LOOK", body: "Gallery openings and cultural programming slow the neighbourhood down." },
    { title: "MEET", body: "The drink after work is often where formality finally disappears." },
    { title: "STAY", body: "Dinner gives the district an economy after office towers stop being the main attraction." },
  ], "/resources/images-with-alpha/corporate-man-full-mid-shot-1.webp"));

  pages.push(afterWorkAdvertPage(issueId, 42, "ad-after-work", "/resources/images-with-alpha/lady-in-ankara-1.webp"));

  pages.push(propertyFeaturePage(issueId, 43, "mixed-use-i", "PROPERTY / I", "THE BEST\nAMENITY MAY BE\nEVERYTHING\nNEXT DOOR", "Mixed-use changes what a building can borrow from its neighbourhood.", [
    "The old development model separates: work here, live there, shop somewhere else, drive between them. Mixed-use districts compress those behaviours and reduce the friction between them.",
    "That compression creates convenience, but it also creates more commercial encounters. A café, gallery, gym, hotel or store benefits from the fact that people already have multiple reasons to be nearby.",
  ], { bg: "#d7dfce", ink: "#182016", accent: "#7f9a72" }, "/resources/images-with-alpha/corporate-man-full-mid-shot-1.webp", { quote: "THE NETWORK AROUND THE FRONT DOOR CAN BE PART OF THE PROPERTY VALUE.", stat: "5 MIN", statLabel: "THE RADIUS THAT CHANGES DAILY BEHAVIOUR" }));

  pages.push(propertyFeaturePage(issueId, 44, "mixed-use-ii", "PROPERTY / II", "WHAT'S AROUND\nTHE FRONT\nDOOR?", "The unofficial amenity list may matter as much as the official one.", [
    "A building can have beautiful finishes and still sit inside a weak daily experience. The reverse is also true: a straightforward building can become dramatically more useful when everything needed sits within a short radius.",
    "Transport, food, wellness, shops, public space, hospitality and culture become part of the amenity mix — even when none of them appear inside the lease.",
  ], { bg: "#eee8dc", ink: "#221d15", accent: "#c18a42" }, "/resources/images-with-alpha/corporate-african-lady-smiling-1.webp", { imageSide: "left", quote: "YOU DON'T ONLY OCCUPY A BUILDING. YOU OCCUPY ITS CONTEXT." }));

  pages.push(propertyFeaturePage(issueId, 45, "mixed-use-iii", "PROPERTY / III", "THE CITY AS\nA SHARED\nLOBBY", "The most valuable space may be the space between the buildings.", [
    "The most interesting mixed-use districts make public space feel like the shared lobby between many separate businesses. The café serves the office. The gallery serves the restaurant. The transport link serves them all.",
    "That is why public-realm improvements, walkability and programming matter commercially. They improve the connective tissue rather than one tenant's box.",
  ], { bg: "#c5d7de", ink: "#132129", accent: "#4f8ea3" }, "/resources/images-with-alpha/young-corporate-man-2.webp", { quote: "GOOD DISTRICTS CREATE VALUE BETWEEN THE BUILDINGS.", stat: "1 CITY", statLabel: "MANY FRONT DOORS" }));

  pages.push(retailDataPage(issueId, 46, "rosebank-retail", "LOW VACANCY. NEW NAMES.", "/resources/images-with-alpha/lady-smiling-3.webp"));

  pages.push(propertyFeaturePage(issueId, 47, "sandton-scale", "PROPERTY / SANDTON", "SOMETIMES\nBIG IS\nTHE POINT", "Scale can be infrastructure when choice and concentration matter.", [
    "Sandton's defining advantage remains concentration: hotels, retail, professional services, offices, restaurants, conference infrastructure and transport inside a major commercial node.",
    "Scale can feel impersonal, but it can also feel useful. When the question is where can we host this, where can the visitor stay, or where can we find everything in one trip, bigness becomes a feature.",
  ], { bg: "#26314a", ink: "#fff", accent: "#96b5ff" }, "/resources/images-with-alpha/older-corporate-man-1.webp", { imageSide: "left", quote: "DENSITY CAN FEEL INTIMATE. SCALE CAN FEEL USEFUL." }));

  pages.push(sponsoredPropertyPage(issueId, 48, "sponsored-fieldwork-i", "THE FUTURE OF\nWORK HAS A\nFRONT DOOR", "FIELDWORK is a fictional commercial-real-estate partner used to demonstrate a sponsored story about behaviour rather than square metres.", [
    "The concept follows a company moving from a large conventional office into a smaller headquarters surrounded by shared amenities, meeting rooms, hospitality and transport.",
    "The story asks a better property question: what does a team actually need the office to do now? Culture, collaboration and identity may matter more than giving every person a permanent desk.",
  ], "/resources/images-with-alpha/corporate-lady-smiling-5.webp", { quote: "THE OFFICE IS BECOMING A FRONT DOOR INTO A LARGER WORKPLACE." }));

  pages.push(sponsoredPropertyPage(issueId, 49, "sponsored-fieldwork-ii", "SMALLER OFFICE.\nBIGGER\nNEIGHBOURHOOD.", "A modern workspace can outsource some of its value to the city around it.", [
    "Lunch downstairs. Client meetings in a hotel. A run club after work. Transport nearby. Culture within walking distance. These things become part of the work environment even when the employer does not own them.",
    "That does not make the office less important. It makes location more important. The office becomes a gateway into a network rather than a self-contained island.",
  ], "/resources/images-with-alpha/corporate-man-posing-1.webp", { reversed: true, quote: "THE OFFICE CAN GET SMALLER WHILE THE WORKPLACE GETS BIGGER." }));

  pages.push(propertyAdvertPage(issueId, 50, "ad-fieldwork", "/resources/images-with-alpha/young-corporate-man-4.webp"));

  pages.push(wellnessFeaturePage(issueId, 51, "wellness-i", "WELLNESS / I", "FITNESS FOUND\nA SOCIAL LIFE", "Running is becoming a city ritual — part exercise, part repeated social infrastructure.", [
    "Rosebank's public calendar includes recurring social running groups whose value goes beyond kilometres and pace. They create a dependable weekly reason for people to arrive, move together and see the precinct at street level.",
    "The useful sequence is simple: routine creates familiarity; familiarity creates community; community creates identity. People may join for the run, but many return because the group starts feeling like part of their city life.",
  ], "/resources/images-with-alpha/young-man-laughing-2.webp", { bg: "#d3efcf", ink: "#132415", accent: "#3d7a45" }, { quote: "PEOPLE JOIN FOR THE RUN. THEY RETURN FOR THE PEOPLE.", metric: "3×", metricLabel: "RECURRING RUN COMMUNITIES IN THIS ISSUE" }));

  pages.push(wellnessFeaturePage(issueId, 52, "wellness-ii", "WELLNESS / II", "COMMUNITY\nWITHOUT A\nMEMBERSHIP DECK", "The strongest local communities often form around behaviour first and branding second.", [
    "The most compelling thing about social fitness communities is that they do not begin by explaining community. They begin by doing something together repeatedly — then identity appears around the habit.",
    "For cafés, wellness brands and retailers, that offers a useful lesson. Sponsorship works best when it helps the ritual instead of trying to become the ritual. Water, coffee, recovery, meeting space and useful perks can fit naturally around the behaviour.",
  ], "/resources/images-with-alpha/lady-happy-vibes-1.webp", { bg: "#f0ecd2", ink: "#232112", accent: "#7c7a25" }, { imageSide: "left", quote: "BEHAVIOUR FIRST. BRANDING SECOND.", metric: "WEEKLY", metricLabel: "THE CADENCE THAT TURNS STRANGERS INTO REGULARS" }));

  pages.push(runClubPage(issueId, 53, "rosebank-runs", "/resources/images-with-alpha/young-man-posing-8.webp"));

  pages.push(itineraryPage(issueId, 54, "48-hours", "/resources/images-with-alpha/couples-playing-1.webp"));

  pages.push(weekendPosterPage(issueId, 55, "weekend-list", "/resources/images-with-alpha/happy-vibes-2.webp"));

  pages.push(eventsCalendarPage(issueId, 56, "november-events", "/resources/images-with-alpha/corporate-lady-smiling-3.webp"));

  pages.push(xpomag12Page(issueId, 57, "xpomag-12", "/resources/images-with-alpha/man-with-dreadlocks-smiling-1.webp"));

  pages.push(threadAdvertPage(issueId, 58, "ad-thread", "/resources/images-with-alpha/young-corporate-man-3.webp"));

  pages.push(interviewFinalePage(issueId, 59, "five-questions", "/resources/images-with-alpha/beautiful-corporate-lady-1.webp"));

  pages.push(madeHereFinalePage(issueId, 60, "made-here", "/resources/images-with-alpha/lady-in-gele-1.webp"));

  pages.push(issueIndexFinalePage(issueId, 61, "issue-index"));

  pages.push(communityFinalePage(issueId, 62, "next-issue", "/resources/images-with-alpha/man-with-dreadlocks-smiling-1.webp"));

  pages.push(insideBackCoverFinalePage(issueId, 63, "inside-back-cover", "/resources/images-with-alpha/young-corporate-man-4.webp"));

  pages.push(backCoverFinalePage(issueId, 64, "back-cover"));

  return pages;
}

export function selectDemoMagazine(city: string, options: DemoMagazineOptions = {}): DemoMagazineIssue {
  const requestedCity = city.trim() || "Johannesburg";
  const editionCity = /johannesburg|rosebank|sandton/i.test(requestedCity) ? "Rosebank + Sandton" : requestedCity;
  const slugCity = /johannesburg|rosebank|sandton/i.test(requestedCity)
    ? "johannesburg"
    : requestedCity.toLowerCase().replace(/\s+/g, "-");
  const issueId = `demo-${slugCity}-001`;
  const portraitSrc = options.alphaCoverAssets?.find((src) => src.includes("corporate-african-lady-smiling-1"))
    ?? options.alphaCoverAssets?.find((src) => src.includes("african-man-in-bead-chain"))
    ?? options.alphaCoverAssets?.[0];
  const coverDocument = withCoverStoryLinks(
    options.coverDocument ?? createDemoCoverDocument({ city: editionCity, portraitSrc }),
  );

  const cover: MagazinePageDefinition = {
    id: "cover",
    issueId,
    slug: "cover",
    title: "Cover · The City Is Open",
    kind: "cover",
    access: "public",
    layoutId: "utility-full",
    background: background("cover", "#d9ddd8"),
    resources: {
      fonts: [],
      images: portraitSrc
        ? [{ id: "cover-subject", src: portraitSrc, alt: "Featured XpoMag cover subject", preload: true, fetchPriority: "high" }]
        : [],
      styles: [],
    },
    styles: {},
    sections: [{
      id: "cover-composition",
      slug: "cover-composition",
      title: "Cover composition",
      kind: "cover-composition",
      slot: "main",
      resources: { fonts: [], images: [], styles: [] },
      engagement: { reactions: false, comments: false, share: false, save: false },
      style: { position: "relative", zIndex: 2, width: "100%", height: "100%", overflow: "hidden" },
      elements: [{
        id: "cover-composer-canvas",
        type: "composerCanvas",
        props: { document: coverDocument },
        style: { width: "100%", height: "100%" },
      }],
    }],
  };

  const pages = buildIssuePages(issueId, options, cover);

  // Issue 001 interactive interlude: preserve the 64-page count while replacing
  // three late-issue pages with native game / quiz / puzzle experiences.
  const interactiveTitles: Record<string, string> = {
    "november-events": "Play · City Dash",
    "xpomag-12": "Quiz · Read the City",
    "ad-thread": "Puzzle · Unscramble the City",
  };
  pages.forEach((page) => {
    const nextTitle = interactiveTitles[page.slug];
    if (nextTitle) page.title = nextTitle;
  });

  return {
    id: issueId,
    slug: issueId,
    city: editionCity,
    title: `${editionCity} — Issue 001`,
    issueLabel: "Issue 001",
    monthLabel: "November 2026",
    metadata: {
      edition: editionCity,
      issueNumber: 1,
      publicationFrequency: "monthly",
      demo: true,
      coverArtDirection: "editorial-portrait",
      theme: "The City Is Open",
      pageCount: 64,
      reportingWindow: "First-pass editorial master · September 2026. Public facts require final verification before publication.",
    },
    resources: {
      fonts: [
        { id: "ui-sans", family: "Geist", weight: "100 900", preload: true },
        { id: "editorial-serif", family: "Georgia", preload: false },
      ],
      images: (options.alphaCoverAssets ?? []).slice(0, 12).map((src, index) => ({
        id: `alpha-subject-${index + 1}`,
        src,
        preload: index === 0,
        fetchPriority: index === 0 ? "high" as const : "auto" as const,
      })),
      styles: [],
    },
    colors: {
      ink: "#090909",
      paper: "#f3f1eb",
      lemon: "#d8ff52",
      cobalt: "#3157ff",
      rose: "#f5b7cd",
      midnight: "#18203d",
      coverMist: "#d8d9d5",
    },
    fonts: { sans, editorial: serif },
    styles: { pagePadding: pad, hairline: "rgba(0,0,0,.18)", coverRailWidth: "22%" },
    designElements: {
      masthead: { id: "global-masthead", type: "brandMark", props: { label: "XpoMag" } },
    },
    pages,
  };
}

export function getDemoMagazineBySlug(issueSlug: string, options: DemoMagazineOptions = {}): DemoMagazineIssue {
  const cityPart = issueSlug.replace(/^demo-/, "").replace(/-001$/, "");
  const city = cityPart
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Johannesburg";
  return selectDemoMagazine(city, options);
}
